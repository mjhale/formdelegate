defmodule FormDelegate.Form do
  use FormDelegate.Web, :model

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "forms" do
    field :name, :string
    field :host, :string
    field :verified, :boolean, default: false

    belongs_to :account, FormDelegate.Account
    many_to_many :integrations, FormDelegate.Integration, join_through: FormDelegate.FormIntegration

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:name, :host, :verified])
    |> validate_required([:name, :host, :verified])
  end
end
