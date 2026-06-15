{:ok, _} = Application.ensure_all_started(:ex_machina)

ExUnit.start(capture_log: true)

Ecto.Adapters.SQL.Sandbox.mode(FormDelegate.Repo, :manual)
