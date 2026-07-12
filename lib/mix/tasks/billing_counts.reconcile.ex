defmodule Mix.Tasks.BillingCounts.Reconcile do
  use Mix.Task

  @shortdoc "Reconciles billing usage counters from source tables"

  @impl Mix.Task
  def run(_args) do
    Mix.Task.run("app.start")

    :ok = FormDelegate.BillingCounts.reconcile_all_current_periods()

    Mix.shell().info("Billing usage counters reconciled.")
  end
end
