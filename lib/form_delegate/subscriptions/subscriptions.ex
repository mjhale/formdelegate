defmodule FormDelegate.Subscriptions do
  @moduledoc """
  The Subscriptions context.
  """

  import Ecto.Query, warn: false

  require Logger

  alias FormDelegate.Repo
  alias FormDelegate.Accounts.User
  alias FormDelegate.Subscriptions.Subscription
  alias FormDelegate.Teams.Team

  @doc """
  Returns the list of subscriptions.
  ## Examples
      iex> list_subscriptions()
      [%Subscription{}, ...]
  """
  def list_subscriptions do
    Repo.all(Subscription)
  end

  @doc """
  Gets a single subscription.

  Raises `Ecto.NoResultsError` if the subscription does not exist.

  ## Examples

      iex> get_subscription!(123)
      %Subscription{}

      iex> get_subscription!(456)
      ** (Ecto.NoResultsError)

  """
  def get_subscription!(id), do: Repo.get_by!(Subscription, stripe_subscription_id: id)

  @doc """
  Gets a single subscription.

  Raises nil if the subscription does not exist.

  ## Examples

      iex> get_subscription(123)
      %Subscription{}

      iex> get_subscription(456)
      ** nil

  """
  def get_subscription(id), do: Repo.get_by(Subscription, stripe_subscription_id: id)

  @doc """
  Returns the list of subscriptions belonging to a user's team.

  Returns an empty list when no subscriptions exist.

  ## Examples

      iex> list_subscriptions_by_user(%User{})
      [%Subscription{}, ...]

      iex> list_subscriptions_by_user(%User{})
      []
  """
  def list_subscriptions_by_user(%User{team_id: team_id}) do
    query = from s in Subscription, where: s.team_id == ^team_id
    Repo.all(query)
  end

  @doc """
  Updates a subscription.

  ## Examples

      iex> update_subscription(subscription, %{field: new_value})
      {:ok, %Subscription{}}

      iex> update_subscription(subscription, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_subscription(%Subscription{} = subscription, attrs) do
    subscription
    |> Subscription.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Returns the list of subscriptions belonging to a team.

  Returns an empty list when no subscriptions exist.

  ## Examples

      iex> list_subscriptions_by_user(%Team{})
      [%Subscription{}, ...]

      iex> list_subscriptions_by_user(%Team{})
      []
  """
  def list_subscriptions_by_team(%Team{id: team_id}) do
    query = from s in Subscription, where: s.team_id == ^team_id
    Repo.all(query)
  end

  @doc """
  Creates a subscription.

  ## Examples

      iex> create_subscription(%{field: value})
      {:ok, %Subscription{}}

      iex> create_subscription(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_subscription(attrs \\ %{}) do
    %Subscription{}
    |> Subscription.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Deletes a Subscription.

  ## Examples

      iex> delete_subscription(subscription)
      {:ok, %Subscription{}}

      iex> delete_subscription(subscription)
      {:error, %Ecto.Changeset{}}

  """
  def delete_subscription(%Subscription{} = subscription) do
    Repo.delete(subscription)
  end
end
