defmodule FormDelegate.Submissions.Delivery do
  @moduledoc "Per-integration receipts prevent replaying successful deliveries during retries."
  use Ecto.Schema
  @timestamps_opts [type: :utc_datetime_usec]
  schema "submission_deliveries" do
    field :submission_id, Ecto.UUID
    field :form_integration_id, Ecto.UUID
    field :attempts, :integer, default: 0
    field :delivered_at, :utc_datetime_usec
    field :last_error, :string
    timestamps()
  end
end
