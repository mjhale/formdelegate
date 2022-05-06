import Config

# config/runtime.exs is executed for all environments, including
# during releases. It is executed after compilation and before the
# system starts, so it is typically used to load production configuration
# and secrets from environment variables or elsewhere. Do not define
# any compile-time configuration in here, as it won't be applied.
# The block below contains prod specific runtime configuration.

# ## Using releases
#
# If you use `mix release`, you need to explicitly enable the server
# by passing the PHX_SERVER=true when you start it:
#
#     PHX_SERVER=true bin/form_delegate start
#
# Alternatively, you can use `mix phx.gen.release` to generate a `bin/server`
# script that automatically sets the env var above.
if System.get_env("PHX_SERVER") do
  config :form_delegate, FormDelegateWeb.Endpoint, server: true
end

if config_env() == :prod do
  database_url =
    System.get_env("DATABASE_URL") ||
      raise """
      environment variable DATABASE_URL is missing.
      For example: ecto://USER:PASS@HOST/DATABASE
      """

  maybe_ipv6 = if System.get_env("ECTO_IPV6"), do: [:inet6], else: []

  config :form_delegate, FormDelegate.Repo,
    # ssl: true,
    url: database_url,
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
    socket_options: maybe_ipv6

  # The secret key base is used to sign/encrypt cookies and other secrets.
  # A default value is used in config/dev.exs and config/test.exs but you
  # want to use a different value for prod and you most likely don't want
  # to check this value into version control, so we use an environment
  # variable instead.
  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise """
      environment variable SECRET_KEY_BASE is missing.
      You can generate one by calling: mix phx.gen.secret
      """

  host = System.get_env("PHX_HOST") || "api.formdelegate.com"
  port = String.to_integer(System.get_env("PORT") || "4000")

  config :form_delegate, FormDelegateWeb.Endpoint,
    # load_from_system_env: true,
    url: [host: host, port: 443, scheme: "https"],
    http: [
      # Enable IPv6 and bind on all interfaces.
      # Set it to  {0, 0, 0, 0, 0, 0, 0, 1} for local network only access.
      # See the documentation on https://hexdocs.pm/plug_cowboy/Plug.Cowboy.html
      # for details about using IPv6 vs IPv4 and loopback vs public addresses.
      ip: {0, 0, 0, 0, 0, 0, 0, 0},
      port: port
    ],
    secret_key_base: secret_key_base

  # ## Configuring the mailer
  #
  # In production you need to configure the mailer to use a different adapter.
  # Also, you may need to configure the Swoosh API client of your choice if you
  # are not using SMTP. Here is an example of the configuration:
  #
  #     config :form_delegate, FormDelegate.Mailer,
  #       adapter: Swoosh.Adapters.Mailgun,
  #       api_key: System.get_env("MAILGUN_API_KEY"),
  #       domain: System.get_env("MAILGUN_DOMAIN")
  #
  # For this example you need include a HTTP client required by Swoosh API client.
  # Swoosh supports Hackney and Finch out of the box:
  #
  #     config :swoosh, :api_client, Swoosh.ApiClient.Hackney
  #
  # See https://hexdocs.pm/swoosh/Swoosh.html#module-installation for details.

  # Configures Bamboo mailer
  config :form_delegate, FormDelegateWeb.MailService,
    adapter: Bamboo.PostmarkAdapter,
    api_key: System.get_env("POSTMARK_API_KEY") || raise("Env var not set: POSTMARK_API_KEY")

  # Configures CORS options
  config :cors_plug,
    origin: ["https://www.formdelegate.com"],
    max_age: 86400,
    expose: ["Per-Page", "Total", "Link"]

  # Configures Guardian
  config :form_delegate, FormDelegateWeb.Guardian,
    allowed_algos: ["HS512"],
    issuer: "form_delegate_web",
    secret_key: %{
      "k" => System.get_env("GUARDIAN_SECRET") || raise("Env var not set: GUARDIAN_SECRET"),
      "kty" => "oct"
    },
    ttl: {14, :days},
    verify_issuer: true

  # Configures Akismet module to use Tesla HTTP client
  config :form_delegate, :akismet_api, FormDelegate.Services.Akismet.Tesla

  # Configures Hcaptcha module to use Tesla HTTP client
  config :form_delegate, :hcaptcha_api, FormDelegate.Services.Hcaptcha.Tesla

  # Configures ExAws and ExAws S3
  config :ex_aws,
    access_key_id:
      System.get_env("AWS_ACCESS_KEY_ID") || raise("Env var not set: AWS_ACCESS_KEY_ID"),
    secret_access_key:
      System.get_env("AWS_SECRET_ACCESS_KEY") || raise("Env var not set: AWS_SECRET_ACCESS_KEY"),
    region:
      System.get_env("AWS_SECRET_ACCESS_KEY") || raise("Env var not set: AWS_SECRET_ACCESS_KEY")

  config :ex_aws, :s3,
    storage: Waffle.Storage.S3,
    scheme: System.get_env("AWS_S3_SCHEME") || raise("Env var not set: AWS_S3_SCHEME"),
    host: System.get_env("AWS_S3_HOST") || raise("Env var not set: AWS_S3_HOST")

  # Configures Waffle
  config :waffle,
    storage: Waffle.Storage.S3,
    bucket: System.get_env("AWS_S3_BUCKET") || raise("Env var not set: AWS_S3_BUCKET"),
    asset_host: System.get_env("AWS_S3_ASSET_HOST") || raise("Env var not set: AWS_S3_ASSET_HOST")

  # Configures Stripe
  config :stripity_stripe,
    api_key: System.get_env("STRIPE_SECRET") || raise("Env var not set: STRIPE_SECRET")

  # Configure frontend URL for user-targetted actions and messaging
  config :form_delegate,
    frontend_url: System.get_env("FRONTEND_URL") || raise("Env var not set: FRONTEND_URL")
end
