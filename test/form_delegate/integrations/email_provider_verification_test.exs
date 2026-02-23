defmodule FormDelegate.Integrations.EmailProviderVerificationTest do
  use ExUnit.Case, async: true

  alias FormDelegate.Integrations.EmailProviders.{Postmark, SendGrid}

  defmodule HTTPClientSuccess do
    def get(_url, _headers), do: {:ok, 200, %{}}
  end

  defmodule HTTPClientUnauthorized do
    def get(_url, _headers), do: {:ok, 401, %{}}
  end

  defmodule HTTPClientForbidden do
    def get(_url, _headers), do: {:ok, 403, %{}}
  end

  setup do
    previous_client = Application.get_env(:form_delegate, :email_provider_http_client)

    on_exit(fn ->
      if previous_client do
        Application.put_env(:form_delegate, :email_provider_http_client, previous_client)
      else
        Application.delete_env(:form_delegate, :email_provider_http_client)
      end
    end)

    :ok
  end

  describe "Postmark.verify_credentials/2" do
    test "returns :ok when credentials are valid" do
      Application.put_env(:form_delegate, :email_provider_http_client, HTTPClientSuccess)

      assert :ok =
               Postmark.verify_credentials(
                 %{"from_address" => "mailer@example.com", "message_stream" => "outbound"},
                 %{"server_token" => "token"}
               )
    end

    test "returns invalid credentials error for 401" do
      Application.put_env(:form_delegate, :email_provider_http_client, HTTPClientUnauthorized)

      assert {:error, "invalid postmark credentials"} =
               Postmark.verify_credentials(
                 %{"from_address" => "mailer@example.com", "message_stream" => "outbound"},
                 %{"server_token" => "token"}
               )
    end

    test "returns missing config errors before HTTP verification" do
      assert {:error, "missing required value: from_address"} =
               Postmark.verify_credentials(%{"message_stream" => "outbound"}, %{
                 "server_token" => "token"
               })

      assert {:error, "missing required value: server_token"} =
               Postmark.verify_credentials(
                 %{"from_address" => "mailer@example.com", "message_stream" => "outbound"},
                 %{}
               )
    end
  end

  describe "SendGrid.verify_credentials/2" do
    test "returns :ok when credentials are valid" do
      Application.put_env(:form_delegate, :email_provider_http_client, HTTPClientSuccess)

      assert :ok =
               SendGrid.verify_credentials(
                 %{"from_address" => "mailer@example.com"},
                 %{"api_key" => "token"}
               )
    end

    test "returns invalid credentials error for 403" do
      Application.put_env(:form_delegate, :email_provider_http_client, HTTPClientForbidden)

      assert {:error, "invalid sendgrid credentials"} =
               SendGrid.verify_credentials(
                 %{"from_address" => "mailer@example.com"},
                 %{"api_key" => "token"}
               )
    end

    test "returns missing config errors before HTTP verification" do
      assert {:error, "missing required value: from_address"} =
               SendGrid.verify_credentials(%{}, %{"api_key" => "token"})

      assert {:error, "missing required value: api_key"} =
               SendGrid.verify_credentials(%{"from_address" => "mailer@example.com"}, %{})
    end
  end
end
