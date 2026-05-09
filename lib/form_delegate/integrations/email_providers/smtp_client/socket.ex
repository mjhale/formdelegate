defmodule FormDelegate.Integrations.EmailProviders.SMTPClient.Socket do
  @behaviour FormDelegate.Integrations.EmailProviders.SMTPClient

  alias Bamboo.Email
  alias FormDelegate.Integrations.EmailProviders.Shared

  @default_timeout_ms 5_000
  @default_helo_domain "formdelegate.local"

  @moduledoc """
  Verifies SMTP credentials and sends email over sockets with AUTH support.
  """

  @impl true
  def verify(%{host: host, port: port, username: username, password: password} = params) do
    timeout = Map.get(params, :timeout_ms, @default_timeout_ms)
    helo_domain = Map.get(params, :helo_domain, @default_helo_domain)
    use_ssl = Map.get(params, :use_ssl, port == 465)

    # Connect, greet with EHLO, optionally upgrade via STARTTLS, then authenticate.
    with {:ok, socket, transport} <- connect(host, port, use_ssl, timeout),
         {:ok, _greeting} <- read_response(transport, socket, timeout, [220]),
         {:ok, ehlo_lines} <-
           command(transport, socket, "EHLO #{helo_domain}\r\n", timeout, [250]),
         capabilities <- parse_capabilities(ehlo_lines),
         {:ok, socket, transport, capabilities} <-
           maybe_starttls(transport, socket, capabilities, helo_domain, timeout),
         :ok <- authenticate(transport, socket, capabilities, username, password, timeout),
         {:ok, _quit_response} <- command(transport, socket, "QUIT\r\n", timeout, [221]) do
      :ok
    else
      {:error, reason} -> {:error, reason}
    end
  end

  @spec deliver(
          %{
            required(:host) => String.t(),
            required(:port) => pos_integer(),
            required(:username) => String.t(),
            required(:password) => String.t(),
            required(:from_address) => String.t(),
            optional(:timeout_ms) => pos_integer(),
            optional(:helo_domain) => String.t(),
            optional(:use_ssl) => boolean()
          },
          Email.t()
        ) :: :ok | {:error, String.t()}
  def deliver(
        %{
          host: host,
          port: port,
          username: username,
          password: password,
          from_address: from_address
        } =
          params,
        %Email{} = email
      ) do
    timeout = Map.get(params, :timeout_ms, @default_timeout_ms)
    helo_domain = Map.get(params, :helo_domain, @default_helo_domain)
    use_ssl = Map.get(params, :use_ssl, port == 465)

    # SMTP envelope recipients are all unique addresses across To/Cc/Bcc.
    recipients = gather_recipient_emails(email)

    # Full SMTP send flow: connect -> EHLO/STARTTLS -> AUTH -> envelope -> DATA -> QUIT.
    with :ok <- ensure_recipients_present(recipients),
         {:ok, socket, transport} <- connect(host, port, use_ssl, timeout),
         {:ok, _greeting} <- read_response(transport, socket, timeout, [220]),
         {:ok, ehlo_lines} <-
           command(transport, socket, "EHLO #{helo_domain}\r\n", timeout, [250]),
         capabilities <- parse_capabilities(ehlo_lines),
         {:ok, socket, transport, capabilities} <-
           maybe_starttls(transport, socket, capabilities, helo_domain, timeout),
         :ok <- authenticate(transport, socket, capabilities, username, password, timeout),
         :ok <- send_mail(transport, socket, from_address, recipients, email, timeout),
         {:ok, _quit_response} <- command(transport, socket, "QUIT\r\n", timeout, [221]) do
      :ok
    else
      {:error, reason} -> {:error, reason}
    end
  end

  defp connect(host, port, true, timeout) do
    ssl_opts = [active: false, packet: :line, verify: :verify_none]

    case :ssl.connect(String.to_charlist(host), port, ssl_opts, timeout) do
      {:ok, socket} -> {:ok, socket, :ssl}
      {:error, reason} -> {:error, "smtp connection failed: #{inspect(reason)}"}
    end
  end

  defp connect(host, port, false, timeout) do
    tcp_opts = [:binary, active: false, packet: :line]

    case :gen_tcp.connect(String.to_charlist(host), port, tcp_opts, timeout) do
      {:ok, socket} -> {:ok, socket, :gen_tcp}
      {:error, reason} -> {:error, "smtp connection failed: #{inspect(reason)}"}
    end
  end

  defp maybe_starttls(:ssl = transport, socket, capabilities, _helo_domain, _timeout) do
    # Already using TLS (commonly SMTPS on port 465), so no STARTTLS step is needed.
    {:ok, socket, transport, capabilities}
  end

  defp maybe_starttls(:gen_tcp = transport, socket, capabilities, helo_domain, timeout) do
    if Enum.member?(capabilities, "STARTTLS") do
      with {:ok, _} <- command(transport, socket, "STARTTLS\r\n", timeout, [220]),
           {:ok, secure_socket} <- upgrade_to_tls(socket, timeout),
           {:ok, tls_ehlo_lines} <-
             command(:ssl, secure_socket, "EHLO #{helo_domain}\r\n", timeout, [250]) do
        {:ok, secure_socket, :ssl, parse_capabilities(tls_ehlo_lines)}
      end
    else
      {:ok, socket, transport, capabilities}
    end
  end

  defp upgrade_to_tls(socket, timeout) do
    ssl_opts = [active: false, packet: :line, verify: :verify_none]

    case :ssl.connect(socket, ssl_opts, timeout) do
      {:ok, secure_socket} -> {:ok, secure_socket}
      {:error, reason} -> {:error, "smtp TLS upgrade failed: #{inspect(reason)}"}
    end
  end

  defp authenticate(transport, socket, capabilities, username, password, timeout) do
    # Use the strongest common auth path first.
    auth_methods =
      capabilities
      |> Enum.filter(&String.starts_with?(&1, "AUTH "))
      |> Enum.flat_map(fn capability ->
        capability
        |> String.trim_leading("AUTH ")
        |> String.split(" ", trim: true)
      end)

    cond do
      Enum.member?(auth_methods, "PLAIN") ->
        auth_plain(transport, socket, username, password, timeout)

      Enum.member?(auth_methods, "LOGIN") ->
        auth_login(transport, socket, username, password, timeout)

      true ->
        {:error, "smtp server does not support AUTH PLAIN/LOGIN"}
    end
  end

  defp send_mail(transport, socket, from_address, recipients, email, timeout) do
    # Use provider-configured sender for the SMTP envelope sender (MAIL FROM),
    # then issue RCPT TO for each recipient before writing message DATA.
    with {:ok, _} <-
           command(
             transport,
             socket,
             "MAIL FROM:<#{sanitize_envelope_address(from_address)}>\r\n",
             timeout,
             [250]
           ),
         :ok <- add_recipients(transport, socket, recipients, timeout),
         {:ok, _} <- command(transport, socket, "DATA\r\n", timeout, [354]),
         :ok <- send_data_payload(transport, socket, from_address, email),
         {:ok, _} <- read_response(transport, socket, timeout, [250]) do
      :ok
    end
  end

  defp add_recipients(transport, socket, recipients, timeout) do
    # Any rejected recipient fails the delivery attempt for the submission email.
    Enum.reduce_while(recipients, :ok, fn recipient, :ok ->
      case command(
             transport,
             socket,
             "RCPT TO:<#{sanitize_envelope_address(recipient)}>\r\n",
             timeout,
             [250, 251]
           ) do
        {:ok, _} -> {:cont, :ok}
        {:error, reason} -> {:halt, {:error, reason}}
      end
    end)
  end

  defp send_data_payload(transport, socket, from_address, email) do
    # SMTP DATA requires RFC822-style headers + MIME body and dot-stuffed lines.
    message =
      email
      |> build_rfc822_message(from_address)
      |> dot_stuff()
      |> Kernel.<>("\r\n.\r\n")

    send_payload(transport, socket, message)
  end

  defp auth_plain(transport, socket, username, password, timeout) do
    encoded = Base.encode64(<<0, username::binary, 0, password::binary>>)

    case command(transport, socket, "AUTH PLAIN #{encoded}\r\n", timeout, [235]) do
      {:ok, _} -> :ok
      {:error, reason} -> {:error, "smtp AUTH PLAIN failed: #{reason}"}
    end
  end

  defp auth_login(transport, socket, username, password, timeout) do
    with {:ok, _} <- command(transport, socket, "AUTH LOGIN\r\n", timeout, [334]),
         {:ok, _} <- command(transport, socket, "#{Base.encode64(username)}\r\n", timeout, [334]),
         {:ok, _} <- command(transport, socket, "#{Base.encode64(password)}\r\n", timeout, [235]) do
      :ok
    else
      {:error, reason} -> {:error, "smtp AUTH LOGIN failed: #{reason}"}
    end
  end

  defp command(transport, socket, command, timeout, accepted_codes) do
    with :ok <- send_line(transport, socket, command),
         {:ok, response_lines} <- read_response(transport, socket, timeout, accepted_codes) do
      {:ok, response_lines}
    end
  end

  defp send_line(:ssl, socket, line) do
    case :ssl.send(socket, line) do
      :ok -> :ok
      {:error, reason} -> {:error, "smtp write failed: #{inspect(reason)}"}
    end
  end

  defp send_line(:gen_tcp, socket, line) do
    case :gen_tcp.send(socket, line) do
      :ok -> :ok
      {:error, reason} -> {:error, "smtp write failed: #{inspect(reason)}"}
    end
  end

  defp send_payload(:ssl, socket, payload) do
    case :ssl.send(socket, payload) do
      :ok -> :ok
      {:error, reason} -> {:error, "smtp write failed: #{inspect(reason)}"}
    end
  end

  defp send_payload(:gen_tcp, socket, payload) do
    case :gen_tcp.send(socket, payload) do
      :ok -> :ok
      {:error, reason} -> {:error, "smtp write failed: #{inspect(reason)}"}
    end
  end

  defp read_response(transport, socket, timeout, accepted_codes) do
    # Handles SMTP multi-line responses where intermediate lines use "-" after status code.
    do_read_response(transport, socket, timeout, accepted_codes, [])
  end

  defp do_read_response(transport, socket, timeout, accepted_codes, lines) do
    with {:ok, raw_line} <- recv_line(transport, socket, timeout),
         {:ok, code, continuation, line} <- parse_response_line(raw_line) do
      updated_lines = [line | lines]

      cond do
        continuation ->
          do_read_response(transport, socket, timeout, accepted_codes, updated_lines)

        code in accepted_codes ->
          {:ok, Enum.reverse(updated_lines)}

        true ->
          {:error, "unexpected SMTP status #{code}"}
      end
    end
  end

  defp recv_line(:ssl, socket, timeout) do
    case :ssl.recv(socket, 0, timeout) do
      {:ok, line} -> {:ok, line}
      {:error, reason} -> {:error, "smtp read failed: #{inspect(reason)}"}
    end
  end

  defp recv_line(:gen_tcp, socket, timeout) do
    case :gen_tcp.recv(socket, 0, timeout) do
      {:ok, line} -> {:ok, line}
      {:error, reason} -> {:error, "smtp read failed: #{inspect(reason)}"}
    end
  end

  defp parse_response_line(line) do
    trimmed = String.trim(line)

    case Regex.run(~r/^(\d{3})([\s-])(.*)$/, trimmed) do
      [_, code, delimiter, text] ->
        {:ok, String.to_integer(code), delimiter == "-", text}

      _ ->
        {:error, "invalid SMTP response line: #{inspect(trimmed)}"}
    end
  end

  defp parse_capabilities(lines) do
    # Normalize EHLO capability lines for simple case-insensitive lookups.
    lines
    |> Enum.map(&String.trim/1)
    |> Enum.reject(&(&1 == ""))
    |> Enum.map(&String.upcase/1)
  end

  defp build_rfc822_message(%Email{} = email, from_address) do
    # Convert Bamboo address structures into RFC822 header strings.
    to_header =
      email.to
      |> Shared.normalize_recipients()
      |> Enum.map(&Shared.format_recipient_for_header/1)
      |> Enum.join(", ")

    cc_header =
      email.cc
      |> Shared.normalize_recipients()
      |> Enum.map(&Shared.format_recipient_for_header/1)
      |> Enum.join(", ")

    subject = sanitize_header(email.subject || "")
    {mime_headers, body} = build_mime_body(email)

    # Headers are sanitized to prevent CRLF/header injection.
    headers =
      [
        "From: #{sanitize_header(from_address)}",
        "To: #{sanitize_header(to_header)}",
        (cc_header == "" && nil) || "Cc: #{sanitize_header(cc_header)}",
        "Subject: #{subject}",
        "MIME-Version: 1.0"
      ]
      |> Kernel.++(mime_headers)
      |> Enum.reject(&is_nil/1)

    Enum.join(headers ++ ["", body], "\r\n")
  end

  defp build_mime_body(%Email{} = email) do
    text_body = normalize_body(email.text_body)
    html_body = normalize_body(email.html_body)

    cond do
      # Prefer multipart/alternative when both text and html are present.
      text_body != "" and html_body != "" ->
        boundary = "fd-boundary-#{System.unique_integer([:positive])}"

        {["Content-Type: multipart/alternative; boundary=\"#{boundary}\""],
         Enum.join(
           [
             "--#{boundary}",
             "Content-Type: text/plain; charset=UTF-8",
             "Content-Transfer-Encoding: 8bit",
             "",
             text_body,
             "--#{boundary}",
             "Content-Type: text/html; charset=UTF-8",
             "Content-Transfer-Encoding: 8bit",
             "",
             html_body,
             "--#{boundary}--"
           ],
           "\r\n"
         )}

      html_body != "" ->
        # Fall back to html-only message.
        {["Content-Type: text/html; charset=UTF-8", "Content-Transfer-Encoding: 8bit"], html_body}

      true ->
        # Default to text/plain when html is missing.
        {["Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: 8bit"],
         text_body}
    end
  end

  defp gather_recipient_emails(%Email{} = email) do
    [email.to, email.cc, email.bcc]
    |> Enum.flat_map(&Shared.normalize_recipients/1)
    |> Enum.map(& &1.email)
    |> Enum.reject(&is_nil/1)
    |> Enum.uniq()
  end

  defp ensure_recipients_present([]),
    do: {:error, "smtp delivery requires at least one recipient"}

  defp ensure_recipients_present(_recipients), do: :ok

  defp sanitize_header(value) do
    value
    |> to_string()
    |> String.replace(~r/[\r\n]+/, " ")
    |> String.trim()
  end

  defp sanitize_envelope_address(value) do
    value
    |> to_string()
    |> String.replace(~r/[\r\n<>]+/, "")
    |> String.trim()
  end

  defp normalize_body(nil), do: ""
  defp normalize_body(body), do: to_string(body)

  defp dot_stuff(payload) do
    # Escape lines that begin with "." per RFC 5321 section 4.5.2.
    payload
    |> String.replace("\r\n", "\n")
    |> String.replace("\r", "\n")
    |> String.split("\n", trim: false)
    |> Enum.map(fn line ->
      if String.starts_with?(line, "."), do: ".#{line}", else: line
    end)
    |> Enum.join("\r\n")
  end
end
