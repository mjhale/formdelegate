defmodule FormDelegate.Account do
  use FormDelegate.Web, :model

  @derive {Poison.Encoder, except: [:__meta__]}

  schema "accounts" do
    field :name, :string
    field :password, :string, virtual: true
    field :password_hash, :string, null: false
    field :username, :string, null: false

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:name, :username, :password])
    |> validate_required([:username])
    |> validate_length(:username, min: 3, max: 128)
    |> put_password_hash()
  end

  @doc """
  Builds a account registration changeset based on the `struct` and `params`.
  """
  def registration_changeset(struct, params) do
  	struct
  	|> changeset(params)
  	|> cast(params, [:password])
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
