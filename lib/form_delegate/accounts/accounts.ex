defmodule FormDelegate.Accounts do
  @moduledoc """
  The Accounts context.
  """

  import Ecto.Query, warn: false

  alias FormDelegate.Repo
  alias FormDelegate.Accounts.User

  @doc """
  Returns the list of users.

  ## Examples

      iex> list_users()
      [%User{}, ...]

  """
  def list_users do
    User |> order_by(:id) |> Repo.all()
  end

  @doc """
  Gets a single user.

  Raises `Ecto.NoResultsError` if the User does not exist.

  ## Examples

      iex> get_user!(123)
      %User{}

      iex> get_user!(456)
      ** (Ecto.NoResultsError)

  """
  def get_user!(id), do: Repo.get!(User, id)

  @doc """
  Gets a single user by their email address.

  Raises `Ecto.NoResultsError` if the User does not exist.

  ## Examples

      iex> get_user_by_email!("me@domain.com")
      %User{}

      iex> get_user_by_email!("123@domain.com")
      ** (Ecto.NoResultsError)

  """
  def get_user_by_email!(email, preload \\ []) do
    Repo.get_by!(User, email: email)
    |> Repo.preload(preload)
  end

  @doc """
  Gets a single user by their email address.

  ## Examples

      iex> get_user_by_email("me@domain.com")
      %User{}

      iex> get_user_by_email("123@domain.com")
      nil

  """
  def get_user_by_email(email, preload \\ []) do
    Repo.get_by(User, email: email)
    |> Repo.preload(preload)
  end

  @doc """
  Gets a single user by their confirmation token.

  ## Examples

      iex> get_user_by_confirmation_token("ZsyEMtusL6hWS...")
      %User{}

      iex> get_user_by_confirmation_token("invalid-token")
      nil

  """
  def get_user_by_confirmation_token(confirmation_token, preload \\ []) do
    Repo.get_by(User, confirmation_token: confirmation_token)
    |> Repo.preload(preload)
  end

  @doc """
  Gets a single user by their reset password token.

  ## Examples

      iex> get_user_by_reset_password_token("ZsyEMtusL6hWS...")
      %User{}

      iex> get_user_by_reset_password_token("invalid-token")
      nil

  """
  def get_user_by_reset_password_token(reset_password_token) do
    Repo.get_by(User, reset_password_token: reset_password_token)
  end

  @doc """
  Creates a user.

  ## Examples

      iex> create_user(%{field: value})
      {:ok, %User{}}

      iex> create_user(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_user(attrs \\ %{}) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a user.

  ## Examples

      iex> update_user(user, %{field: new_value})
      {:ok, %User{}}

      iex> update_user(user, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_user(%User{} = user, attrs) do
    user
    |> User.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Confirms a user.

  ## Examples

      iex> confirm_user(user)
      {:ok, %User{}}

      iex> confirm_user(user)
      :error

  """
  def confirm_user(confirmation_token) do
    with %User{} = user <- get_user_by_confirmation_token(confirmation_token),
         {:ok, _} <- verify_confirmation_token(user),
         {:ok, %User{} = user} <- Repo.update(User.confirmed_changeset(user)) do
      {:ok, user}
    else
      _ -> :error
    end
  end

  defp verify_confirmation_token(%User{confirmation_sent_at: sent_at} = user) do
    confirmation_validity_in_seconds = 5 * (60 * 60 * 24)
    seconds_since_confirmation_sent_at = DateTime.diff(DateTime.utc_now(), sent_at, :second)
    is_confirmation_valid = seconds_since_confirmation_sent_at < confirmation_validity_in_seconds

    if is_confirmation_valid do
      {:ok, user}
    else
      {:error, :expired_confirmation_token}
    end
  end

  @doc """
  Resets a user's confirmation token.

  ## Examples

      iex> reset_user_confirmation(user)
      {:ok, %User{}}

      iex> reset_user_confirmation(user)
      {:error, %Ecto.Changeset{}}

  """
  def reset_user_confirmation(%User{} = user) do
    user
    |> User.reset_confirmation_changeset()
    |> Repo.update()
  end

  @doc """
  Resets a user's password.

  ## Examples

      iex> reset_user_password(user)
      {:ok, %User{}}

      iex> reset_user_password(user)
      {:error, %Ecto.Changeset{}}

  """
  def reset_user_password(%User{} = user, params \\ %{}) do
    user
    |> User.reset_password_changeset(params)
    |> Repo.update()
  end

  @doc """
  Creates a user reset password token.

  ## Examples

      iex> reset_user_confirmation(user)
      {:ok, %User{}}

      iex> reset_user_confirmation(user)
      {:error, %Ecto.Changeset{}}

  """
  def create_reset_password_token(%User{} = user) do
    user
    |> User.reset_password_token_changeset()
    |> Repo.update()
  end

  @doc """
  Deletes a User.

  ## Examples

      iex> delete_user(user)
      {:ok, %User{}}

      iex> delete_user(user)
      {:error, %Ecto.Changeset{}}

  """
  def delete_user(%User{} = user) do
    Repo.delete(user)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking user changes.

  ## Examples

      iex> change_user(user)
      %Ecto.Changeset{source: %User{}}

  """
  def change_user(%User{} = user) do
    User.changeset(user, %{})
  end

  @doc """
  Creates a user with a hashed password and confirmation token.

  ## Examples

      iex> register_user(%{field: value})
      {:ok, %User{}}

      iex> register_user(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def register_user(attrs \\ %{}) do
    %User{}
    |> User.registration_changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Authenticates a user based on email and password.

  ## Examples

      iex> authenticate_user(%{email: "me@domain.com", password: "valid"})
      {:ok, %User{}}

      iex> authenticate_user(%{email: "me@domain.com", password: "invalid"})
      {:error, :unauthorized}

  """
  def authenticate_user(%{email: email, password: password}) do
    query = from u in User, where: u.email == ^email

    case Repo.one(query) do
      nil ->
        Pbkdf2.no_user_verify()
        {:error, :invalid_credentials}

      user ->
        case Pbkdf2.check_pass(user, password) do
          {:ok, %User{} = user} ->
            {:ok, user}

          {:error, _} ->
            {:error, :invalid_credentials}
        end
    end
  end
end
