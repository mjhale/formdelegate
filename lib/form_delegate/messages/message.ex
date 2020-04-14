defmodule FormDelegate.Messages.Message do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Accounts.User
  alias FormDelegate.Forms.Form
  alias FormDelegate.Messages.Message

  schema "messages" do
    field :content, :string
    field :sender, :string, null: false
    field :spam_status, :string
    field :unknown_fields, :map

    belongs_to :form, Form, type: Ecto.UUID
    belongs_to :user, User

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(%Message{} = message, attrs) do
    message
    |> cast(attrs, [:content, :sender, :spam_status, :unknown_fields])
    |> validate_required_inclusion([:content, :sender, :unknown_fields])
  end

  def validate_required_inclusion(changeset, fields) do
    if Enum.any?(fields, &present?(changeset, &1)) do
      changeset
    else
      add_error(changeset, hd(fields), "One of these fields must be present: #{inspect(fields)}")
    end
  end

  def present?(changeset, field) do
    value = get_field(changeset, field)
    value && (value != "" && value != %{})
  end
end
