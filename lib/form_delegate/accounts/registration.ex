defmodule FormDelegate.Accounts.Registration do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Accounts.{Registration, User}
  alias FormDelegate.BillingCounts.BillingCount
  alias FormDelegate.Memberships.Membership
  alias FormDelegate.Teams.Team

  @primary_key false
  embedded_schema do
    field :captcha, :string
    embeds_one :user, User
  end

  @doc false
  def changeset(%Registration{} = registration, params \\ %{}) do
    registration
    |> cast(params, [:captcha])
    |> cast_embed(:user, with: &User.registration_changeset/2, required: true)
    |> validate_required([:captcha])
  end

  @doc false
  def to_multi(%{valid?: true} = changeset) do
    data = Ecto.Changeset.apply_changes(changeset)

    Ecto.Multi.new()
    |> Ecto.Multi.insert(:user, to_user_struct(data))
    |> Ecto.Multi.insert(:team, Team.changeset(%Team{}, %{}))
    |> Ecto.Multi.insert(:membership, fn %{user: user, team: team} ->
      %Membership{}
      |> Membership.changeset(%{
        user_id: user.id,
        team_id: team.id,
        is_billing_account: true
      })
    end)
    |> Ecto.Multi.insert(:billing_count, fn %{team: team} ->
      BillingCount.create_changeset(%BillingCount{}, %{
        team_id: team.id,
        submission_count: 0,
        storage_count: 0,
        form_count: 0
      })
    end)
  end

  @doc false
  def to_multi(changeset), do: {:error, changeset}

  @doc false
  defp to_user_struct(registration) do
    Map.fetch!(registration, :user)
  end
end
