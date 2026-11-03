defmodule FormDelegate.Jobs.TeamInvitationEmail do
  use Oban.Worker, queue: :mailer

  alias FormDelegate.{Repo, Teams.TeamInvitation}
  alias FormDelegateWeb.MailService
  alias FormDelegateWeb.Mailers.TeamInvitationMailer

  require Logger

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"invitation_id" => invitation_id}} = job) do
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
      Logger.info("FD: Sending team invitation email invitation_id=#{invitation.id}")

      invitation
      |> TeamInvitationMailer.team_invitation_email()
      |> MailService.deliver_job(job)
    else
      :ok
    end
  end

  defp deliverable?(%TeamInvitation{status: :pending, expires_at: expires_at, token: token})
       when is_binary(token) and byte_size(token) > 0 do
    DateTime.compare(DateTime.utc_now(), expires_at) != :gt
  end

  defp deliverable?(_invitation), do: false
end
