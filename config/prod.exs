use Mix.Config

# For production, we configure the host to read the PORT
# from the system environment. Therefore, you will need
# to set PORT=80 before running your server.
#
# You should also configure the url host to something
# meaningful, we use this information when generating URLs.
#
# Finally, we also include the path to a manifest
# containing the digested version of static files. This
# manifest is generated by the mix phoenix.digest task
# which you typically run after static files are built.
config :form_delegate, FormDelegateWeb.Endpoint,
  load_from_system_env: true,
  http: [port: {:system, "PORT"}],
  url: [host: "api.formdelegate.com", port: 443],
  force_ssl: [rewrite_on: [:x_forwarded_proto]],
  secret_key_base: Map.fetch!(System.get_env(), "SECRET_KEY_BASE"),
  server: true

config :form_delegate, FormDelegate.Repo,
  url: System.get_env("DATABASE_URL"),
  pool_size: 2,
  ssl: true

# Do not print debug messages in production
config :logger, level: :info

# ## SSL Support
#
# To get SSL working, you will need to add the `https` key
# to the previous section and set your `:url` port to 443:
#
#     config :example_api, ExampleAPIWeb.Endpoint,
#       ...
#       url: [host: "example.com", port: 443],
#       https: [:inet6,
#               port: 443,
#               keyfile: System.get_env("SOME_APP_SSL_KEY_PATH"),
#               certfile: System.get_env("SOME_APP_SSL_CERT_PATH")]
#
# Where those two env variables return an absolute path to
# the key and cert in disk or a relative path inside priv,
# for example "priv/ssl/server.key".
#
# We also recommend setting `force_ssl`, ensuring no data is
# ever sent via http, always redirecting to https:
#
#     config :example_api, ExampleAPIWeb.Endpoint,
#       force_ssl: [hsts: true]
#
# Check `Plug.SSL` for all available options in `force_ssl`.

# ## Using releases
#
# If you are doing OTP releases, you need to instruct Phoenix
# to start the server for all endpoints:
#
#     config :phoenix, :serve_endpoints, true
#
# Alternatively, you can configure exactly which server to
# start per endpoint:
#
#     config :example_api, ExampleAPIWeb.Endpoint, server: true
#

# Configures Bamboo mailer
config :form_delegate, FormDelegate.Mailer,
  adapter: Bamboo.SparkPostAdapter,
  api_key: System.get_env("SPARKPOST_KEY")

# Configures CORS options
config :cors_plug,
  origin: ["https://www.formdelegate.com", "http://localhost:3000"],
  max_age: 86400,
  expose: ["Per-Page", "Total", "Link"]

# Configures Guardian
config :form_delegate, FormDelegateWeb.Guardian,
  allowed_algos: ["HS512"],
  issuer: "form_delegate_web",
  secret_key: %{
    "k" => System.get_env("GUARDIAN_SECRET"),
    "kty" => "oct"
  },
  ttl: { 14, :days },
  verify_issuer: true

# Finally import the config/prod.secret.exs
# which should be versioned separately.
# import_config "prod.secret.exs"
