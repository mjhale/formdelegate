defmodule FormDelegate.Message do
  use FormDelegate.Web, :model

  schema "messages" do
    field :content, :string, null: false
    field :sender, :string, null: false

    belongs_to :account, FormDelegate.Account

    timestamps()
  end

  @required_fields ~w(content sender account_id)
  @optional_fields ~w()

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, @required_fields, @optional_fields)
  end
end
