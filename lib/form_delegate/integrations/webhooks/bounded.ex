defmodule FormDelegate.Integrations.Webhooks.Bounded do
  @moduledoc false

  # DNS and hackney's TLS handshake need an outer bound as well as socket timeouts.
  def run(fun, timeout) do
    owner = self()
    token = make_ref()
    {pid, monitor} = spawn_monitor(fn -> send(owner, {token, fun.()}) end)

    receive do
      {^token, result} ->
        Process.demonitor(monitor, [:flush])
        result

      {:DOWN, ^monitor, :process, ^pid, _reason} ->
        {:error, :worker_failed}
    after
      timeout ->
        Process.exit(pid, :kill)

        receive do
          {:DOWN, ^monitor, :process, ^pid, _reason} -> :ok
        end

        receive do
          {^token, _result} -> :ok
        after
          0 -> :ok
        end

        {:error, :timeout}
    end
  end
end
