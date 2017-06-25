defmodule FormDelegate.FormController do
  use FormDelegate.Web, :controller

  alias FormDelegate.Form

  plug Guardian.Plug.EnsureAuthenticated, handler: FormDelegate.SessionController

  def index(conn, _params) do
    current_account = Guardian.Plug.current_resource(conn)
    forms = Repo.all(account_forms(current_account))
    |> preload_form_integrations

    render(conn, "index.json", forms: forms)
  end

  def create(conn, %{"form" => form_params}) do
    current_account = Guardian.Plug.current_resource(conn)
    changeset = build_assoc(current_account, :forms)
    |> preload_form_integrations
    |> Form.changeset(form_params)

    case Repo.insert(changeset) do
      {:ok, form} ->
        conn
        |> put_status(:created)
        |> render("show.json", form: form)
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(FormDelegate.ChangesetView, "error.json", changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_account = Guardian.Plug.current_resource(conn)
    form = Repo.get!(account_forms(current_account), id)
    Repo.delete!(form)

    send_resp(conn, :no_content, "")
  end

  def show(conn, %{"id" => id}) do
    current_account = Guardian.Plug.current_resource(conn)
    form = Repo.get!(account_forms(current_account), id)
    |> preload_form_integrations

    render(conn, "show.json", form: form)
  end

  def update(conn, %{"id" => id, "form" => form_params}) do
    current_account = Guardian.Plug.current_resource(conn)
    form = Repo.get!(account_forms(current_account), id)
    |> preload_form_integrations

    # Insert "form_id" field for newly submitted integrations
    modified_params = get_and_update_in(form_params, ["form_integrations"], fn(integrations) ->
      modified_integrations =
        integrations
        |> Enum.map(fn(integration) ->
          unless Map.has_key?(integration, id) do
            Map.put(integration, "form_id", id)
          end
        end)

      # Return the unmodified and modified integrations list
      {integrations, modified_integrations}
    end)

    changeset = Form.changeset(form, elem(modified_params, 1))

    case Repo.update(changeset) do
      {:ok, form} ->
        conn
        |> put_status(:ok)
        |> render("show.json", form: form)
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(FormDelegate.ChangesetView, "error.json", changeset: changeset)
    end
  end

  defp preload_form_integrations(form) do
    form
    |> Repo.preload([:form_integrations, :integrations])
  end

  defp account_forms(account) do
    assoc(account, :forms)
  end
end
