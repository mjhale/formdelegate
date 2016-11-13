defmodule FormDelegate.Account do
  @derive {Poison.Encoder, only: [:id, :name, :username]}

  use FormDelegate.Web, :model

  schema "accounts" do
    field :name, :string
    field :password, :string, virtual: true
    field :password_hash, :string, null: false
    field :username, :string, null: false
    field :messages_count, :integer, null: false
    field :forms_count, :integer, null: false
    field :verified, :boolean, null: false
    field :admin, :boolean, null: false

    has_many :messages, FormDelegate.Message, on_delete: :delete_all
    has_many :forms, FormDelegate.Form, on_delete: :delete_all

    timestamps()
  end

  @required_fields ~w(username)
  @optional_fields ~w(password name)

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, @required_fields, @optional_fields)
    |> cast_assoc(:messages, required: false)
    |> validate_length(:username, min: 3, max: 128)
    |> validate_length(:password, min: 10, max: 128)
    |> put_password_hash()
  end

  defp put_password_hash(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{password: password}} ->
        put_change(changeset, :password_hash, Comeonin.Pbkdf2.hashpwsalt(password))
      _ ->
        changeset
    end
  end
end
