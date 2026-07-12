defmodule FormDelegate.Subscriptions do
  @moduledoc """
  The Subscriptions context.
  """

  import Ecto.Query, warn: false

  require Logger

  alias FormDelegate.Repo
  alias FormDelegate.Subscriptions.Subscription
  alias FormDelegate.Teams.Team

  @active_statuses ["active", "trialing"]

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

      iex> list_subscriptions_by_team(%Team{})
      [%Subscription{}, ...]

      iex> list_subscriptions_by_team(%Team{})
      []
  """
  def list_subscriptions_by_team(%Team{id: team_id}) do
    query = from s in Subscription, where: s.team_id == ^team_id

    Repo.all(query)
    |> Repo.preload([:plan, :team])
  end

  def active_statuses, do: @active_statuses

  def active_subscription_status?(status), do: status in @active_statuses

  def get_active_subscription_for_team(%Team{id: team_id}) do
    Repo.one(
      from s in Subscription,
        where: s.team_id == ^team_id and s.stripe_subscription_status in ^@active_statuses,
        order_by: [desc: s.updated_at, desc: s.inserted_at],
        limit: 1,
        preload: [:plan, :team]
    )
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
