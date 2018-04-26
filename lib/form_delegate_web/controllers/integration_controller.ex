defmodule FormDelegateWeb.IntegrationController do
  use FormDelegateWeb, :controller

  alias FormDelegate.{Integrations, Integrations.Integration}
  alias FormDelegateWeb.Authorizer

  def action(%Plug.Conn{assigns: %{current_user: current_user}} = conn, _opts) do
    args = [conn, conn.params, current_user]
    apply(__MODULE__, action_name(conn), args)
  end

  def index(conn, _params, _current_user) do
    integrations = Integrations.list_integrations()

    render(conn, "index.json", integrations: integrations)
  end

  def show(conn, %{"id" => id}, _current_user) do
    integration = Integrations.get_integration!(id)

    render(conn, "show.json", integration: integration)
  end

  def update(conn, %{"id" => id, "integration" => integration_params}, current_user) do
    with %Integration{} = integration <- Integrations.get_integration!(id),
         :ok <- Authorizer.authorize(current_user, :update_integration, integration),
         {:ok, %Integration{} = integration} <- Integrations.update_integration(integration, integration_params) do

      render(conn, "show.json", integration: integration)
    end
  end
end
