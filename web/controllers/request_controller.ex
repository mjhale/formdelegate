defmodule FormDelegate.RequestController do
  use FormDelegate.Web, :controller

  alias FormDelegate.Form
  alias FormDelegate.Message
  alias FormDelegate.Services.EmailNewMessage
  alias FormDelegate.Services.Ifttt

  # @TODO: Optimize query calls
  def process_request(conn, %{"message" => message_params, "id" => form_id} = params) do
    form = Repo.get!(Form, form_id)
    |> Repo.preload(:account)
    |> Repo.preload(:integrations)

    unknown_fields = Map.drop(params, ["id", "message"])

    params = Map.merge(message_params, %{
      "unknown_fields" => unknown_fields
    })

    changeset = form
    |> build_assoc(:messages, account_id: form.account.id)
    |> Message.create_changeset(params)

    case Repo.insert(changeset) do
      {:ok, message} ->
        form |> run_integrations(message)
        conn |> redirect(to: "/success")
      {:error, _changeset} ->
        conn
        |> redirect(to: "/failure")
    end
  end

  # @TODO: Spin out to its own module (outside of Phoenix)
  def run_integrations(form, message) do
    Enum.each form.integrations, fn integration ->
      cond do
        integration.type === "E-mail" ->
          EmailNewMessage.send_email(form.account, integration, message)
        integration.type === "Ifttt" ->
          Ifttt.send_request(form.account, integration, message)
      end
    end
  end
end
