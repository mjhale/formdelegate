defmodule FormDelegateWeb.FormController do
  use FormDelegateWeb, :controller
  plug FormDelegateWeb.Plugs.LoadCurrentTeam
  plug FormDelegateWeb.Plugs.SetPlan when action in [:create, :delete]

  alias FormDelegate.BillingCounts
  alias FormDelegate.{Forms, Forms.Form}
  alias FormDelegateWeb.Authorizer

  action_fallback FormDelegateWeb.FallbackController

  def action(%Plug.Conn{assigns: %{current_user: current_user}} = conn, _opts) do
    args = [conn, conn.params, current_user]
    apply(__MODULE__, action_name(conn), args)
  end

  def index(conn, _params, current_user) do
    current_team = conn.assigns.current_team
    current_membership = conn.assigns.current_membership

    with :ok <- Authorizer.authorize(:show_user_forms, current_user, current_membership) do
      forms = Forms.list_forms_of_team(current_team)
      render(conn, "index.json", forms: forms)
    end
  end

  def create(%{assigns: %{plan: plan}} = conn, %{"form" => form_params}, current_user) do
    current_team = conn.assigns.current_team
    current_membership = conn.assigns.current_membership

    with :ok <- Authorizer.authorize(:create_form, current_user, current_membership),
         {:ok, %Form{} = form} <-
           BillingCounts.create_form_with_usage(current_team.id, plan, fn ->
             Forms.create_form(form_params, current_user, current_team)
           end) do
      form =
        FormDelegate.Repo.preload(form, [
          [email_integrations: [:email_integration_recipients]],
          :team,
          :user
        ])

      conn
      |> put_status(:created)
      |> put_resp_header("location", Routes.form_path(conn, :show, form.id))
      |> render("show.json", form: form)
    end
  end

  def show(conn, %{"id" => id}, current_user) do
    current_team = conn.assigns.current_team
    current_membership = conn.assigns.current_membership

    with %Form{} = form <- Forms.get_form!(id),
         :ok <-
           Authorizer.authorize(:show_form, current_user, current_team, current_membership, form) do
      render(conn, "show.json", form: form)
    end
  end

  def update(conn, %{"id" => id, "form" => form_params}, current_user) do
    current_team = conn.assigns.current_team
    current_membership = conn.assigns.current_membership

    with %Form{} = form <- Forms.get_form!(id),
         :ok <-
           Authorizer.authorize(
             :update_form,
             current_user,
             current_team,
             current_membership,
             form
           ),
         {:ok, %Form{} = form} <- Forms.update_form(form, form_params) do
      render(conn, "show.json", form: form)
    end
  end

  def delete(%{assigns: %{plan: plan}} = conn, %{"id" => id}, current_user) do
    current_team = conn.assigns.current_team
    current_membership = conn.assigns.current_membership

    with %Form{} = form <- Forms.get_form!(id),
         :ok <-
           Authorizer.authorize(
             :delete_form,
             current_user,
             current_team,
             current_membership,
             form
           ),
         {:ok, %Form{} = _form} <-
           BillingCounts.delete_form_with_usage(form, plan, fn ->
             Forms.delete_form(form)
           end) do
      conn
      |> put_resp_header("content-type", "application/json")
      |> send_resp(:no_content, "")
    end
  end
end
