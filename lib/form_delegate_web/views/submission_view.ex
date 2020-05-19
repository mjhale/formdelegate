defmodule FormDelegateWeb.SubmissionView do
  use FormDelegateWeb, :view

  alias FormDelegateWeb.FlaggedTypeView
  alias FormDelegateWeb.FormView
  alias FormDelegateWeb.SubmissionView

  def render("index.json", %{submissions: submissions}) do
    %{data: render_many(submissions, SubmissionView, "submission.json")}
  end

  def render("show.json", %{submission: submission}) do
    %{data: render_one(submission, SubmissionView, "submission.json")}
  end

  def render("submission.json", %{submission: submission}) do
    %{
      content: submission.content,
      flagged_at: submission.flagged_at,
      flagged_type:
        render_one(
          submission.flagged_type,
          FlaggedTypeView,
          "flagged_type.json"
        ),
      form:
        render_one(
          submission.form,
          FormView,
          "form.json"
        ),
      id: submission.id,
      sender: submission.sender,
      sender_ip: submission.sender_ip,
      sender_referrer: submission.sender_referrer,
      sender_user_agent: submission.sender_user_agent,
      unknown_fields: submission.unknown_fields,
      inserted_at: submission.inserted_at,
      updated_at: submission.updated_at
    }
  end

  def render("recent_activity.json", %{activity: activity}) do
    %{
      data: activity
    }
  end
end
