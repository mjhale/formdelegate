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
      name: form.name,
      host: form.host,
      verified: form.verified,
    }
  end
end
