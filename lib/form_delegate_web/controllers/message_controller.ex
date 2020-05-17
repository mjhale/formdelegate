defmodule FormDelegateWeb.MessageController do
  use FormDelegateWeb, :controller

  alias FormDelegateWeb.Authorizer
  alias FormDelegate.{Messages, Messages.Message}

  action_fallback FormDelegateWeb.FallbackController

  def action(%Plug.Conn{assigns: %{current_user: current_user}} = conn, _opts) do
    args = [conn, conn.params, current_user]
    apply(__MODULE__, action_name(conn), args)
  end

  def ham(conn, %{"id" => id}, current_user) do
    with %Message{} = message <- Messages.get_message!(id),
         :ok <- Authorizer.authorize(:update_message_state, current_user, message),
         {:ok, message} <-
           Messages.flag_message(message, %{
             flagged_at: nil,
             flagged_type: nil
           }),
         {:ok, true} <- akismet_api().submit_ham(System.get_env("AKISMET_API_KEY"), message) do
      render(conn, "show.json", message: message)
    end
  end

  def index(conn, params, current_user) do
    with :ok <- Authorizer.authorize(:show_user_messages, current_user) do
      page =
        cond do
          params["query"] -> Messages.list_search_messages_of_user(current_user, params)
          true -> Messages.list_messages_of_user(current_user, params)
        end

      conn
      |> Scrivener.Headers.paginate(page)
      |> render("index.json", messages: page.entries)
    end
  end

  def recent_activity(conn, _params, current_user) do
    with :ok <- Authorizer.authorize(:show_recent_message_activity, current_user) do
      activity = Messages.get_message_activity_of_user(current_user)

      render(conn, "recent_activity.json", activity: activity)
    end
  end

  def spam(conn, %{"id" => id}, current_user) do
    with %Message{} = message <- Messages.get_message!(id),
         :ok <- Authorizer.authorize(:update_message_state, current_user, message),
         {:ok, message} <-
           Messages.flag_message(message, %{
             flagged_at: NaiveDateTime.utc_now(),
             flagged_type:
               Messages.get_or_create_flagged_type(%{
                 type: "spam"
               })
           }),
         {:ok, true} <- akismet_api().submit_spam(System.get_env("AKISMET_API_KEY"), message) do
      render(conn, "show.json", message: message)
    end
  end

  def show(conn, %{"id" => id}, current_user) do
    with %Message{} = message <- Messages.get_message!(id),
         :ok <- Authorizer.authorize(:show_message, current_user, message) do
      render(conn, "show.json", message: message)
    end
  end

  defp akismet_api do
    Application.get_env(:form_delegate, :akismet_api)
  end
end
