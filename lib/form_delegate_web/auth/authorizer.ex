defmodule FormDelegateWeb.Authorizer do
  alias FormDelegate.Accounts.User
  alias FormDelegate.Forms.Form
  alias FormDelegate.Submissions.Submission

  def authorize(:create_submission, _current_user) do
    :ok
  end

  def authorize(:create_form, %User{} = _current_user) do
    :ok
  end

  def authorize(:register_user, current_user) do
    if current_user == :guest do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(:show_integration, %User{} = _current_user) do
    :ok
  end

  def authorize(:show_integrations, %User{} = _current_user) do
    :ok
  end

  def authorize(:show_user_forms, %User{} = _current_user) do
    :ok
  end

  def authorize(:show_recent_submission_activity, %User{} = _current_user) do
    :ok
  end

  def authorize(:show_user_submissions, %User{} = _current_user) do
    :ok
  end

  def authorize(:show_users, %User{} = current_user) do
    if current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(:update_integration, %User{} = current_user) do
    if current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(:show_form, %User{} = current_user, %Form{} = form) do
    if form.user_id == current_user.id or current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(:update_form, %User{} = current_user, %Form{} = form) do
    if form.user_id == current_user.id or current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(:delete_form, %User{} = current_user, %Form{} = form) do
    if form.user_id == current_user.id or current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(:show_submission, %User{} = current_user, %Submission{} = submission) do
    if submission.user_id == current_user.id do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(:update_submission_state, %User{} = current_user, %Submission{} = submission) do
    if submission.user_id == current_user.id do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(:show_user, %User{} = current_user, %User{} = user) do
    if user.id == current_user.id or current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(:update_user, %User{} = current_user, %User{} = user) do
    if user.id == current_user.id or current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(:delete_user, %User{} = current_user, %User{} = user) do
    if user.id == current_user.id or current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end
end
