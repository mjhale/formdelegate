defmodule FormDelegateWeb.ResetPasswordView do
  use FormDelegateWeb, :view

  alias FormDelegateWeb.ResetPasswordView

  def render("show.json", %{user: user}) do
    %{
      data: render_one(user, ResetPasswordView, "reset_password.json", as: :user)
    }
  end

  def render("reset_password.json", %{user: user}) do
    %{
      email: user.email
    }
  end
end
