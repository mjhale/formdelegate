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
      id: form.id,
      form: form.form,
      form_integrations: render_many(
        form.form_integrations,
        FormIntegrationView,
        "form_integration.json"
      ),
      host: form.host,
      message_count: form.message_count,
      verified: form.verified,
      inserted_at: form.inserted_at,
      updated_at: form.updated_at,
    }
  end
end
