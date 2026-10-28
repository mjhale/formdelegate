defmodule FormDelegate.Integrations.SMTPDeliveryAcceptanceTest do
  use ExUnit.Case, async: true

  alias FormDelegate.Integrations.EmailProviders.SMTPClient.Socket

  for quit_behavior <- [:close, :error, :silent] do
    test "preserves accepted DATA when QUIT is #{quit_behavior}" do
      {port, server} = smtp_server(unquote(quit_behavior), "250 Accepted\r\n")
      assert :ok = Socket.deliver(params(port), email())
      assert :accepted = Task.await(server, 2_000)
    end
  end

  test "a rejected final DATA response remains a delivery failure" do
    {port, server} = smtp_server(:close, "550 Message rejected\r\n")
    assert {:error, "unexpected SMTP status 550"} = Socket.deliver(params(port), email())
    assert :rejected = Task.await(server, 2_000)
  end

  defp smtp_server(quit_behavior, final_response) do
    {:ok, listener} =
      :gen_tcp.listen(0, [:binary, active: false, packet: :line, ip: {127, 0, 0, 1}])

    {:ok, {_address, port}} = :inet.sockname(listener)
    on_exit(fn -> :gen_tcp.close(listener) end)

    server =
      Task.async(fn ->
        {:ok, socket} = :gen_tcp.accept(listener, 1_000)

        try do
          :ok = :gen_tcp.send(socket, "220 Local test receiver\r\n")
          expect_command(socket, "EHLO", "250 AUTH PLAIN\r\n")
          expect_command(socket, "AUTH PLAIN", "235 Authenticated\r\n")
          expect_command(socket, "MAIL FROM", "250 Sender accepted\r\n")
          expect_command(socket, "RCPT TO", "250 Recipient accepted\r\n")
          expect_command(socket, "DATA", "354 Send message\r\n")
          read_message(socket)
          :ok = :gen_tcp.send(socket, final_response)

          if String.starts_with?(final_response, "250") do
            finish_session(socket, quit_behavior)
            :accepted
          else
            :rejected
          end
        after
          :gen_tcp.close(socket)
          :gen_tcp.close(listener)
        end
      end)

    {port, server}
  end

  defp expect_command(socket, prefix, response) do
    {:ok, line} = :gen_tcp.recv(socket, 0, 1_000)
    assert String.starts_with?(line, prefix)
    :ok = :gen_tcp.send(socket, response)
  end

  defp read_message(socket) do
    case :gen_tcp.recv(socket, 0, 1_000) do
      {:ok, ".\r\n"} -> :ok
      {:ok, _line} -> read_message(socket)
    end
  end

  defp finish_session(_socket, :close), do: :ok

  defp finish_session(socket, behavior) do
    {:ok, "QUIT\r\n"} = :gen_tcp.recv(socket, 0, 1_000)
    if behavior == :error, do: :gen_tcp.send(socket, "500 QUIT failed\r\n")
    # The client must close promptly after acceptance even if QUIT is unanswered.
    assert {:error, :closed} = :gen_tcp.recv(socket, 0, 1_000)
  end

  defp params(port) do
    %{
      host: "127.0.0.1",
      port: port,
      use_ssl: false,
      username: "test",
      password: "synthetic",
      from_address: "sender@example.test",
      timeout_ms: 200
    }
  end

  defp email do
    Bamboo.Email.new_email(
      to: "owner@example.test",
      subject: "Local acceptance test",
      text_body: "Synthetic message"
    )
  end
end
