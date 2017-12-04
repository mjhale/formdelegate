# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :form_delegate,
  namespace: FormDelegate,
  ecto_repos: [FormDelegate.Repo]

# Configures the endpoint
config :form_delegate, FormDelegateWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "GkaatwxvDjnh98SB762NswtanDoaBP0/cyeLPl0G/dUoHNKvd70FMXGSrJjH/y5q",
  render_errors: [view: FormDelegateWeb.ErrorView, accepts: ~w(json)],
  pubsub: [name: FormDelegate.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Configures the defaults for Guardian
config :form_delegate, FormDelegateWeb.Guardian,
  allowed_algos: ["HS512"],
  issuer: "form_delegate_web",
  secret_key: %{
    "k" => "EBz9UGZXtQNUTsW5pAFMARky3_AhjSYZd5GEAUqunrBiph0zEieEQSJ6sX3W4mFEFu8u_TZxO0jTygAfvL5c4Q",
    "kty" => "oct"
  },
  ttl: { 14, :days },
  verify_issuer: true

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
