defmodule FormDelegate.StatsView do
  use FormDelegate.Web, :view

  def render("message_activity.json", %{activity: activity}) do
    %{
      data: Enum.map(activity, fn(x) ->
        # convert date tuple to string
        update_in(x, [:day], &(Ecto.Date.from_erl(&1)))
      end)
    }
  end
end
