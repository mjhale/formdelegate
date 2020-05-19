defmodule FormDelegateWeb.FormSubmissionChannel do
  use Phoenix.Channel

  alias FormDelegate.Accounts.User

  def join("form_submission:" <> form_user_id, _submission, socket) do
    current_user = Guardian.Phoenix.Socket.current_resource(socket)

    if authorized?(String.to_integer(form_user_id), current_user) do
      {:ok, socket}
    else
      {:error, "Not authorized"}
    end
  end

  defp authorized?(form_user_id, current_user) do
    case current_user do
      %User{id: ^form_user_id} -> true
      _ -> false
    end
  end
end
