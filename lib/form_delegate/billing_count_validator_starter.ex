defmodule FormDelegate.BillingCountValidatorStarter do
  use Task

  import Logger, only: [debug: 1]

  def start_link(arg) do
    Task.start_link(__MODULE__, :run, [arg])
  end

  def run(_arg) do
    current_time = DateTime.utc_now()

    debug("FD: Starting billing count validator at #{current_time}")

    {:ok, _job} = Rihanna.enqueue({FormDelegate.BillingCountValidatorJob, [current_time]})
  end
end
