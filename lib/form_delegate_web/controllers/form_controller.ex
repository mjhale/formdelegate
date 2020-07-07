defmodule FormDelegateWeb.FormController do
  use FormDelegateWeb, :controller

  alias FormDelegate.{Forms, Forms.Form}
  alias FormDelegateWeb.Authorizer

  action_fallback FormDelegateWeb.FallbackController

  def action(%Plug.Conn{assigns: %{current_user: current_user}} = conn, _opts) do
    args = [conn, conn.params, current_user]
    apply(__MODULE__, action_name(conn), args)
  end

  def index(conn, _params, current_user) do
    with :ok <- Authorizer.authorize(:show_user_forms, current_user) do
      forms = Forms.list_forms_of_user(current_user)
      render(conn, "index.json", forms: forms)
    end
  end

  def create(conn, %{"form" => form_params}, current_user) do
    with :ok <- Authorizer.authorize(:create_form, current_user),
         {:ok, %Form{} = form} <- Forms.create_form(form_params, current_user) do
      form =
        FormDelegate.Repo.preload(form, [
          [form_integrations: [:email_integration_recipients, :integration]],
          :user
        ])

      conn
      |> put_status(:created)
      |> put_resp_header("location", Routes.form_path(conn, :show, form.id))
      |> render("show.json", form: form)
    end
  end

  def show(conn, %{"id" => id}, current_user) do
    with %Form{} = form <- Forms.get_form!(id),
         :ok <- Authorizer.authorize(:show_form, current_user, form) do
      render(conn, "show.json", form: form)
    end
  end

  def update(conn, %{"id" => id, "form" => form_params}, current_user) do
    with %Form{} = form <- Forms.get_form!(id),
         :ok <- Authorizer.authorize(:update_form, current_user, form),
         {:ok, %Form{} = form} <- Forms.update_form(form, form_params) do
      render(conn, "show.json", form: form)
    end
  end

  def delete(conn, %{"id" => id}, current_user) do
    with %Form{} = form <- Forms.get_form!(id),
         :ok <- Authorizer.authorize(:delete_form, current_user, form),
         {:ok, %Form{} = _form} <- Forms.delete_form(form) do
      conn
      |> put_resp_header("content-type", "application/json")
      |> send_resp(:no_content, "")
    end
  end
end
