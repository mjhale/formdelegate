defmodule FormDelegate.Integrations.EmailDispatcherTest do
  use ExUnit.Case, async: false

  alias Bamboo.Email
  alias FormDelegate.Integrations.EmailDispatcher
  alias FormDelegate.Integrations.EmailIntegration

  defmodule HTTPClientCapture do
    def get(_url, _headers), do: {:ok, 200, %{}}

    def post(url, headers, body) do
      send(self(), {:http_post, url, headers, body})
      {:ok, 200, %{}}
    end
  end

  setup do
    previous_http_client = Application.get_env(:form_delegate, :email_provider_http_client)

    previous_smtp_delivery_client =
      Application.get_env(:form_delegate, :email_provider_smtp_delivery_client)

    Application.put_env(:form_delegate, :email_provider_http_client, HTTPClientCapture)

    Application.put_env(
      :form_delegate,
      :email_provider_smtp_delivery_client,
      __MODULE__.SMTPDeliveryClientCapture
    )

    on_exit(fn ->
      if previous_http_client do
        Application.put_env(:form_delegate, :email_provider_http_client, previous_http_client)
      else
        Application.delete_env(:form_delegate, :email_provider_http_client)
      end

      if previous_smtp_delivery_client do
        Application.put_env(
          :form_delegate,
          :email_provider_smtp_delivery_client,
          previous_smtp_delivery_client
        )
      else
        Application.delete_env(:form_delegate, :email_provider_smtp_delivery_client)
      end
    end)

    :ok
  end

  defmodule SMTPDeliveryClientCapture do
    def deliver(params, email) do
      send(self(), {:smtp_deliver, params, email})
      :ok
    end
  end

  test "dispatches submission email via postmark provider" do
    integration = %EmailIntegration{
      id: "integration-1",
      email_provider: :postmark,
      email_provider_config: %{
        "from_address" => "mailer@example.com",
        "message_stream" => "outbound"
      },
      email_provider_secrets: %{"server_token" => "token"}
    }

    email =
      %Email{}
      |> Email.to({"Owner", "owner@example.com"})
      |> Email.cc({"CC User", "cc@example.com"})
      |> Email.bcc({"BCC User", "bcc@example.com"})
      |> Email.subject("New Form Submission")
      |> Email.html_body("<p>Hello</p>")
      |> Email.text_body("Hello")

    assert {:ok, %{provider: :postmark}} =
             EmailDispatcher.deliver_submission_email(integration, email)

    assert_receive {:http_post, "https://api.postmarkapp.com/email", headers, body}

    assert {"x-postmark-server-token", "token"} in headers
    assert body["From"] == "mailer@example.com"
    assert body["To"] == "Owner <owner@example.com>"
    assert body["Subject"] == "New Form Submission"
    assert body["MessageStream"] == "outbound"
  end

  test "lets Postmark use its default transactional stream" do
    integration = %EmailIntegration{
      id: "integration-default-stream",
      email_provider: :postmark,
      email_provider_config: %{
        "from_address" => "mailer@example.com",
        "message_stream" => "   "
      },
      email_provider_secrets: %{"server_token" => "token"}
    }

    email =
      %Email{}
      |> Email.to({"Owner", "owner@example.com"})
      |> Email.subject("New Form Submission")
      |> Email.text_body("Hello")

    assert {:ok, %{provider: :postmark}} =
             EmailDispatcher.deliver_submission_email(integration, email)

    assert_receive {:http_post, "https://api.postmarkapp.com/email", _headers, body}
    refute Map.has_key?(body, "MessageStream")
  end

  test "dispatches submission email via sendgrid provider" do
    integration = %EmailIntegration{
      id: "integration-2",
      email_provider: :sendgrid,
      email_provider_config: %{"from_address" => "mailer@example.com"},
      email_provider_secrets: %{"api_key" => "token"}
    }

    email =
      %Email{}
      |> Email.to({"Owner", "owner@example.com"})
      |> Email.subject("New Form Submission")
      |> Email.html_body("<p>Hello</p>")
      |> Email.text_body("Hello")

    assert {:ok, %{provider: :sendgrid}} =
             EmailDispatcher.deliver_submission_email(integration, email)

    assert_receive {:http_post, "https://api.sendgrid.com/v3/mail/send", headers, body}

    assert {"authorization", "Bearer token"} in headers
    assert body["from"]["email"] == "mailer@example.com"
    assert body["personalizations"] |> hd() |> Map.fetch!("subject") == "New Form Submission"
    assert body["content"] |> Enum.any?(&(&1["type"] == "text/plain"))
    assert body["content"] |> Enum.any?(&(&1["type"] == "text/html"))
  end

  test "returns unsupported provider error when provider is unknown" do
    integration = %EmailIntegration{email_provider: nil}

    assert {:error, "unsupported email provider"} =
             EmailDispatcher.deliver_submission_email(integration, %Email{})
  end

  test "dispatches submission email via smtp provider" do
    integration = %EmailIntegration{
      email_provider: :smtp,
      email_provider_config: %{
        "host" => "smtp.example.com",
        "port" => 587,
        "username" => "mailer@example.com",
        "from_address" => "mailer@example.com"
      },
      email_provider_secrets: %{"password" => "secret"}
    }

    email =
      %Email{}
      |> Email.to({"Owner", "owner@example.com"})
      |> Email.subject("New Form Submission")
      |> Email.text_body("Hello")

    assert {:ok, %{provider: :smtp}} =
             EmailDispatcher.deliver_submission_email(integration, email)

    assert_receive {:smtp_deliver, params, delivered_email}
    assert params.host == "smtp.example.com"
    assert params.port == 587
    assert params.from_address == "mailer@example.com"
    assert delivered_email.subject == "New Form Submission"
  end
end
