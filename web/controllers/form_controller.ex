defmodule FormDelegate.FormController do
  use FormDelegate.Web, :controller

  alias FormDelegate.Account
  alias FormDelegate.Message

  def create(conn, %{"message" => message_params, "id" => id} = params) do
    current_account = Repo.get!(Account, id)

    unknown_fields = Map.drop(params, ["id", "message"])

    params = Map.merge(message_params, %{
      "unknown_fields" => unknown_fields
    })

    changeset = current_account
    |> build_assoc(:messages)
    |> Message.create_changeset(params)

    case Repo.insert(changeset) do
      {:ok} ->
        conn
        |> redirect(to: "/success")
      {:error} ->
        conn
        |> put_status(:unprocessable_entity)
        |> redirect(to: "/failure")
    end
  end
end
