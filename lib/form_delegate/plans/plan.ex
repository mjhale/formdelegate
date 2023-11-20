defmodule FormDelegate.Plans.Plan do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Plans.Plan

  @primary_key {:id, :binary_id, autogenerate: true}
  @timestamps_opts [type: :utc_datetime_usec]

  schema "plans" do
    field :name, :string
    field :stripe_product_id, :string

    field :limit_submissions, :integer, default: 100
    field :limit_forms, :integer, default: 0
    field :limit_storage, :integer, default: 5_000_000

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(%Plan{} = plan, attrs) do
    plan
    |> cast(attrs, [:name, :stripe_product_id, :limit_submissions, :limit_forms, :limit_storage])
  end
end
