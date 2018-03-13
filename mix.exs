defmodule FormDelegate.Mixfile do
  use Mix.Project

  def project do
    [app: :form_delegate,
     version: "0.0.1",
     elixir: "~> 1.4",
     elixirc_paths: elixirc_paths(Mix.env),
     compilers: [:phoenix, :gettext] ++ Mix.compilers,
     start_permanent: Mix.env == :prod,
     aliases: aliases(),
     deps: deps()]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [mod: {FormDelegate.Application, []},
      applications:
        [:phoenix,
         :phoenix_pubsub,
         :phoenix_html,
         :cowboy,
         :logger,
         :gettext,
         :phoenix_ecto,
         :postgrex,
         :comeonin,
         :bamboo,
         :bamboo_sparkpost,
         :pbkdf2_elixir,
         :guardian,
         :scrivener_ecto,
         :scrivener_headers,
         :cors_plug,
         :pbkdf2_elixir]]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_),     do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [{:phoenix, "~> 1.3.2"},
     {:phoenix_pubsub, "~> 1.0"},
     {:phoenix_ecto, "~> 3.3.0"},
     {:postgrex, ">= 0.0.0"},
     {:phoenix_html, "~> 2.11.0"},
     {:gettext, "~> 0.15"},
     {:cowboy, "~> 1.1.2"},
     {:guardian, "~> 1.0.1"},
     {:comeonin, "~> 4.1.1"},
     {:pbkdf2_elixir, "~> 0.12.3"},
     {:ex_machina, "~> 2.1.0", only: :test},
     {:bamboo, "~> 0.8"},
     {:bamboo_sparkpost, "~> 0.8.0"},
     {:scrivener_ecto, "~> 1.3.0"},
     {:scrivener_headers, "~> 3.1.1"},
     {:cors_plug, "~> 1.2"},
     {:distillery, "~> 1.5", runtime: false}]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to create, migrate and run the seeds file at once:
  #
  #     $ mix ecto.setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    ["ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
     "ecto.reset": ["ecto.drop", "ecto.setup"],
     "test": ["ecto.create --quiet", "ecto.migrate", "test"]]
  end
end
