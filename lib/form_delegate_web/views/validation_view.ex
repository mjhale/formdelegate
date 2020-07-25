defmodule FormDelegateWeb.ValidationView do
  use FormDelegateWeb, :view

  def render("email.json", %{email: email, is_valid: is_valid}) do
    %{
      data: %{
        email: email,
        is_valid: is_valid
      }
    }
  end
end
