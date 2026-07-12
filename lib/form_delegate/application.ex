defmodule FormDelegate.Application do
  use Application
  require Logger

  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  def start(_type, _args) do
    :ok = FormDelegate.Telemetry.attach_handlers()

    # Define workers and child supervisors to be supervised
    children = [
      # Start the PubSub system
      {Phoenix.PubSub, name: FormDelegate.PubSub},
      # Start the Ecto repository
      FormDelegate.Repo,
      # Start the endpoint when the application starts
      FormDelegateWeb.Endpoint,
      {Oban, Application.fetch_env!(:form_delegate, Oban)}

      # Start your own worker by calling: FormDelegate.Worker.start_link(arg1, arg2, arg3)
      # worker(FormDelegate.Worker, [arg1, arg2, arg3]),
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: FormDelegate.Supervisor]

    case Supervisor.start_link(children, opts) do
      {:ok, pid} ->
        maybe_schedule_billing_count_job()
        {:ok, pid}

      other ->
        other
    end
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    FormDelegateWeb.Endpoint.config_change(changed, removed)
    :ok
  end

  defp maybe_schedule_billing_count_job do
    oban_config = Application.get_env(:form_delegate, Oban, [])

    unless Keyword.has_key?(oban_config, :testing) do
      case FormDelegate.Jobs.BillingCounts.schedule_next() do
        {:ok, _job} ->
          :ok

        {:error, error} ->
          Logger.warning("Unable to schedule billing count worker: #{inspect(error)}")
      end
    end
  rescue
    error ->
      Logger.warning("Unable to schedule billing count worker: #{Exception.message(error)}")
  end
end
