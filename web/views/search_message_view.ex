defmodule FormDelegate.SearchMessageView do
  use FormDelegate.Web, :view

  def render("index.json", %{messages: messages}) do
    %{data: render_many(messages, FormDelegate.MessageView, "message.json")}
  end

  def render("message.json", %{message: message}) do
    %{
      id: message.id,
      content: message.content,
      sender: message.sender,
      unknown_fields: message.unknown_fields,
      inserted_at: message.inserted_at,
      updated_at: message.updated_at,
    }
  end
end
