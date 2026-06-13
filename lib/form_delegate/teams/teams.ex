defmodule FormDelegate.Teams do
  import Ecto.Query, warn: false

  alias FormDelegate.Teams.Team
  alias FormDelegate.Repo

  @doc """
  Creates a team.

  ## Examples

      iex> create_team(%{field: value})
      {:ok, %Team{}}

      iex> create_team(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_team(attrs \\ %{}) do
    %Team{}
    |> Team.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Returns the list of teams.

  ## Examples

      iex> list_teams()
      [%Team{}, ...]

  """
  def list_teams do
    Team |> order_by(:id) |> Repo.all()
  end

  @doc """
  Updates a team.
  """
  def update_team(%Team{} = team, attrs \\ %{}) do
    team
    |> Team.changeset(attrs)
    |> Repo.update()
  end
end
