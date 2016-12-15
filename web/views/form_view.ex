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
      host: form.host,
      verified: form.verified,
      form_integrations: render_many(
        form.form_integrations,
        FormDelegate.FormIntegrationView,
        "form_integration.json"
      ),
      integrations: render_many(
        form.integrations,
        FormDelegate.IntegrationView,
        "integration.json"
      ),
      inserted_at: form.inserted_at,
      updated_at: form.updated_at,
    }
  end
end
