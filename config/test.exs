use Mix.Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :form_delegate, FormDelegateWeb.Endpoint,
  http: [port: 4001],
  server: false

# Print only warnings and errors during test
config :logger, level: :warn

# Configure your database
config :form_delegate, FormDelegate.Repo,
  username: "postgres",
  password: "postgres",
  database: "form_delegate_test",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox

# Configures Akismet module to use an in-memory mock
config :form_delegate, :akismet_api, FormDelegate.Services.Akismet.InMemory
