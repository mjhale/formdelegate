defmodule FormDelegateWeb.IntegrationController do
  use FormDelegateWeb, :controller

  alias FormDelegate.{Integrations, Integrations.Integration}
  alias FormDelegateWeb.Authorizer

  action_fallback FormDelegateWeb.FallbackController

  def action(%Plug.Conn{assigns: %{current_user: current_user}} = conn, _opts) do
    args = [conn, conn.params, current_user]
    apply(__MODULE__, action_name(conn), args)
  end

  def index(conn, _params, current_user) do
    with :ok <- Authorizer.authorize(:show_integrations, current_user) do
      integrations = Integrations.list_integrations()
      render(conn, "index.json", integrations: integrations)
    end
  end

  def show(conn, %{"id" => id}, current_user) do
    with :ok <- Authorizer.authorize(:show_integration, current_user) do
      integration = Integrations.get_integration!(id)
      render(conn, "show.json", integration: integration)
    end
  end

  def update(conn, %{"id" => id, "integration" => integration_params}, current_user) do
    with :ok <- Authorizer.authorize(:update_integration, current_user),
         %Integration{} = integration = Integrations.get_integration!(id),
         {:ok, %Integration{} = integration} <-
           Integrations.update_integration(integration, integration_params) do
      render(conn, "show.json", integration: integration)
    end
  end
end
