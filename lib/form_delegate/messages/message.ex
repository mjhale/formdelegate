defmodule FormDelegate.Messages.Message do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Accounts.User
  alias FormDelegate.Forms.Form
  alias FormDelegate.Messages.{Message, FlaggedType}

  schema "messages" do
    field :content, :string
    field :flagged_at, :naive_datetime

    field :sender, :string, null: false

    field :sender_ip, :string
    field :sender_referrer, :string
    field :sender_user_agent, :string

    field :unknown_fields, :map

    belongs_to :form, Form, type: Ecto.UUID
    belongs_to :user, User
    belongs_to :flagged_type, FlaggedType, on_replace: :update

    timestamps()
  end

  @doc false
  def changeset(%Message{} = message, attrs \\ %{}) do
    message
    |> cast(attrs, [
      :content,
      :sender,
      :sender_ip,
      :sender_referrer,
      :sender_user_agent,
      :unknown_fields
    ])
    |> validate_required_inclusion([:content, :sender, :unknown_fields])
  end

  @doc false
  def flag_message_changeset(%Message{} = message, attrs \\ %{}) do
    message
    |> cast(attrs, [:flagged_at])
    |> put_assoc(:flagged_type, attrs[:flagged_type])
  end

  defp validate_required_inclusion(changeset, fields) do
    if Enum.any?(fields, &present?(changeset, &1)) do
      changeset
    else
      add_error(changeset, hd(fields), "One of these fields must be present: #{inspect(fields)}")
    end
  end

  defp present?(changeset, field) do
    value = get_field(changeset, field)
    value && (value != "" && value != %{})
  end
end
