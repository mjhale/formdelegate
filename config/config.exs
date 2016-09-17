# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :form_delegate,
  ecto_repos: [FormDelegate.Repo]

# Configures the endpoint
config :form_delegate, FormDelegate.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "GkaatwxvDjnh98SB762NswtanDoaBP0/cyeLPl0G/dUoHNKvd70FMXGSrJjH/y5q",
  render_errors: [view: FormDelegate.ErrorView, accepts: ~w(html json)],
  pubsub: [name: FormDelegate.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :guardian, Guardian,
  allowed_algos: ["HS512"],
  verify_module: Guardian.JWT,
  issuer: "FormDelegate",
  ttl: { 14, :days },
  verify_issuer: true,
  secret_key: %{
    "k" => "5Fn8i7r5cRWZW_yyr9Flkg",
    "kty" => "oct"
  },
  serializer: FormDelegate.GuardianSerializer

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
