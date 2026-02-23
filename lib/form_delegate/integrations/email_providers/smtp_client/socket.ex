defmodule FormDelegate.Integrations.EmailProviders.SMTPClient.Socket do
  @behaviour FormDelegate.Integrations.EmailProviders.SMTPClient

  @default_timeout_ms 5_000
  @default_helo_domain "formdelegate.local"

  @moduledoc """
  Verifies SMTP credentials by performing a minimal SMTP session over sockets.

  This module is used by provider verification only; it does not send integration emails.
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
end
