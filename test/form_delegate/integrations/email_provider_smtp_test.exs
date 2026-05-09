defmodule FormDelegate.Integrations.EmailProviderSMTPTest do
  use ExUnit.Case, async: true

  alias FormDelegate.Integrations.EmailProviders.SMTP

  defmodule SMTPClientSuccess do
    def verify(_params), do: :ok
  end

  defmodule SMTPClientFailure do
    def verify(_params), do: {:error, "smtp AUTH PLAIN failed: unexpected SMTP status 535"}
  end

  defmodule SMTPDeliveryClientSuccess do
    def deliver(params, email) do
      send(self(), {:smtp_delivery, params, email})
      :ok
    end
  end

  setup do
    previous_client = Application.get_env(:form_delegate, :email_provider_smtp_client)

    previous_delivery_client =
      Application.get_env(:form_delegate, :email_provider_smtp_delivery_client)

    on_exit(fn ->
      if previous_client do
        Application.put_env(:form_delegate, :email_provider_smtp_client, previous_client)
      else
        Application.delete_env(:form_delegate, :email_provider_smtp_client)
      end

      if previous_delivery_client do
        Application.put_env(
          :form_delegate,
          :email_provider_smtp_delivery_client,
          previous_delivery_client
        )
      else
        Application.delete_env(:form_delegate, :email_provider_smtp_delivery_client)
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

  test "delivers submission email using configured SMTP delivery client" do
    Application.put_env(
      :form_delegate,
      :email_provider_smtp_delivery_client,
      SMTPDeliveryClientSuccess
    )

    integration = %FormDelegate.Integrations.EmailIntegration{
      email_provider: :smtp,
      email_provider_config: %{
        "host" => "smtp.example.com",
        "port" => "587",
        "username" => "mailer@example.com",
        "from_address" => "mailer@example.com"
      },
      email_provider_secrets: %{"password" => "secret"}
    }

    email =
      %Bamboo.Email{}
      |> Bamboo.Email.to({"Owner", "owner@example.com"})
      |> Bamboo.Email.subject("New Form Submission")
      |> Bamboo.Email.text_body("Hello")

    assert {:ok, %{provider: :smtp}} = SMTP.deliver_submission_email(integration, email)
    assert_receive {:smtp_delivery, params, delivered_email}
    assert params.port == 587
    assert delivered_email.subject == "New Form Submission"
  end
end
