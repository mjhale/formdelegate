defmodule FormDelegateWeb.Admin.IntegrationController do
  use FormDelegateWeb, :controller

  alias FormDelegate.Integration

  def index(conn, _params) do
    integrations = Integration |> Repo.all
    render(conn, "index.json", integrations: integrations)
  end

  def show(conn, %{"id" => id}) do
    integration = Integration |> Repo.get!(id)
    render(conn, "show.json", integration: integration)
  end

  def update(conn, %{"id" => id, "integration" => integration_params}) do
    integration = Integration |> Repo.get!(id)
    changeset = Integration.changeset(integration, integration_params)

    case Repo.update(changeset) do
      {:ok, integration} ->
        render(conn, "show.json", integration: integration)
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(FormDelegate.ChangesetView, "error.json", changeset: changeset)
    end
  end
end
