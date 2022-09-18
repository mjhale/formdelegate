defmodule FormDelegate.BillingCounts.BillingCount do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Teams.Team

  @timestamps_opts [type: :utc_datetime_usec]

  schema "billing_counts" do
    field :form_count, :integer
    field :storage_count, :integer
    field :submission_count, :integer
    field :started_at, :utc_datetime_usec
    field :ended_at, :utc_datetime_usec

    belongs_to :team, Team, type: Ecto.UUID

    timestamps()
  end

  @doc false
  def changeset(billing_count, attrs) do
    billing_count
    |> cast(attrs, [:submission_count, :storage_count, :form_count, :started_at, :ended_at])
  end

  def create_changeset(billing_count, attrs) do
    billing_count
    |> cast(attrs, [
      :submission_count,
      :storage_count,
      :form_count,
      :team_id
    ])
    |> set_started_at()
    |> set_ended_at()
  end

  defp set_started_at(changeset = %Ecto.Changeset{}) do
    now = DateTime.utc_now()

    changeset
    |> put_change(:started_at, now)
  end

  defp set_ended_at(changeset = %Ecto.Changeset{}) do
    scheduled_ended_at = DateTime.utc_now()

    period_length_in_days = 30
    period_length_in_milliseconds = :timer.hours(period_length_in_days * 24)

    scheduled_ended_at =
      DateTime.add(scheduled_ended_at, period_length_in_milliseconds, :millisecond)

    changeset
    |> put_change(:ended_at, scheduled_ended_at)
  end
end
