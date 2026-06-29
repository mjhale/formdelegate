alias FormDelegate.Teams.Team

defmodule FormDelegate.Teams.Team do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Memberships.Membership

  @primary_key {:id, :binary_id, autogenerate: true}
  @timestamps_opts [type: :utc_datetime_usec]

  schema "teams" do
    field :name, :string
    field :stripe_customer_id, :string

    has_many :subscriptions, FormDelegate.Subscriptions.Subscription
    has_many :billing_counts, FormDelegate.BillingCounts.BillingCount
    has_many :memberships, Membership, on_delete: :delete_all
    has_many :team_invitations, FormDelegate.Teams.TeamInvitation, on_delete: :delete_all

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(%Team{} = team, attrs) do
    team
    |> cast(attrs, [:name, :stripe_customer_id])
    |> unique_constraint(:stripe_customer_id)
  end

  def public_update_changeset(%Team{} = team, attrs) do
    team
    |> cast(attrs, [:name])
  end

  @doc """
  Builds a registration changeset based on the `struct` and `params`.
  """
  def registration_changeset(%Team{} = team, attrs) do
    team
    |> cast(attrs, [:name])
    |> cast_assoc(:billing_count,
      with: &FormDelegate.BillingCounts.BillingCount.create_changeset/2,
      required: true
    )
  end
end
