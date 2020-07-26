defmodule FormDelegateWeb.FormView do
  use FormDelegateWeb, :view
  alias FormDelegateWeb.{FormIntegrationView, FormView}

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
      form_integrations:
        render_many(
          form.form_integrations,
          FormIntegrationView,
          "form_integration.json"
        ),
      hosts: form.hosts,
      id: form.id,
      inserted_at: form.inserted_at,
      name: form.name,
      submission_count: form.submission_count,
      updated_at: form.updated_at,
      verified: form.verified
    }
  end
end
