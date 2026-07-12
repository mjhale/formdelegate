defmodule FormDelegate.BillingCounts.BillingCount do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Teams.Team

  @timestamps_opts [type: :utc_datetime_usec]

  schema "billing_counts" do
    field :form_count, :integer, default: 0
    field :storage_count, :integer, default: 0
    field :submission_count, :integer, default: 0
    field :started_at, :utc_datetime_usec
    field :ended_at, :utc_datetime_usec

    belongs_to :team, Team, type: Ecto.UUID

    timestamps()
  end

  @doc false
  def changeset(billing_count, attrs) do
    billing_count
    |> cast(attrs, [:submission_count, :storage_count, :form_count, :started_at, :ended_at])
    |> validate_number(:submission_count, greater_than_or_equal_to: 0)
    |> validate_number(:storage_count, greater_than_or_equal_to: 0)
    |> validate_number(:form_count, greater_than_or_equal_to: 0)
  end

  def create_changeset(billing_count, attrs) do
    billing_count
    |> cast(attrs, [
      :submission_count,
      :storage_count,
      :form_count,
      :team_id,
      :started_at,
      :ended_at
    ])
    |> set_started_at()
    |> set_ended_at()
    |> validate_required([:team_id, :started_at, :ended_at])
    |> validate_number(:submission_count, greater_than_or_equal_to: 0)
    |> validate_number(:storage_count, greater_than_or_equal_to: 0)
    |> validate_number(:form_count, greater_than_or_equal_to: 0)
  end

  defp set_started_at(changeset = %Ecto.Changeset{}) do
    case get_field(changeset, :started_at) do
      nil -> put_change(changeset, :started_at, DateTime.utc_now())
      _started_at -> changeset
    end
  end

  defp set_ended_at(changeset = %Ecto.Changeset{}) do
    case get_field(changeset, :ended_at) do
      nil ->
        scheduled_ended_at =
          changeset
          |> get_field(:started_at)
          |> DateTime.add(30, :day)

        put_change(changeset, :ended_at, scheduled_ended_at)

      _ended_at ->
        changeset
    end
  end
end
