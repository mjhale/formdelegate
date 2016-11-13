defmodule FormDelegate.RequestController do
  use FormDelegate.Web, :controller

  alias FormDelegate.Account
  alias FormDelegate.Form
  alias FormDelegate.Message

  def process_request(conn, %{"message" => message_params, "id" => id} = params) do
    form = Repo.get!(Form, id)
    |> Repo.preload(:account)

    current_account = Repo.get!(Account, form.account.id)

    unknown_fields = Map.drop(params, ["id", "message"])

    params = Map.merge(message_params, %{
      "unknown_fields" => unknown_fields
    })

    changeset = current_account
    |> build_assoc(:messages)
    |> Message.create_changeset(params)

    case Repo.insert(changeset) do
      {:ok, _message} ->
        conn
        |> redirect(to: "/success")
      {:error, _changeset} ->
        conn
        |> redirect(to: "/failure")
    end
  end
end
