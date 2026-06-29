defmodule FormDelegate.Teams do
  import Ecto.Query, warn: false

  alias FormDelegate.Accounts.User
  alias FormDelegate.Jobs.TeamInvitationEmail
  alias FormDelegate.Memberships.Membership
  alias FormDelegate.Repo
  alias FormDelegate.Teams.{Team, TeamInvitation}

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

  def get_team!(id) do
    Team
    |> Repo.get!(id)
    |> Repo.preload(team_preloads())
  end

  def get_team_for_user(%User{is_admin: true}, id) do
    with {:ok, team_id} <- cast_team_id(id) do
      case Repo.get(Team, team_id) do
        %Team{} = team -> {:ok, Repo.preload(team, team_preloads())}
        nil -> {:error, :not_found}
      end
    end
  end

  def get_team_for_user(%User{id: user_id}, id) do
    with {:ok, team_id} <- cast_team_id(id) do
      team =
        Repo.one(
          from t in Team,
            join: m in Membership,
            on: m.team_id == t.id,
            where: t.id == ^team_id and m.user_id == ^user_id
        )

      case team do
        %Team{} = team -> {:ok, Repo.preload(team, team_preloads())}
        nil -> {:error, :not_found}
      end
    end
  end

  @doc """
  Updates a team.
  """
  def update_team(%Team{} = team, attrs \\ %{}) do
    team
    |> Team.changeset(attrs)
    |> Repo.update()
  end

  def update_team(%User{} = current_user, %Team{} = team, attrs) do
    with :ok <- authorize_team_admin(current_user, team),
         {:ok, %Team{} = team} <-
           team
           |> Team.public_update_changeset(attrs)
           |> Repo.update() do
      {:ok, Repo.preload(team, team_preloads(), force: true)}
    end
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

  def list_invitations(%User{} = current_user, %Team{} = team) do
    with :ok <- authorize_team_admin(current_user, team) do
      {:ok,
       Repo.all(
         from i in TeamInvitation,
           where: i.team_id == ^team.id and i.status == :pending,
           preload: ^invitation_preloads(),
           order_by: [asc: i.inserted_at, asc: i.id]
       )}
    end
  end

  def create_invitation(%User{} = current_user, %Team{} = team, attrs) do
    attrs =
      attrs
      |> Map.new()
      |> Map.put("team_id", team.id)
      |> Map.put("inviter_id", current_user.id)

    with :ok <- authorize_team_admin(current_user, team),
         {:ok, %TeamInvitation{} = invitation} <- insert_invitation(team, attrs) do
      invitation =
        invitation
        |> Repo.preload(invitation_preloads(), force: true)
        |> clear_invitation_token()

      {:ok, invitation}
    end
  end

  def cancel_invitation(
        %User{} = current_user,
        %Team{} = team,
        %TeamInvitation{} = invitation
      ) do
    Repo.transaction(fn ->
      with :ok <- authorize_team_admin(current_user, team),
           {:ok, %TeamInvitation{} = invitation} <-
             get_invitation_for_team_for_update(team, invitation.id),
           :ok <- validate_pending_invitation(invitation),
           {:ok, %TeamInvitation{} = invitation} <-
             invitation
             |> TeamInvitation.cancel_changeset()
             |> Repo.update() do
        Repo.preload(invitation, invitation_preloads(), force: true)
      else
        {:error, reason} -> Repo.rollback(reason)
      end
    end)
    |> normalize_invitation_transaction_result()
  end

  def accept_invitation(%User{} = current_user, token) do
    Repo.transaction(fn ->
      with {:ok, %TeamInvitation{} = invitation} <- get_invitation_by_token_for_update(token),
           :ok <- validate_pending_invitation(invitation),
           :ok <- validate_unexpired_invitation(invitation),
           :ok <- validate_invitation_recipient(invitation, current_user),
           {:ok, %Membership{} = _membership} <-
             ensure_invitation_membership(invitation, current_user),
           {:ok, %TeamInvitation{} = invitation} <-
             invitation
             |> TeamInvitation.accept_changeset(DateTime.utc_now())
             |> Repo.update() do
        Repo.preload(invitation, invitation_preloads(), force: true)
      else
        {:error, reason} -> Repo.rollback(reason)
      end
    end)
    |> normalize_invitation_transaction_result()
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

  defp get_invitation_for_team_for_update(%Team{id: team_id}, invitation_id) do
    with {:ok, invitation_id} <- cast_invitation_id(invitation_id) do
      invitation =
        Repo.one(
          from i in TeamInvitation,
            where: i.team_id == ^team_id and i.id == ^invitation_id,
            lock: "FOR UPDATE"
        )

      case invitation do
        %TeamInvitation{} = invitation -> {:ok, invitation}
        nil -> {:error, :not_found}
      end
    end
  end

  defp get_invitation_by_token_for_update(token) when is_binary(token) do
    invitation =
      Repo.one(
        from i in TeamInvitation,
          where: i.token_digest == ^TeamInvitation.token_digest(token),
          lock: "FOR UPDATE"
      )

    case invitation do
      %TeamInvitation{} = invitation -> {:ok, invitation}
      nil -> {:error, :not_found}
    end
  end

  defp get_invitation_by_token_for_update(_token), do: {:error, :not_found}

  defp insert_invitation(%Team{} = team, attrs) do
    changeset = TeamInvitation.create_changeset(%TeamInvitation{}, attrs)

    Ecto.Multi.new()
    |> Ecto.Multi.run(:cancel_expired_pending_invitations, fn _repo, _changes ->
      cancel_expired_pending_invitations(team, attrs)
    end)
    |> Ecto.Multi.run(:ensure_not_team_member, fn _repo, _changes ->
      ensure_not_team_member(team, attrs)
    end)
    |> Ecto.Multi.run(:ensure_no_pending_invitation, fn _repo, _changes ->
      ensure_no_pending_invitation(team, attrs)
    end)
    |> Ecto.Multi.insert(:invitation, changeset)
    |> Oban.insert(:email_job, fn %{invitation: invitation} ->
      team_invitation_email_worker().new(%{
        invitation_id: invitation.id
      })
    end)
    |> run_invitation_insert_transaction()
    |> normalize_insert_invitation_result()
  end

  defp run_invitation_insert_transaction(multi) do
    Repo.transaction(multi)
  rescue
    exception in Ecto.InvalidChangesetError ->
      {:error, :email_job, exception.changeset, %{}}
  end

  defp ensure_no_pending_invitation(%Team{id: team_id}, attrs) do
    email = normalize_invitation_email(Map.get(attrs, "email") || Map.get(attrs, :email))

    if is_binary(email) and
         Repo.exists?(
           from i in TeamInvitation,
             where: i.team_id == ^team_id and i.email == ^email and i.status == :pending
         ) do
      {:error, :duplicate_invitation}
    else
      {:ok, :ok}
    end
  end

  defp cancel_expired_pending_invitations(%Team{id: team_id}, attrs) do
    email = normalize_invitation_email(Map.get(attrs, "email") || Map.get(attrs, :email))

    if is_binary(email) do
      now = DateTime.utc_now()

      Repo.update_all(
        from(i in TeamInvitation,
          where:
            i.team_id == ^team_id and i.email == ^email and i.status == :pending and
              i.expires_at <= ^now
        ),
        set: [status: :cancelled, updated_at: now]
      )
    end

    {:ok, :ok}
  end

  defp ensure_not_team_member(%Team{id: team_id}, attrs) do
    email = normalize_invitation_email(Map.get(attrs, "email") || Map.get(attrs, :email))

    if is_binary(email) and
         Repo.exists?(
           from m in Membership,
             join: u in assoc(m, :user),
             where: m.team_id == ^team_id and fragment("lower(?)", u.email) == ^email
         ) do
      {:error, :already_team_member}
    else
      {:ok, :ok}
    end
  end

  defp normalize_invitation_email(email) when is_binary(email) do
    email
    |> String.trim()
    |> String.downcase()
  end

  defp normalize_invitation_email(email), do: email

  defp validate_pending_invitation(%TeamInvitation{status: :pending}), do: :ok

  defp validate_pending_invitation(%TeamInvitation{}), do: {:error, :invalid_or_expired_token}

  defp validate_unexpired_invitation(%TeamInvitation{expires_at: expires_at}) do
    if DateTime.compare(DateTime.utc_now(), expires_at) == :gt do
      {:error, :invalid_or_expired_token}
    else
      :ok
    end
  end

  defp validate_invitation_recipient(%TeamInvitation{email: email}, %User{email: user_email}) do
    if normalize_invitation_email(user_email) == email do
      :ok
    else
      {:error, :forbidden}
    end
  end

  defp ensure_invitation_membership(%TeamInvitation{} = invitation, %User{} = user) do
    case Repo.get_by(Membership, user_id: user.id, team_id: invitation.team_id) do
      %Membership{} = membership ->
        {:ok, membership}

      nil ->
        %Membership{}
        |> Membership.changeset(%{
          user_id: user.id,
          team_id: invitation.team_id,
          is_billing_account: false
        })
        |> Repo.insert()
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

  defp invitation_preloads do
    [:team, :inviter]
  end

  defp cast_team_id(id) do
    case Ecto.UUID.cast(id) do
      {:ok, team_id} -> {:ok, team_id}
      :error -> {:error, :not_found}
    end
  end

  defp cast_invitation_id(id) do
    case Ecto.UUID.cast(id) do
      {:ok, invitation_id} -> {:ok, invitation_id}
      :error -> {:error, :not_found}
    end
  end

  defp team_preloads do
    [subscriptions: [:plan]]
  end

  defp normalize_transaction_result({:ok, %Membership{} = membership}), do: {:ok, membership}
  defp normalize_transaction_result({:error, reason}), do: {:error, reason}

  defp normalize_invitation_transaction_result({:ok, %TeamInvitation{} = invitation}),
    do: {:ok, invitation}

  defp normalize_invitation_transaction_result({:error, reason}), do: {:error, reason}

  defp clear_invitation_token(%TeamInvitation{} = invitation) do
    %{invitation | token: nil}
  end

  defp normalize_insert_invitation_result({:ok, %{invitation: %TeamInvitation{} = invitation}}),
    do: {:ok, invitation}

  defp normalize_insert_invitation_result({:error, _operation, :duplicate_invitation, _changes}),
    do: {:error, :duplicate_invitation}

  defp normalize_insert_invitation_result({:error, _operation, :already_team_member, _changes}),
    do: {:error, :already_team_member}

  defp normalize_insert_invitation_result(
         {:error, _operation, %Ecto.Changeset{} = changeset, _changes}
       ) do
    if duplicate_invitation_changeset?(changeset) do
      {:error, :duplicate_invitation}
    else
      {:error, changeset}
    end
  end

  defp duplicate_invitation_changeset?(%Ecto.Changeset{} = changeset) do
    Enum.any?(changeset.errors, fn
      {:email, {_message, opts}} ->
        opts[:constraint_name] == "team_invitations_pending_team_email_index"

      _error ->
        false
    end)
  end

  defp team_invitation_email_worker do
    Application.get_env(:form_delegate, :team_invitation_email_worker, TeamInvitationEmail)
  end
end
