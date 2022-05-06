alias FormDelegate.Teams.Team

defmodule FormDelegate.Teams.Team do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @timestamps_opts [type: :utc_datetime_usec]

  schema "teams" do
    field :name, :string

    has_many :users, FormDelegate.Accounts.User
    has_many :subscriptions, FormDelegate.Subscriptions.Subscription

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(%Team{} = team, attrs) do
    team
    |> cast(attrs, [:name])
  end
end
