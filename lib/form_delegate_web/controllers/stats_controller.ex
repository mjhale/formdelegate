defmodule FormDelegateWeb.StatsController do
  use FormDelegateWeb, :controller
  alias FormDelegate.Messages.Message
  alias FormDelegate.Repo

  def message_activity(conn, _params) do
    current_user = FormDelegateWeb.Guardian.Plug.current_resource(conn)
    query = from m in Message,
      right_join: day in fragment(
        "SELECT generate_series(CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE, '1 day') :: date AS d"
      ),
      on: day.d == fragment("date(?)", m.inserted_at),
      on: m.user_id == ^current_user.id,
      group_by: day.d,
      order_by: day.d,
      select: %{
        day: fragment("date(?)", day.d),
        message_count: count(m.id)
      }
    activity = Repo.all(query)

    render(conn, "message_activity.json", activity: activity)
  end
end
