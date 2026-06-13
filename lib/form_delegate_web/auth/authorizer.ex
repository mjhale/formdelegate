defmodule FormDelegateWeb.Authorizer do
  import Ecto.Query, warn: false

  alias FormDelegate.Accounts.User
  alias FormDelegate.Forms.Form
  alias FormDelegate.Plans.Plan
  alias FormDelegate.Subscriptions.Subscription
  alias FormDelegate.Submissions.Submission
  alias FormDelegate.Memberships.Membership

  def authorize(:create_submission, _current_user) do
    :ok
  end

  def authorize(:create_form, %User{} = _current_user) do
    :ok
  end

  def authorize(:create_plan, %User{} = current_user) do
    if current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
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

  def authorize(:show_user_subscriptions, %User{} = _current_user) do
    :ok
  end

  def authorize(:show_users, %User{} = current_user) do
    if current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(:show_plans, %User{} = _current_user) do
    :ok
  end

  def authorize(:update_integration, %User{} = current_user) do
    if current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(:create_checkout_session, %User{} = current_user) do
    if billing_manager?(current_user) do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(:create_portal, %User{} = current_user) do
    if billing_manager?(current_user) do
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
    if submission.form.user_id == current_user.id do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(:update_submission_state, %User{} = current_user, %Submission{} = submission) do
    if submission.form.user_id == current_user.id do
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

  def authorize(:show_plan, %User{} = _current_user, %Plan{} = _plan) do
    :ok
  end

  def authorize(:update_plan, %User{} = current_user, %Plan{} = _plan) do
    if current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(:delete_plan, %User{} = current_user, %Plan{} = _plan) do
    if current_user.is_admin do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(
        :retrieve_subscription,
        %User{} = current_user,
        %Subscription{} = subscription
      ) do
    if current_user.is_admin or
         (current_user.team_id == subscription.team_id and billing_manager?(current_user)) do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(
        :update_stripe_subscription,
        %User{} = current_user,
        %Subscription{} = subscription
      ) do
    if current_user.is_admin or
         (current_user.team_id == subscription.team_id and billing_manager?(current_user)) do
      :ok
    else
      {:error, :forbidden}
    end
  end

  defp billing_manager?(%User{} = user) do
    if user.is_admin do
      true
    else
      query =
        from m in Membership,
          where:
            m.user_id == ^user.id and m.team_id == ^user.team_id and m.is_billing_account == true

      FormDelegate.Repo.exists?(query)
    end
  end
end
