defmodule FormDelegate.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset
  alias FormDelegate.Accounts.User

  @derive {Poison.Encoder, only: [:id, :name, :username]}

  schema "users" do
    field :email, :string, null: false
    field :name, :string
    field :password, :string, virtual: true
    field :password_hash, :string, null: false
    field :form_count, :integer, default: 0, null: false
    field :verified, :boolean, default: false, null: false
    field :is_admin, :boolean, default: false, null: false

    has_many :messages, FormDelegate.Message, on_delete: :delete_all
    has_many :forms, FormDelegate.Form, on_delete: :delete_all

    timestamps()
  end

  @doc false
  def changeset(%User{} = user, attrs) do
    user
    |> cast(attrs, [:name, :email, :password, :verified, :is_admin])
    |> cast_assoc(:messages, required: false)
    |> validate_length(:email, min: 3, max: 128)
    |> validate_length(:password, min: 8, max: 128)
    |> unique_constraint(:email)
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