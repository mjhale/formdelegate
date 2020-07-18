defmodule FormDelegateWeb.Mailers.ResetPasswordRequestMailer do
  use Bamboo.Phoenix, view: FormDelegateWeb.EmailView
  import FormDelegateWeb.Mailers.BaseEmail, only: [base_email: 0]

  alias FormDelegate.Accounts.User
  alias FormDelegateWeb.Mailers

  def send_reset_password_request_email(%User{} = user) do
    Rihanna.enqueue(Mailers.EnqueueEmail, reset_password_request_email(user))
  end

  defp reset_password_request_email(%User{} = user) do
    base_email()
    |> to({user.name, user.email})
    |> subject("Password Reset Request for Form Delegate")
    |> assign(:user, user)
    |> assign(
      :reset_password_frontend_url,
      "#{frontend_url()}/reset?token=#{user.reset_password_token}"
    )
    |> render(:reset_password)
  end

  defp frontend_url do
    Application.get_env(:form_delegate, :frontend_url)
  end
end
