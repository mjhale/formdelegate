defmodule FormDelegateWeb.FormView do
  use FormDelegateWeb, :view
  alias FormDelegateWeb.{FormEmailIntegrationView, FormView}

  def render("index.json", %{forms: forms}) do
    %{data: render_many(forms, FormView, "form.json")}
  end

  def render("show.json", %{form: form}) do
    %{data: render_one(form, FormView, "form.json")}
  end

  def render("form.json", %{form: form}) do
    %{
      callback_success_includes_data: form.callback_success_includes_data,
      callback_success_url: form.callback_success_url,
      email_integrations:
        render_many(
          form.email_integrations,
          FormEmailIntegrationView,
          "form_email_integration.json",
          as: :email_integration
        ),
      webhook_integrations:
        Enum.map(form.webhook_integrations, fn webhook ->
          %{
            id: webhook.id,
            enabled: webhook.enabled,
            url: webhook.url,
            has_signing_secret: is_binary(webhook.signing_secret) and webhook.signing_secret != ""
          }
        end),
      hosts: form.hosts,
      id: form.id,
      inserted_at: form.inserted_at,
      name: form.name,
      spam_filter_mode: form.spam_filter_mode,
      submission_source_policy: form.submission_source_policy,
      submission_count: form.submission_count,
      updated_at: form.updated_at,
      verified: form.verified
    }
  end
end
