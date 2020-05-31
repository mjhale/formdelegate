defmodule FormDelegateWeb.Mailers.UserConfirmation do
  use Bamboo.Phoenix, view: FormDelegateWeb.EmailView

  alias FormDelegate.Accounts.User
  alias FormDelegateWeb.Mailers

  def send_user_confirmation_email(%User{} = user) do
    Rihanna.enqueue(Mailers.EnqueueEmail, user_confirmation_email(user))
  end

  defp user_confirmation_email(%User{} = user) do
    new_email(to: user.email)
    |> subject("Welcome to Form Delegate")
    |> from({"Form Delegate", "no-reply@formdelegate.com"})
    |> render(:user_confirmation, user: user)
  end
end
