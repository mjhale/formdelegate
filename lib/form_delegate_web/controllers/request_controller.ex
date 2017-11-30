defmodule FormDelegateWeb.RequestController do
  use FormDelegateWeb, :controller

  alias FormDelegate.Form
  alias FormDelegate.Message
  alias FormDelegateWeb.Services.EmailNewMessage
  alias FormDelegateWeb.Services.Ifttt

  # @TODO: Optimize query calls
  def process_request(conn, %{"message" => message_params, "id" => form_id} = params) do
    form = Repo.get!(Form, form_id)
    |> Repo.preload(:user)
    |> Repo.preload(:integrations)

    unknown_fields = Map.drop(params, ["id", "message"])

    params = Map.merge(message_params, %{
      "unknown_fields" => unknown_fields
    })

    changeset = form
    |> build_assoc(:messages, user_id: form.user.id)
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
          EmailNewMessage.send_email(form.user, integration, message)
        integration.type === "Ifttt" ->
          Ifttt.send_request(form.user, integration, message)
      end
    end
  end
end
