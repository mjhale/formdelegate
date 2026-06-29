defmodule FormDelegate.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Accounts.User
  alias FormDelegate.Memberships.Membership

  @timestamps_opts [type: :utc_datetime_usec]

  schema "users" do
    field :email, :string
    field :unconfirmed_email, :string
    field :current_password, :string, virtual: true
    field :password, :string, virtual: true
    field :password_confirmation, :string, virtual: true
    field :password_hash, :string

    field :name, :string
    field :form_count, :integer, default: 0

    field :confirmation_token, :string
    field :confirmation_sent_at, :utc_datetime_usec
    field :confirmed_at, :utc_datetime_usec

    field :last_activity_at, :utc_datetime_usec
    field :last_sign_in_at, :utc_datetime_usec

    # Incremented after password reset/change to invalidate previously issued JWTs.
    field :auth_token_version, :integer, default: 0

    field :reset_password_token, :string
    field :reset_password_sent_at, :utc_datetime_usec

    field :is_admin, :boolean, default: false

    has_many :forms, FormDelegate.Forms.Form, on_delete: :delete_all
    has_many :memberships, Membership, on_delete: :delete_all

    timestamps()
  end

  @doc false
  def changeset(%User{} = user, params \\ %{}) do
    user
    |> cast(params, [:email, :name])
    |> validate_required([:email, :name])
    |> validate_length(:email, min: 3, max: 254)
    |> unique_constraint(:email)
  end

  @doc false
  def registration_changeset(%User{} = user, params \\ %{}) do
    user
    |> changeset(params)
    |> cast(params, [:password])
    |> validate_required([:password])
    |> validate_length(:password, min: 8)
    |> put_password_hash()
    |> put_confirmation_token()
    |> put_confirmation_sent_at()
  end

  @doc false
  def new_confirmation_changeset(%User{} = user) do
    # @TODO: Set confirmation_sent_at on mailer action
    user
    |> change()
    |> put_confirmation_token()
    |> put_confirmation_sent_at()
  end

  @doc false
  def confirmed_changeset(%User{} = user) do
    user
    |> change()
    |> put_change(:confirmation_token, nil)
    |> put_change(:confirmation_sent_at, nil)
    |> put_change(:confirmed_at, DateTime.utc_now())
  end

  @doc false
  def reset_password_token_changeset(%User{} = user) do
    user
    |> change()
    |> put_reset_password_token()
    |> put_reset_password_sent_at()
  end

  @doc false
  def reset_confirmation_changeset(%User{} = user) do
    user
    |> change()
    |> put_confirmation_token()
    |> put_confirmation_sent_at()
  end

  @doc false
  def reset_password_changeset(%User{} = user, params \\ %{}) do
    user
    |> cast(params, [:password])
    |> validate_required([:password])
    |> validate_length(:password, min: 8)
    |> put_password_hash()
    |> put_incremented_auth_token_version()
    |> put_change(:reset_password_token, nil)
    |> put_change(:reset_password_sent_at, nil)
  end

  @doc false
  def change_password_changeset(%User{} = user, params \\ %{}) do
    user
    |> cast(params, [:current_password, :password, :password_confirmation])
    |> validate_required([:current_password, :password, :password_confirmation])
    |> validate_current_password()
    |> validate_length(:password, min: 8)
    |> validate_confirmation(:password)
    |> put_password_hash()
    |> put_incremented_auth_token_version()
    |> put_change(:reset_password_token, nil)
    |> put_change(:reset_password_sent_at, nil)
  end

  defp validate_current_password(changeset) do
    case get_change(changeset, :current_password) do
      password when is_binary(password) and password != "" ->
        if current_password_valid?(password, get_field(changeset, :password_hash)) do
          changeset
        else
          add_error(changeset, :current_password, "is invalid")
        end

      _ ->
        changeset
    end
  end

  defp current_password_valid?(password, password_hash)
       when is_binary(password) and is_binary(password_hash) do
    Pbkdf2.verify_pass(password, password_hash)
  rescue
    _error -> false
  end

  defp current_password_valid?(_password, _password_hash), do: false

  defp put_incremented_auth_token_version(%Ecto.Changeset{valid?: true} = changeset) do
    put_change(
      changeset,
      :auth_token_version,
      (get_field(changeset, :auth_token_version) || 0) + 1
    )
  end

  defp put_incremented_auth_token_version(changeset), do: changeset

  defp put_password_hash(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{password: password}} ->
        put_change(changeset, :password_hash, Pbkdf2.hash_pwd_salt(password))

      _ ->
        changeset
    end
  end

  defp put_confirmation_token(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true} ->
        put_change(changeset, :confirmation_token, generate_random_url_safe_string(64))

      _ ->
        changeset
    end
  end

  defp put_confirmation_sent_at(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true} ->
        put_change(changeset, :confirmation_sent_at, DateTime.utc_now())

      _ ->
        changeset
    end
  end

  defp put_reset_password_token(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true} ->
        put_change(changeset, :reset_password_token, generate_random_url_safe_string(32))

      _ ->
        changeset
    end
  end

  defp put_reset_password_sent_at(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true} ->
        put_change(changeset, :reset_password_sent_at, DateTime.utc_now())

      _ ->
        changeset
    end
  end

  def generate_random_url_safe_string(length) do
    :crypto.strong_rand_bytes(length) |> Base.url_encode64(padding: false)
  end
end
