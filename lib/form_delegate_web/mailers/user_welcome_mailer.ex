defmodule FormDelegateWeb.Mailers.UserWelcomeMailer do
  use Bamboo.Phoenix, view: FormDelegateWeb.EmailView
  import FormDelegateWeb.Mailers.BaseEmail, only: [base_email: 0]

  alias FormDelegate.Accounts.User

  def user_welcome_email(%User{} = user) do
    base_email()
    |> to({user.name, user.email})
    |> subject("Welcome to Form Delegate")
    |> assign(:user, user)
    |> assign(
      :user_confirmation_frontend_url,
      "#{frontend_url()}/user-confirmation?token=#{user.confirmation_token}"
    )
    |> render(:user_welcome)
  end

  defp frontend_url do
    Application.get_env(:form_delegate, :frontend_url)
  end
end
