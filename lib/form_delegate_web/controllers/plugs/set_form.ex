defmodule FormDelegateWeb.Plugs.SetForm do
  import Plug.Conn

  def init(_), do: nil

  def call(%{method: "POST"} = conn, opts), do: set_form(conn, opts)

  def call(conn, _opts), do: conn

  defp set_form(%{path_params: %{"form_id" => form_id}} = conn, _opts) do
    form = FormDelegate.Forms.get_form!(form_id)

    assign(conn, :form, form)
  end
end
