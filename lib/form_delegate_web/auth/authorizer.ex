defmodule FormDelegateWeb.Authorizer do
  alias FormDelegate.Accounts.User
  alias FormDelegate.Forms.Form
  alias FormDelegate.Memberships.Membership
  alias FormDelegate.Plans.Plan
  alias FormDelegate.Submissions.Submission
  alias FormDelegate.Subscriptions.Subscription
  alias FormDelegate.Teams.Team

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

  def authorize(:create_form, %User{} = _current_user, %Membership{} = _membership) do
    :ok
  end

  def authorize(:show_user_forms, %User{} = _current_user, %Membership{} = _membership) do
    :ok
  end

  def authorize(
        :show_recent_submission_activity,
        %User{} = _current_user,
        %Membership{} = _membership
      ) do
    :ok
  end

  def authorize(:show_user_submissions, %User{} = _current_user, %Membership{} = _membership) do
    :ok
  end

  def authorize(:show_user_subscriptions, %User{} = _current_user, %Membership{} = _membership) do
    :ok
  end

  def authorize(:create_checkout_session, %User{} = current_user, %Membership{} = membership) do
    if current_user.is_admin or membership.is_billing_account do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(:create_portal, %User{} = current_user, %Membership{} = membership) do
    if current_user.is_admin or membership.is_billing_account do
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
        :show_form,
        %User{} = current_user,
        %Team{} = current_team,
        %Membership{} = membership,
        %Form{} = form
      ) do
    if current_user.is_admin or
         (membership.team_id == current_team.id and form_team_id(form) == current_team.id) do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(
        :update_form,
        %User{} = current_user,
        %Team{} = current_team,
        %Membership{} = membership,
        %Form{} = form
      ) do
    if current_user.is_admin or
         (membership.team_id == current_team.id and form_team_id(form) == current_team.id) do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(
        :delete_form,
        %User{} = current_user,
        %Team{} = current_team,
        %Membership{} = membership,
        %Form{} = form
      ) do
    if current_user.is_admin or
         (membership.team_id == current_team.id and form_team_id(form) == current_team.id) do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(
        :show_submission,
        %User{} = current_user,
        %Team{} = current_team,
        %Membership{} = membership,
        %Submission{} = submission
      ) do
    if current_user.is_admin or
         (membership.team_id == current_team.id and
            form_team_id(submission.form) == current_team.id) do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(
        :update_submission_state,
        %User{} = current_user,
        %Team{} = current_team,
        %Membership{} = membership,
        %Submission{} = submission
      ) do
    if current_user.is_admin or
         (membership.team_id == current_team.id and
            form_team_id(submission.form) == current_team.id) do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(
        :retrieve_subscription,
        %User{} = current_user,
        %Team{} = current_team,
        %Membership{} = membership,
        %Subscription{} = subscription
      ) do
    if current_user.is_admin or
         (membership.team_id == current_team.id and membership.is_billing_account and
            subscription.team_id == current_team.id) do
      :ok
    else
      {:error, :forbidden}
    end
  end

  def authorize(
        :update_stripe_subscription,
        %User{} = current_user,
        %Team{} = current_team,
        %Membership{} = membership,
        %Subscription{} = subscription
      ) do
    if current_user.is_admin or
         (membership.team_id == current_team.id and membership.is_billing_account and
            subscription.team_id == current_team.id) do
      :ok
    else
      {:error, :forbidden}
    end
  end

  defp form_team_id(%Form{team_id: team_id}), do: team_id
end
