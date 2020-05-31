defmodule FormDelegateWeb.Mailers.ResetPassword do
  use Bamboo.Phoenix, view: FormDelegateWeb.EmailView

  alias FormDelegate.Accounts.User
  alias FormDelegateWeb.Mailers

  def send_reset_password_email(%User{} = user) do
    Rihanna.enqueue(Mailers.EnqueueEmail, reset_password_email(user))
  end

  defp reset_password_email(%User{} = user) do
    new_email(to: user.email)
    |> subject("Password Reset Request for Form Delegate")
    |> from({"Form Delegate", "no-reply@formdelegate.com"})
    |> render(:reset_password, user: user)
  end
end
