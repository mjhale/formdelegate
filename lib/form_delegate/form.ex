defmodule FormDelegate.Form do
  use FormDelegateWeb, :model

  alias FormDelegate.Accounts.User
  alias FormDelegate.FormIntegration
  alias FormDelegate.Message

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "forms" do
    field :form, :string
    field :host, :string
    field :verified, :boolean, default: false, null: false
    field :message_count, :integer, default: 0, null: false

    belongs_to :user, User
    has_many :messages, Message, on_delete: :delete_all
    has_many :form_integrations, FormIntegration, on_delete: :delete_all, on_replace: :delete
    has_many :integrations, through: [:form_integrations, :integration]

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:form, :host, :verified])
    |> cast_assoc(:form_integrations)
    |> validate_required([:form])
  end
end
