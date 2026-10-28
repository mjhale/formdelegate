import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :form_delegate, FormDelegateWeb.Endpoint,
  http: [port: 4001],
  server: false

# Print only warnings and errors during test
config :logger, level: :warning

# Configure your database
config :form_delegate, FormDelegate.Repo,
  username: "postgres",
  password: "postgres",
  database: System.get_env("FORM_DELEGATE_TEST_DATABASE", "form_delegate_test"),
  hostname: "localhost",
  port: String.to_integer(System.get_env("FORM_DELEGATE_TEST_DATABASE_PORT", "5432")),
  parameters: [timezone: "UTC"],
  pool: Ecto.Adapters.SQL.Sandbox

# Configures Bamboo mailer
config :form_delegate, FormDelegateWeb.MailService, adapter: Bamboo.TestAdapter

# Configures Akismet module to use an in-memory mock
config :form_delegate, :akismet_api, FormDelegate.Services.Akismet.InMemory

# Configures Hcaptcha module to use an in-memory mock
config :form_delegate, :hcaptcha_api, FormDelegate.Services.Hcaptcha.InMemory

# Configures Stripe module to use mock client
config :form_delegate, :stripe_api, FormDelegate.Services.Stripe.Mock

config :form_delegate, Oban, testing: :inline
