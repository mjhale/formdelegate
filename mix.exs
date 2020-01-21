defmodule FormDelegate.Mixfile do
  use Mix.Project

  def project do
    [
      app: :form_delegate,
      version: "0.0.1",
      elixir: "~> 1.8",
      elixirc_options: [warnings_as_errors: true],
      elixirc_paths: elixirc_paths(Mix.env()),
      compilers: [:phoenix, :gettext] ++ Mix.compilers(),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      dialyzer: [
        plt_file: {:no_warn, "priv/plts/dialyzer.plt"},
        ignore_warnings: ".dialyzer_ignore.exs"
      ],
      deps: deps()
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {FormDelegate.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:phoenix, "~> 1.4.6"},
      {:phoenix_pubsub, "~> 1.1.2"},
      {:ecto_sql, "~> 3.1.4"},
      {:phoenix_ecto, "~> 4.0.0"},
      {:postgrex, "~> 0.14.3"},
      {:phoenix_html, "~> 2.13.3"},
      {:jason, "~> 1.1.2"},
      {:gettext, "~> 0.15"},
      {:plug_cowboy, "~> 2.0.2"},
      {:guardian, "~> 1.2.1"},
      {:pbkdf2_elixir, "~> 1.0.2"},
      {:bamboo, "~> 1.2.0"},
      {:bamboo_sparkpost, "~> 1.1.2"},
      {:scrivener_ecto, "~> 2.2.0"},
      {:scrivener_headers, "~> 3.1.1"},
      {:cors_plug, "~> 2.0.0"},
      {:rihanna, "~> 1.3.4"},
      {:tesla, "~> 1.3.1"},
      {:hackney, "~> 1.15.2"},

      # dev, test
      {:ex_machina, "~> 2.3.0", only: :test},
      {:credo, "~> 1.0", only: [:dev, :test], runtime: false},
      {:dialyxir, "~> 1.0.0-rc.6", only: [:dev, :test], runtime: false},
      {:sobelow, "~> 0.8", only: [:dev, :test], runtime: false},

      # build
      {:distillery, "~> 2.0.14", runtime: false}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to create, migrate and run the seeds file at once:
  #
  #     $ mix ecto.setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    [
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      quality: ["format", "credo --strict", "sobelow --verbose", "dialyzer", "test"],
      "quality.ci": [
        "test",
        "format --check-formatted",
        "credo --strict",
        "sobelow --exit",
        "dialyzer --halt-exit-status"
      ],
      test: ["ecto.create --quiet", "ecto.migrate", "test"]
    ]
  end
end
