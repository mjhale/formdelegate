defmodule FormDelegate.Messages.Message do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Accounts.User
  alias FormDelegate.Forms.Form
  alias FormDelegate.Messages.Message

  schema "messages" do
    field :content, :string, null: false
    field :sender, :string, null: false
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
    |> cast(attrs, [:content, :sender, :unknown_fields])
  end
end
