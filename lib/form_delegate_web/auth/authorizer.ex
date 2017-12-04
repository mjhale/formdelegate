defmodule FormDelegateWeb.Authorizer do
  alias FormDelegate.Accounts.User

  def authorize(%User{} = _current_user, :create_user), do: :ok

  def authorize(%User{} = current_user, :show_user, %User{} = user) do
    if user.id == current_user.id or current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(%User{} = current_user, :update_user, %User{} = user) do
    if user.id == current_user.id or current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end
end
