defmodule FormDelegate.FormController do
  use FormDelegate.Web, :controller

  alias FormDelegate.Form

  plug Guardian.Plug.EnsureAuthenticated, handler: FormDelegate.SessionController

  def index(conn, _params) do
    current_account = Guardian.Plug.current_resource(conn)
    query = from f in Form,
      where: f.account_id == ^current_account.id,
      left_join: form_integrations in assoc(f, :form_integrations),
      left_join: integration in assoc(form_integrations, :integration),
      left_join: integrations in assoc(f, :integrations),
      preload: [
        form_integrations: {form_integrations, integration: integration},
        integrations: integrations
      ]
    forms = Repo.all(query)

    render(conn, "index.json", forms: forms)
  end

  def show(conn, %{"id" => id}) do
    query = from f in Form,
      where: f.id == ^id,
      left_join: form_integrations in assoc(f, :form_integrations),
      left_join: integration in assoc(form_integrations, :integration),
      left_join: integrations in assoc(f, :integrations),
      preload: [
        form_integrations: {form_integrations, integration: integration},
        integrations: integrations
      ]
    form = Repo.one!(query)


    render(conn, "show.json", form: form)
  end

  def update(conn, %{"id" => id, "form" => form_params}) do
    query = from f in Form,
      where: f.id == ^id,
      left_join: form_integrations in assoc(f, :form_integrations),
      left_join: integration in assoc(form_integrations, :integration),
      left_join: integrations in assoc(f, :integrations),
      preload: [
        form_integrations: {form_integrations, integration: integration},
        integrations: integrations
      ]
    form = Repo.one!(query)

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
        # @TODO Fix :integration Ecto.Association.NotLoaded error for new integrations
        render(conn, "show.json", form: form)
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(FormDelegate.ChangesetView, "error.json", changeset: changeset)
    end
  end
end
