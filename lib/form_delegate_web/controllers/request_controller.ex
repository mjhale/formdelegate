defmodule FormDelegateWeb.RequestController do
  use FormDelegateWeb, :controller

  alias Ecto.Changeset
  alias FormDelegate.Forms.Form
  alias FormDelegate.Messages.Message

  # @TODO: Check that form.verified is true
  # @TODO: Responds with /requests/:form_id/:request_id link alongside 202
  def create(conn, params) do
    message_changeset = params |> create_message_changeset()

    with {:ok, %Message{} = message} <- Repo.insert(message_changeset) do
      Rihanna.enqueue(FormDelegate.SubmissionQueueJob, [conn, message.form, message])
    end

    body = Jason.encode!(%{message: "Accepted"})

    conn
    |> put_resp_header("content-type", "application/json")
    |> send_resp(:accepted, body)
  end

  defp create_message_changeset(%{"id" => form_id} = params) do
    form =
      Form
      |> Repo.get!(form_id)
      |> Repo.preload([:integrations, :user])

    message_attrs = merge_fields_to_map(params)

    %Message{}
    |> Message.changeset(message_attrs)
    |> Changeset.put_assoc(:form, form)
    |> Changeset.put_assoc(:user, form.user)
    |> Changeset.assoc_constraint(:form)
    |> Changeset.assoc_constraint(:user)
    |> update_message_count(1)
  end

  defp merge_fields_to_map(params) do
    content_fields = ["message", "content", "body"]
    title_fields = ["title", "subject", ""]
    sender_fields = ["name", "sender", "full_name", "email"]

    # Populate fields with found params
    known_fields = ["id"] ++ sender_fields ++ title_fields ++ content_fields

    # Filter params into known and unknown groups based on potential field hits
    unknown_fields = Map.drop(params, known_fields)

    # Merge fields into messages map
    #   @TODO: Search through nested param maps
    #   @TODO: Limit selection to one known field per key, sending the
    #          rest to unknown_fields (e.g., name and email fields both
    #          present in params).
    %{
      "content" => Enum.find_value(content_fields, &Map.get(params, &1)),
      "sender" => Enum.find_value(sender_fields, &Map.get(params, &1)),
      "title" => Enum.find_value(title_fields, &Map.get(params, &1)),
      "unknown_fields" => unknown_fields
    }
  end

  defp update_message_count(changeset, value) do
    if changeset.valid? do
      changeset
      |> Changeset.prepare_changes(fn prepared_changeset ->
        if form = Changeset.get_change(prepared_changeset, :form) do
          query = from(Form, where: [id: ^form.data.id])
          prepared_changeset.repo.update_all(query, inc: [message_count: value])
        end

        prepared_changeset
      end)
    else
      changeset
    end
  end
end
