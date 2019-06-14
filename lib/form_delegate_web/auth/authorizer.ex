defmodule FormDelegateWeb.Authorizer do
  alias FormDelegate.Accounts.User
  alias FormDelegate.Forms.Form
  alias FormDelegate.Integrations.Integration
  alias FormDelegate.Messages.Message

  # Form authorizations
  def authorize(%User{} = current_user, :show_user_forms) do
    if current_user do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(%User{} = current_user, :create_form) do
    if current_user do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(%User{} = current_user, :show_form, %Form{} = form) do
    if form.user_id == current_user.id or current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(%User{} = current_user, :update_form, %Form{} = form) do
    if form.user_id == current_user.id or current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(%User{} = current_user, :delete_form, %Form{} = form) do
    if form.user_id == current_user.id or current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end

  # Integration authorizations
  def authorize(%User{} = current_user, :update_integration, %Integration{} = _integration) do
    if current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end

  # Message authorizations
  def authorize(%User{} = current_user, :show_user_messages) do
    if current_user do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(%User{} = current_user, :show_recent_message_activity) do
    if current_user do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(%User{} = current_user, :show_message, %Message{} = message) do
    if message.user_id == current_user.id or current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(%User{} = current_user, :update_message, %Message{} = message) do
    if message.user_id == current_user.id or current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(%User{} = current_user, :delete_message, %Message{} = message) do
    if message.user_id == current_user.id or current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end

  # User authorizations
  def authorize(%User{} = current_user, :show_users) do
    if current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(current_user, :create_user) do
    if current_user == :guest do
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
