defmodule FormDelegate.Integrations.EmailProviderSMTPTest do
  use ExUnit.Case, async: true

  alias FormDelegate.Integrations.EmailProviders.SMTP

  defmodule SMTPClientSuccess do
    def verify(_params), do: :ok
  end

  defmodule SMTPClientFailure do
    def verify(_params), do: {:error, "smtp AUTH PLAIN failed: unexpected SMTP status 535"}
  end

  setup do
    previous_client = Application.get_env(:form_delegate, :email_provider_smtp_client)

    on_exit(fn ->
      if previous_client do
        Application.put_env(:form_delegate, :email_provider_smtp_client, previous_client)
      else
        Application.delete_env(:form_delegate, :email_provider_smtp_client)
      end
    end)

    :ok
  end

  test "returns :ok for valid config and successful SMTP auth" do
    Application.put_env(:form_delegate, :email_provider_smtp_client, SMTPClientSuccess)

    assert :ok =
             SMTP.verify_credentials(
               %{
                 "host" => "smtp.example.com",
                 "port" => 587,
                 "username" => "mailer@example.com",
                 "from_address" => "mailer@example.com"
               },
               %{"password" => "secret"}
             )
  end

  test "returns provider verification error when SMTP auth fails" do
    Application.put_env(:form_delegate, :email_provider_smtp_client, SMTPClientFailure)

    assert {:error, "smtp AUTH PLAIN failed: unexpected SMTP status 535"} =
             SMTP.verify_credentials(
               %{
                 "host" => "smtp.example.com",
                 "port" => "587",
                 "username" => "mailer@example.com",
                 "from_address" => "mailer@example.com"
               },
               %{"password" => "secret"}
             )
  end

  test "returns invalid SMTP port error for malformed port" do
    Application.put_env(:form_delegate, :email_provider_smtp_client, SMTPClientSuccess)

    assert {:error, "invalid SMTP port"} =
             SMTP.verify_credentials(
               %{
                 "host" => "smtp.example.com",
                 "port" => "not-a-number",
                 "username" => "mailer@example.com",
                 "from_address" => "mailer@example.com"
               },
               %{"password" => "secret"}
             )
  end

  test "returns missing field errors before SMTP verification" do
    assert {:error, "missing required value: host"} =
             SMTP.verify_credentials(
               %{
                 "port" => 587,
                 "username" => "mailer@example.com",
                 "from_address" => "mailer@example.com"
               },
               %{"password" => "secret"}
             )

    assert {:error, "missing required value: password"} =
             SMTP.verify_credentials(
               %{
                 "host" => "smtp.example.com",
                 "port" => 587,
                 "username" => "mailer@example.com",
                 "from_address" => "mailer@example.com"
               },
               %{}
             )
  end
end
