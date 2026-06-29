defmodule FormDelegate.Teams do
  import Ecto.Query, warn: false

  alias FormDelegate.Accounts.User
  alias FormDelegate.Memberships.Membership
  alias FormDelegate.Repo
  alias FormDelegate.Teams.Team

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

  def team_admin?(%User{is_admin: true}, %Team{}), do: true

  def team_admin?(%User{id: user_id}, %Team{id: team_id})
      when not is_nil(user_id) and not is_nil(team_id) do
    Repo.exists?(
      from m in Membership,
        where:
          m.user_id == ^user_id and m.team_id == ^team_id and
            m.is_billing_account == true
    )
  end

  def team_admin?(_, _), do: false

  def list_memberships(%User{} = current_user, %Team{} = team) do
    with :ok <- authorize_team_admin(current_user, team) do
      {:ok,
       Repo.all(
         from m in Membership,
           where: m.team_id == ^team.id,
           preload: [:team, :user],
           order_by: [asc: m.inserted_at, asc: m.id]
       )}
    end
  end

  def update_membership(
        %User{} = current_user,
        %Team{} = team,
        %Membership{} = membership,
        attrs
      ) do
    Repo.transaction(fn ->
      memberships = lock_team_memberships(team)

      with :ok <- authorize_team_admin(current_user, team, memberships),
           {:ok, membership} <- find_locked_membership(memberships, membership),
           changeset <- Membership.billing_account_changeset(membership, attrs),
           :ok <- validate_last_team_admin(changeset, memberships),
           {:ok, membership} <- Repo.update(changeset) do
        Repo.preload(membership, membership_preloads(), force: true)
      else
        {:error, reason} -> Repo.rollback(reason)
      end
    end)
    |> normalize_transaction_result()
  end

  def remove_membership(
        %User{} = current_user,
        %Team{} = team,
        %Membership{} = membership
      ) do
    Repo.transaction(fn ->
      memberships = lock_team_memberships(team)

      with :ok <- authorize_team_admin(current_user, team, memberships),
           {:ok, membership} <- find_locked_membership(memberships, membership),
           :ok <- validate_last_team_member(memberships),
           :ok <- validate_last_team_admin(membership, memberships),
           {:ok, membership} <- Repo.delete(Repo.preload(membership, membership_preloads())) do
        membership
      else
        {:error, reason} -> Repo.rollback(reason)
      end
    end)
    |> normalize_transaction_result()
  end

  defp authorize_team_admin(%User{is_admin: true}, %Team{}), do: :ok

  defp authorize_team_admin(%User{} = current_user, %Team{} = team) do
    if team_admin?(current_user, team) do
      :ok
    else
      {:error, :forbidden}
    end
  end

  defp authorize_team_admin(%User{is_admin: true}, %Team{}, _memberships), do: :ok

  defp authorize_team_admin(%User{id: user_id}, %Team{}, memberships) do
    if Enum.any?(memberships, &(&1.user_id == user_id and &1.is_billing_account)) do
      :ok
    else
      {:error, :forbidden}
    end
  end

  defp lock_team_memberships(%Team{id: team_id}) do
    Repo.all(
      from m in Membership,
        where: m.team_id == ^team_id,
        order_by: [asc: m.inserted_at, asc: m.id],
        lock: "FOR UPDATE"
    )
  end

  defp find_locked_membership(memberships, %Membership{id: membership_id}) do
    case Enum.find(memberships, &(&1.id == membership_id)) do
      %Membership{} = membership -> {:ok, membership}
      nil -> {:error, :not_found}
    end
  end

  defp validate_last_team_member([_membership]), do: {:error, :last_team_member}
  defp validate_last_team_member(_memberships), do: :ok

  defp validate_last_team_admin(%Membership{is_billing_account: false}, _memberships), do: :ok

  defp validate_last_team_admin(%Membership{is_billing_account: true}, memberships) do
    if billing_membership_count(memberships) == 1 do
      {:error, :last_team_admin}
    else
      :ok
    end
  end

  defp validate_last_team_admin(%Ecto.Changeset{} = changeset, memberships) do
    if changeset.data.is_billing_account and
         Ecto.Changeset.get_field(changeset, :is_billing_account) == false and
         billing_membership_count(memberships) == 1 do
      {:error, :last_team_admin}
    else
      :ok
    end
  end

  defp billing_membership_count(memberships) do
    Enum.count(memberships, & &1.is_billing_account)
  end

  defp membership_preloads do
    [:team, :user]
  end

  defp normalize_transaction_result({:ok, %Membership{} = membership}), do: {:ok, membership}
  defp normalize_transaction_result({:error, reason}), do: {:error, reason}
end
