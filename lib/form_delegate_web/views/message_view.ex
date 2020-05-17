defmodule FormDelegateWeb.MessageView do
  use FormDelegateWeb, :view

  alias FormDelegateWeb.FlaggedTypeView
  alias FormDelegateWeb.FormView
  alias FormDelegateWeb.MessageView

  def render("index.json", %{messages: messages}) do
    %{data: render_many(messages, MessageView, "message.json")}
  end

  def render("show.json", %{message: message}) do
    %{data: render_one(message, MessageView, "message.json")}
  end

  def render("message.json", %{message: message}) do
    %{
      content: message.content,
      flagged_at: message.flagged_at,
      flagged_type:
        render_one(
          message.flagged_type,
          FlaggedTypeView,
          "flagged_type.json"
        ),
      form:
        render_one(
          message.form,
          FormView,
          "form.json"
        ),
      id: message.id,
      sender: message.sender,
      sender_ip: message.sender_ip,
      sender_referrer: message.sender_referrer,
      sender_user_agent: message.sender_user_agent,
      unknown_fields: message.unknown_fields,
      inserted_at: message.inserted_at,
      updated_at: message.updated_at
    }
  end

  def render("recent_activity.json", %{activity: activity}) do
    %{
      data: activity
    }
  end
end
