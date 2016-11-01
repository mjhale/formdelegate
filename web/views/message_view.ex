defmodule FormDelegate.MessageView do
  use FormDelegate.Web, :view

  def render("index.json", %{messages: messages}) do
    %{data: render_many(messages, FormDelegate.MessageView, "message.json")}
  end

  def render("show.json", %{message: message}) do
    %{data: render_one(message, FormDelegate.MessageView, "message.json")}
  end

  def render("message.json", %{message: message}) do
    %{
      id: message.id,
      content: message.content,
      sender: message.sender,
      inserted_at: message.inserted_at,
      updated_at: message.updated_at,
    }
  end
end
