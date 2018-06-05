defmodule FormDelegateWeb.RequestController do
  use FormDelegateWeb, :controller

  alias Ecto.Changeset
  alias FormDelegate.Forms.Form
  alias FormDelegate.Messages.Message
  alias FormDelegateWeb.Services.{Email, Ifttt, Zapier}

  # @TODO: Check that form.verified is true
  def process_request(conn, %{"id" => form_id} = params) do
    form = Form
    |> Repo.get!(form_id)
    |> Repo.preload([:integrations, :user])

    # Populate message fields with guessed params
    content_fields = ["message", "content", "body"]
    sender_fields = ["name", "sender", "full_name", "email"]
    title_fields = ["title", "subject", ""]

    # Filter params into known and unknown
    known_fields = ["id"] ++ sender_fields ++ title_fields ++ content_fields
    unknown_fields = Map.drop(params, known_fields)

    # Merge fields into messages map
    #   @TODO: Search through nested param maps
    #   @TODO: Limit selection to one known field per key, sending the
    #          rest to unknown_fields (e.g., name and email fields both
    #          present in params).
    message_attrs = %{
      "content" => Enum.find_value(content_fields, &Map.get(params, &1)),
      "sender" => Enum.find_value(sender_fields, &Map.get(params, &1)),
      "title" => Enum.find_value(title_fields, &Map.get(params, &1)),
      "unknown_fields" => unknown_fields
    }

    changeset = %Message{}
    |> Message.changeset(message_attrs)
    |> Changeset.put_assoc(:form, form)
    |> Changeset.put_assoc(:user, form.user)
    |> Changeset.assoc_constraint(:form)
    |> Changeset.assoc_constraint(:user)
    |> update_message_count(1)

    # @TODO: Send to queue
    with {:ok, %Message{} = message} <- Repo.insert(changeset) do
      run_integrations(form, message)
    end

    conn
    |> put_resp_header("content-type", "application/json")
    |> send_resp(:accepted, "")
  end

  defp run_integrations(%Form{} = form, %Message{} = message) do
    Enum.each form.form_integrations, fn form_integration ->
      if form_integration.enabled do
        case form_integration.integration.type do
          "E-mail" ->
            Email.send_email(form.user, message)
          "Ifttt" ->
            Ifttt.send_request(form.user, message)
          "Zapier" ->
            Zapier.send_request(form.user, message)
        end
      end
    end
  end

  defp update_message_count(changeset, value) do
    if changeset.valid? do
      changeset
      |> Changeset.prepare_changes(fn prepared_changeset ->
        if form = Changeset.get_change(prepared_changeset, :form) do
          query = from Form, where: [id: ^form.data.id]
          prepared_changeset.repo.update_all(query, inc: [message_count: value])
        end

        prepared_changeset
      end)
    else
      changeset
    end
  end
end
