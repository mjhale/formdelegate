defmodule FormDelegate.FormView do
  use FormDelegate.Web, :view

  def render("index.json", %{forms: forms}) do
    %{data: render_many(forms, FormDelegate.FormView, "form.json")}
  end

  def render("show.json", %{form: form}) do
    %{data: render_one(form, FormDelegate.FormView, "form.json")}
  end

  def render("form.json", %{form: form}) do
    %{
      id: form.id,
      form: form.form,
      form_integrations: render_many(
        form.form_integrations,
        FormDelegate.FormIntegrationView,
        "form_integration.json"
      ),
      host: form.host,
      integrations: render_many(
        form.integrations,
        FormDelegate.IntegrationView,
        "integration.json"
      ),
      message_count: form.message_count,
      verified: form.verified,
      inserted_at: form.inserted_at,
      updated_at: form.updated_at,
    }
  end
end
