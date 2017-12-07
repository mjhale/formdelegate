defmodule FormDelegateWeb.RequestController do
  use FormDelegateWeb, :controller

  alias Ecto.Changeset
  alias FormDelegate.Forms.Form
  alias FormDelegate.Messages.Message

  # @TODO: Check that form.verified is true
  def process_request(conn, %{"id" => form_id} = params) do
    form = Repo.get!(Form, form_id)
    |> Repo.preload([:integrations, :user])

    # Populate message fields with guessed params
    content_fields = ["message", "content", "body"]
    name_fields = ["name", "sender", "full_name"]
    title_fields = ["title", "subject"]

    # Filter params into known and unknown
    known_fields = ["id"] ++ name_fields ++ title_fields ++ content_fields
    unknown_fields = Map.drop(params, known_fields)

    # Merge fields into messages map
    #   @TODO: Search through nested param maps
    message_attrs = %{
      "content" => Enum.find(content_fields, &Map.get(params, &1)),
      "name" => Enum.find(name_fields, &Map.get(params, &1)),
      "title" => Enum.find(title_fields, &Map.get(params, &1)),
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
    Repo.insert(changeset)

    conn
    |> put_resp_header("content-type", "application/json")
    |> send_resp(:accepted, "")
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
