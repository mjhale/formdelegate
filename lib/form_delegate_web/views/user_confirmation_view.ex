defmodule FormDelegateWeb.UserConfirmationView do
  use FormDelegateWeb, :view
  alias FormDelegateWeb.UserConfirmationView

  def render("show.json", %{user: user}) do
    %{
      data: render_one(user, UserConfirmationView, "user_confirmation.json", as: :user)
    }
  end

  def render("user_confirmation.json", %{user: user}) do
    %{
      email: user.email
    }
  end
end
