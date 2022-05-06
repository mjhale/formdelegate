defmodule FormDelegateWeb.Mailers.UserConfirmationMailer do
  use Bamboo.Phoenix, view: FormDelegateWeb.EmailView
  import FormDelegateWeb.Mailers.BaseEmail, only: [base_email: 0]

  alias FormDelegate.Accounts.User
  alias FormDelegateWeb.Mailers

  def send_user_confirmation_email(%User{} = user) do
    Rihanna.enqueue(Mailers.EnqueueEmail, user_confirmation_email(user))
  end

  defp user_confirmation_email(%User{} = user) do
    base_email()
    |> to({user.name, user.email})
    |> subject("Confirm Your Form Delegate Account")
    |> assign(:user, user)
    |> assign(
      :user_confirmation_frontend_url,
      "#{frontend_url()}/user-confirmation?token=#{user.confirmation_token}"
    )
    |> render(:user_confirmation)
  end

  defp frontend_url do
    Application.get_env(:form_delegate, :frontend_url)
  end
end
