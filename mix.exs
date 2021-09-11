defmodule FormDelegate.Mixfile do
  use Mix.Project

  def project do
    [
      app: :form_delegate,
      version: "0.0.1",
      elixir: "~> 1.12",
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
      {:phoenix, "~> 1.5.12"},
      {:phoenix_pubsub, "~> 2.0.0"},
      {:ecto_sql, "~> 3.7.0"},
      {:phoenix_ecto, "~> 4.4.0"},
      {:postgrex, "~> 0.15.10"},
      {:phoenix_html, "~> 3.0.3"},
      {:jason, "~> 1.2.1"},
      {:gettext, "~> 0.18.2"},
      {:plug_cowboy, "~> 2.5.2"},
      {:guardian, "~> 2.2.1"},
      {:guardian_phoenix, "~> 2.0"},
      {:pbkdf2_elixir, "~> 1.4"},
      {:bamboo, "~> 2.2"},
      {:bamboo_phoenix, "~> 1.0"},
      {:bamboo_postmark, "~> 1.0"},
      {:scrivener_ecto, "~> 2.7.0"},
      {:scrivener_headers, "~> 3.2.2"},
      {:cors_plug, "~> 2.0.3"},
      {:rihanna, "~> 2.3.1"},
      {:tesla, "~> 1.4.3"},
      {:waffle, "~> 1.1.5"},
      {:waffle_ecto, "~> 0.0.11"},
      {:hackney, "~> 1.17.4"},
      {:ex_aws, "~> 2.2.5"},
      {:ex_aws_s3, "~> 2.3.0"},
      {:sweet_xml, "~> 0.7.1"},

      # dev, test
      {:ex_machina, "~> 2.7.0", only: :test},
      {:credo, "~> 1.5.6", only: [:dev, :test], runtime: false},
      {:dialyxir, "~> 1.1.0", only: [:dev, :test], runtime: false},
      {:sobelow, "~> 0.11.1", only: [:dev, :test], runtime: false},

      # build
      {:distillery, "~> 2.1.1", runtime: false}
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
