defmodule FormDelegateWeb.Mailers.TeamInvitationMailer do
  use Bamboo.Phoenix, view: FormDelegateWeb.EmailView
  import FormDelegateWeb.Mailers.BaseEmail, only: [base_email: 0]

  alias FormDelegate.Teams.TeamInvitation

  def team_invitation_email(%TeamInvitation{} = invitation) do
    base_email()
    |> to(invitation.email)
    |> subject("You have been invited to Form Delegate")
    |> assign(:invitation, invitation)
    |> assign(:inviter_name, inviter_name(invitation))
    |> assign(:team_name, team_name(invitation))
    |> assign(:team_invitation_frontend_url, team_invitation_frontend_url(invitation))
    |> render(:team_invitation)
  end

  defp team_invitation_frontend_url(%TeamInvitation{token: token}) do
    "#{frontend_url()}/team-invitations/accept?token=#{token}"
  end

  defp frontend_url do
    Application.get_env(:form_delegate, :frontend_url)
  end

  defp inviter_name(%TeamInvitation{inviter: %{name: name}}) when is_binary(name), do: name
  defp inviter_name(%TeamInvitation{}), do: "A Form Delegate user"

  defp team_name(%TeamInvitation{team: %{name: name}}) when is_binary(name), do: name
  defp team_name(%TeamInvitation{}), do: "a Form Delegate team"
end
