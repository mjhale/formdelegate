defmodule FormDelegate.Jobs.TeamInvitationEmail do
  use Oban.Worker, queue: :mailer

  alias Bamboo.Email
  alias FormDelegate.{Repo, Teams.TeamInvitation}
  alias FormDelegateWeb.MailService
  alias FormDelegateWeb.Mailers.TeamInvitationMailer

  require Logger

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"invitation_id" => invitation_id}}) do
    invitation =
      case Repo.get(TeamInvitation, invitation_id) do
        %TeamInvitation{} = invitation ->
          invitation
          |> Repo.preload([:team, :inviter])
          |> Map.put(:token, TeamInvitation.token(invitation))

        nil ->
          nil
      end

    if deliverable?(invitation) do
      Logger.info("FD: Sending team invitation email to #{invitation.email}")

      {:ok, %Email{} = _email, _response} =
        invitation
        |> TeamInvitationMailer.team_invitation_email()
        |> MailService.deliver_now(response: true)
    end

    :ok
  end

  defp deliverable?(%TeamInvitation{status: :pending, expires_at: expires_at, token: token})
       when is_binary(token) and byte_size(token) > 0 do
    DateTime.compare(DateTime.utc_now(), expires_at) != :gt
  end

  defp deliverable?(_invitation), do: false
end
