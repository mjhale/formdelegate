defmodule FormDelegate.Teams.TeamInvitation do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Accounts.User
  alias FormDelegate.Teams.{Team, TeamInvitation}

  @primary_key {:id, :binary_id, autogenerate: true}
  @timestamps_opts [type: :utc_datetime_usec]
  @statuses [:pending, :accepted, :cancelled]
  @expires_in_days 7
  @token_context "team_invitation"

  schema "team_invitations" do
    field :email, :string
    field :token, :string, virtual: true
    field :token_digest, :string
    field :status, Ecto.Enum, values: @statuses, default: :pending
    field :expires_at, :utc_datetime_usec
    field :accepted_at, :utc_datetime_usec

    belongs_to :team, Team, type: Ecto.UUID
    belongs_to :inviter, User

    timestamps()
  end

  def create_changeset(%TeamInvitation{} = invitation, attrs) do
    invitation
    |> cast(attrs, [:team_id, :email, :inviter_id])
    |> put_invitation_id()
    |> normalize_email()
    |> put_token()
    |> put_server_expires_at()
    |> validate_required([:team_id, :email, :token_digest, :status, :expires_at])
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/)
    |> unique_constraint(:token_digest)
    |> unique_constraint(:email, name: :team_invitations_pending_team_email_index)
  end

  def cancel_changeset(%TeamInvitation{} = invitation) do
    invitation
    |> change(status: :cancelled)
  end

  def accept_changeset(%TeamInvitation{} = invitation, accepted_at) do
    invitation
    |> change(status: :accepted, accepted_at: accepted_at)
  end

  defp normalize_email(changeset) do
    update_change(changeset, :email, fn email ->
      email
      |> String.trim()
      |> String.downcase()
    end)
  end

  defp put_invitation_id(%Ecto.Changeset{valid?: true} = changeset) do
    case get_field(changeset, :id) do
      id when is_binary(id) -> changeset
      _id -> put_change(changeset, :id, Ecto.UUID.generate())
    end
  end

  defp put_invitation_id(changeset), do: changeset

  defp put_token(%Ecto.Changeset{valid?: true} = changeset) do
    token = token_for_id(get_field(changeset, :id))

    changeset
    |> put_change(:token, token)
    |> put_change(:token_digest, token_digest(token))
  end

  defp put_token(changeset), do: changeset

  defp put_server_expires_at(changeset) do
    put_change(changeset, :expires_at, default_expires_at())
  end

  defp default_expires_at do
    DateTime.utc_now()
    |> DateTime.add(@expires_in_days, :day)
  end

  def token_digest(token) when is_binary(token) do
    :crypto.mac(:hmac, :sha256, token_secret(), "#{@token_context}:digest:#{token}")
    |> Base.encode64(padding: false)
  end

  def token(%TeamInvitation{id: id}), do: token_for_id(id)

  def token_for_id(id) when is_binary(id) do
    case Ecto.UUID.cast(id) do
      {:ok, uuid} ->
        signature =
          :crypto.mac(:hmac, :sha256, token_secret(), "#{@token_context}:token:#{uuid}")
          |> Base.url_encode64(padding: false)

        "#{uuid}.#{signature}"

      :error ->
        nil
    end
  end

  def token_for_id(_id), do: nil

  defp token_secret do
    :form_delegate
    |> Application.fetch_env!(FormDelegateWeb.Endpoint)
    |> Keyword.fetch!(:secret_key_base)
  end
end
