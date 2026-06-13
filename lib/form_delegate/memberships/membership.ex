defmodule FormDelegate.Memberships.Membership do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Accounts.User
  alias FormDelegate.Teams.Team
  alias FormDelegate.Memberships.Membership

  @primary_key {:id, :binary_id, autogenerate: true}
  @timestamps_opts [type: :utc_datetime_usec]

  schema "memberships" do
    field :is_billing_account, :boolean, default: false

    belongs_to :user, User, type: :id
    belongs_to :team, Team, type: Ecto.UUID

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(%Membership{} = membership, attrs) do
    membership
    |> cast(attrs, [:user_id, :team_id, :is_billing_account])
    |> validate_required([:user_id, :team_id])
    |> unique_constraint([:user_id, :team_id])
  end
end
