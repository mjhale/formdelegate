defmodule FormDelegate.Accounts.Registration do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Accounts.{ConfirmationRateLimit, Registration, User}
  alias FormDelegate.BillingCounts.BillingCount
  alias FormDelegate.Jobs.WelcomeEmail
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
  def to_multi(changeset, oban \\ Oban)

  def to_multi(%{valid?: true} = changeset, oban) do
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
    # The welcome email carries the first confirmation link and starts the resend
    # limits, so the job and its send record commit or roll back together.
    |> then(
      &Oban.insert(oban, &1, :welcome_email, fn %{user: user} ->
        WelcomeEmail.new(%{user_id: user.id})
      end)
    )
    |> Ecto.Multi.insert(:confirmation_send, fn %{user: user} ->
      ConfirmationRateLimit.record_changeset(user.id, user.confirmation_sent_at)
    end)
  end

  def to_multi(changeset, _oban), do: {:error, changeset}

  @doc false
  defp to_user_struct(registration) do
    Map.fetch!(registration, :user)
  end
end
