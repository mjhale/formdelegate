defmodule FormDelegateWeb.Plugs.SetForm do
  import Ecto.Query, only: [from: 2]
  import Plug.Conn
  import Phoenix.Controller

  def init(_), do: nil

  def call(%{method: "POST"} = conn, opts), do: set_form(conn, opts)

  def call(conn, _opts), do: conn

  defp set_form(%{path_params: %{"form_id" => form_id}} = conn, _opts) do
    case FormDelegate.Repo.one(
           from f in FormDelegate.Forms.Form,
             where: f.id == ^form_id,
             preload: [
               user: [team: [:subscriptions]],
               email_integrations: [:email_integration_recipients]
             ]
         ) do
      nil ->
        conn
        |> put_status(:not_found)
        |> put_view(FormDelegateWeb.ErrorView)
        |> render(:"404")
        |> halt()

      form ->
        assign(conn, :form, form)
    end
  end
end
