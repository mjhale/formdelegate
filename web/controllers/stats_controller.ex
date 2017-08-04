defmodule FormDelegate.StatsController do
  use FormDelegate.Web, :controller

  alias FormDelegate.Message

  plug Guardian.Plug.EnsureAuthenticated, handler: FormDelegate.SessionController

  def message_activity(conn, _params) do
    current_account = Guardian.Plug.current_resource(conn)
    query = from m in Message,
      right_join: day in fragment("SELECT generate_series(CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE, '1 day') :: date AS d"),
      on: day.d == fragment("date(?)", m.inserted_at),
      on: m.account_id == ^current_account.id,
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
