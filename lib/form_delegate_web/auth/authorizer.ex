defmodule FormDelegateWeb.Authorizer do
  alias FormDelegate.Accounts.User

  # User authorizations
  def authorize(%User{} = current_user, :show_users) do
    if current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(%User{} = current_user, :create_user) do
    unless current_user do
      :ok
    else
      {:error, :forbidden}
    end
  end

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

  def authorize(%User{} = current_user, :delete_user, %User{} = user) do
    if user.id == current_user.id or current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end
end
