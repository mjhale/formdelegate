defmodule Mix.Tasks.BillingCounts.Reconcile do
  use Mix.Task

  @shortdoc "Reconciles current resources and repairs submission undercounts"

  @impl Mix.Task
  def run(_args) do
    Mix.Task.run("app.start")

    :ok = FormDelegate.BillingCounts.reconcile_all_current_periods()

    Mix.shell().info(
      "Billing resources reconciled; submission reconciliation was upward-only to preserve consumed quota."
    )
  end
end
