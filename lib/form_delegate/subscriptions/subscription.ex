defmodule FormDelegate.Subscriptions.Subscription do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Plans.Plan
  alias FormDelegate.Subscriptions.Subscription
  alias FormDelegate.Teams.Team

  @primary_key {:id, :binary_id, autogenerate: true}
  @timestamps_opts [type: :utc_datetime_usec]

  schema "subscriptions" do
    field :stripe_subscription_id, :string
    field :stripe_subscription_status, :string
    field :ends_at, :utc_datetime

    belongs_to :plan, Plan, type: Ecto.UUID
    belongs_to :team, Team, type: Ecto.UUID

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(%Subscription{} = subscription, attrs) do
    subscription
    |> cast(attrs, [
      :stripe_subscription_id,
      :stripe_subscription_status,
      :ends_at,
      :team_id,
      :plan_id
    ])
    |> validate_required([
      :stripe_subscription_id,
      :stripe_subscription_status,
      :team_id,
      :plan_id
    ])
  end
end
