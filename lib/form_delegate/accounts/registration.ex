defmodule FormDelegate.Accounts.Registration do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Accounts.{Registration, User}
  alias FormDelegate.Memberships.Membership

  @primary_key false
  embedded_schema do
    field :captcha, :string
    embeds_one :user, User
  end

  @doc false
  def changeset(%Registration{} = registration, params \\ %{}) do
    registration
    |> cast(params, [:captcha])
    |> cast_embed(:user, with: &User.registration_changeset/2, required: true)
    |> validate_required([:captcha])
  end

  @doc false
  def to_multi(%{valid?: true} = changeset) do
    data = Ecto.Changeset.apply_changes(changeset)

    Ecto.Multi.new()
    |> Ecto.Multi.insert(:user, to_user_struct(data))
    |> Ecto.Multi.insert(:membership, fn %{user: user} ->
      %Membership{}
      |> Membership.changeset(%{
        user_id: user.id,
        team_id: user.team_id,
        is_billing_account: true
      })
    end)
  end

  @doc false
  def to_multi(changeset), do: {:error, changeset}

  @doc false
  defp to_user_struct(registration) do
    Map.fetch!(registration, :user)
  end
end
