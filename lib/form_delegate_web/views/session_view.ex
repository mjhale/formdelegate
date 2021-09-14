defmodule FormDelegateWeb.SessionView do
  use FormDelegateWeb, :view
  alias FormDelegateWeb.SessionView

  def render("show.json", %{session: session}) do
    %{data: render_one(session, SessionView, "session.json")}
  end

  def render("session.json", %{session: session}) do
    %{id: session.user.id, token: session.token}
  end
end
