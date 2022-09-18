defmodule FormDelegate.BillingCounts do
  import Ecto.Query, warn: false

  alias FormDelegate.BillingCounts.BillingCount
  alias FormDelegate.Repo

  # Billable resource limit

  @moduledoc """
  The BillingCounts context.
  """

  @doc """
  Gets the most recent billing count for a team.

  ## Examples

      iex> get_latest_billing_count_of_team(123)
      %BillingCount{}

      iex> get_latest_billing_count_of_team!(456)
      nil

  """
  def get_latest_billing_count_of_team(team_id) do
    Repo.one(
      from bc in BillingCount,
        where: bc.team_id == ^team_id,
        order_by: [desc: bc.ended_at],
        limit: 1
    )
  end

  @doc """
  Updates a billing count.

  ## Examples

      iex> update_billing_count(billing_count, %{field: new_value})
      {:ok, %BillingCount{}}

      iex> update_billing_count(billing_count, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_billing_count(%BillingCount{} = billing_count, attrs \\ %{}) do
    billing_count
    |> BillingCount.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Creates a billing count.

  ## Examples

      iex> create_billing_count(billing_count, %{field: new_value})
      {:ok, %BillingCount{}}

      iex> create_billing_count(billing_count, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_billing_count(%BillingCount{} = billing_count, attrs \\ %{}) do
    billing_count
    |> BillingCount.create_changeset(attrs)
    |> Repo.insert()
  end
end
