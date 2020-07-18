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
  pubsub_server: FormDelegate.PubSub

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Configures the defaults for Guardian
config :form_delegate, FormDelegateWeb.Guardian,
  allowed_algos: ["HS512"],
  issuer: "form_delegate_web",
  secret_key: %{
    "k" =>
      "EBz9UGZXtQNUTsW5pAFMARky3_AhjSYZd5GEAUqunrBiph0zEieEQSJ6sX3W4mFEFu8u_TZxO0jTygAfvL5c4Q",
    "kty" => "oct"
  },
  ttl: {14, :days},
  verify_issuer: true

# Use Jason for JSON parsing in Phoenix and Bamboo
config :phoenix, :json_library, Jason
config :bamboo, :json_library, Jason

# Use Ecto Repo with Rihanna queue
config :rihanna,
  producer_postgres_connection: {Ecto, FormDelegate.Repo}

# HTTP client adapter for Tesla
config :tesla, adapter: Tesla.Adapter.Hackney

# Configures ExAws and ExAws S3
config :ex_aws,
  json_codec: Jason,
  access_key_id: {:system, "AWS_ACCESS_KEY_ID"},
  secret_access_key: {:system, "AWS_SECRET_ACCESS_KEY"},
  region: {:system, "AWS_REGION"}

config :ex_aws, :s3,
  host: {:system, "AWS_S3_HOST"},
  scheme: {:system, "AWS_S3_SCHEME"}

# Configures Waffle
config :waffle,
  storage: Waffle.Storage.S3,
  bucket: {:system, "AWS_S3_BUCKET"},
  asset_host: {:system, "AWS_S3_ASSET_HOST"}

# Configures frontend URL for user-targetted actions and messaging
config :form_delegate, frontend_url: System.get_env("FRONTEND_URL")

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
