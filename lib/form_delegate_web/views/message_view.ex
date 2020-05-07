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
      id: message.id,
      form:
        render_one(
          message.form,
          FormView,
          "form.json"
        ),
      content: message.content,
      sender: message.sender,
      flagged_at: message.flagged_at,
      flagged_type:
        render_one(
          message.flagged_type,
          FlaggedTypeView,
          "flagged_type.json"
        ),
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
