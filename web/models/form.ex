defmodule FormDelegate.Form do
  use FormDelegate.Web, :model

  alias FormDelegate.Account
  alias FormDelegate.FormIntegration
  alias FormDelegate.Message

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "forms" do
    field :form, :string
    field :host, :string
    field :verified, :boolean, default: false

    belongs_to :account, Account
    has_many :messages, Message
    has_many :form_integrations, FormIntegration
    has_many :integrations, through: [:form_integrations, :integration]

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:form, :host, :verified])
    |> validate_required([:form, :host, :verified])
  end
end
