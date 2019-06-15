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
  Gets a single `%User{}` from the data store where the primary key matches the
  given id.

  Returns `nil` if no result was found.

  ## Examples

      iex> get_user(123)
      %User{}

      iex> get_user(456)
      nil

  """
  def get_user(id), do: Repo.get(User, id)

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
  Gets a single user.

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
