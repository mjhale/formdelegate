defmodule FormDelegate.Plans do
  import Ecto.Query, warn: false

  alias FormDelegate.Plans.Plan
  alias FormDelegate.Repo

  @doc """
  Creates a plan.

  ## Examples

      iex> create_plan(%{field: value})
      {:ok, %Plan{}}

      iex> create_plan(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_plan(attrs \\ %{}) do
    %Plan{}
    |> Plan.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Returns the list of plans.

  ## Examples

      iex> list_plans()
      [%Plan{}, ...]

  """
  def list_plans do
    Plan |> order_by(:id) |> Repo.all()
  end

  @doc """
  Gets a single plan.

  Raises `Ecto.NoResultsError` if the Plan does not exist.

  ## Examples

      iex> get_plan!(123)
      %Plan{}

      iex> get_plan!(456)
      ** (Ecto.NoResultsError)

  """
  def get_plan!(id) do
    Repo.get!(Plan, id)
  end

  @doc """
  Gets a single plan by a keyword.

  ## Examples

      iex> get_plan_by("price_1Ktyana5")
      %Plan{}

      iex> get_plan_by("bad_id")
      nil

  """
  def get_plan_by(keyword) do
    Plan
    |> Repo.get_by(keyword)
  end

  @doc """
  Deletes a plan.

  ## Examples

      iex> delete_plan(plan)
      {:ok, %Plan{}}

      iex> delete_plan(plan)
      {:error, %Ecto.Changeset{}}

  """
  def delete_plan(%Plan{} = plan) do
    Repo.delete(plan)
  end

  @doc """
  Updates a plan.

  ## Examples

      iex> update_plan(plan, %{field: new_value})
      {:ok, %Plan{}}

      iex> update_plan(plan, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_plan(%Plan{} = plan, attrs \\ %{}) do
    plan
    |> Plan.changeset(attrs)
    |> Repo.update()
  end
end
