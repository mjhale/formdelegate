defmodule FormDelegate.Plan do
  use Ecto.Schema
  import Ecto.Changeset

  schema "plans" do
    field :limit_forms, :integer
    field :limit_storage, :integer
    field :limit_submissions, :integer
    field :name, :string
    field :stripe_product_id, :string

    timestamps()
  end

  @doc false
  def changeset(plan, attrs) do
    plan
    |> cast(attrs, [:name, :stripe_product_id, :limit_submissions, :limit_forms, :limit_storage])
    |> validate_required([
      :name,
      :limit_submissions,
      :limit_forms,
      :limit_storage
    ])
  end
end
