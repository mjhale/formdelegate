defmodule FormDelegate.Forms.Form do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Accounts.User
  alias FormDelegate.Forms.{Form, Integration}
  alias FormDelegate.Submissions.Submission

  @primary_key {:id, :binary_id, autogenerate: true}
  @timestamps_opts [type: :utc_datetime_usec]

  schema "forms" do
    field :form, :string
    field :host, :string
    field :verified, :boolean, default: false, null: false
    field :submission_count, :integer, default: 0, null: false

    belongs_to :user, User
    has_many :submissions, Submission, on_delete: :delete_all
    has_many :form_integrations, Integration, on_delete: :delete_all, on_replace: :delete
    has_many :integrations, through: [:form_integrations, :integration]

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(%Form{} = form, attrs) do
    form
    |> cast(attrs, [:form, :host])
    |> validate_required([:form])
  end
end
