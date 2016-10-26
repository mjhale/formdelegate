defmodule FormDelegate.Admin.MessageView do
  use FormDelegate.Web, :view

  def render("index.json", %{messages: messages}) do
    %{data: render_many(messages, FormDelegate.Admin.MessageView, "message.json")}
  end

  def render("show.json", %{message: message}) do
    %{data: render_one(message, FormDelegate.Admin.MessageView, "message.json")}
  end

  def render("message.json", %{message: message}) do
    %{
      id: message.id,
      content: message.content,
      sender: message.sender,
    }
  end
end
