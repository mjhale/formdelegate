defmodule FormDelegate.Mixfile do
  use Mix.Project

  def project do
    [
      app: :form_delegate,
      version: "0.0.1",
      elixir: "~> 1.13",
      elixirc_paths: elixirc_paths(Mix.env()),
      compilers: [:gettext] ++ Mix.compilers(),
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
      {:phoenix, "~> 1.6.7"},
      {:phoenix_pubsub, "~> 2.1.1"},
      {:ecto_sql, "~> 3.8.1"},
      {:phoenix_ecto, "~> 4.4.0"},
      {:postgrex, "~> 0.16.3"},
      {:phoenix_html, "~> 3.2.0"},
      {:jason, "~> 1.3.0"},
      {:gettext, "~> 0.19.1"},
      {:plug_cowboy, "~> 2.5.2"},
      {:guardian, "~> 2.2.3"},
      {:guardian_phoenix, "~> 2.0"},
      {:pbkdf2_elixir, "~> 2.0"},
      {:bamboo, "~> 2.2"},
      {:bamboo_phoenix, "~> 1.0"},
      {:bamboo_postmark, "~> 1.0"},
      {:scrivener_ecto, "~> 2.7.0"},
      {:scrivener_headers, "~> 3.2.2"},
      {:cors_plug, "~> 3.0.3"},
      {:rihanna, "~> 2.3.1"},
      {:tesla, "~> 1.4.4"},
      {:waffle, "~> 1.1.6"},
      {:waffle_ecto, "~> 0.0.11"},
      {:hackney, "~> 1.18.1"},
      {:ex_aws, "~> 2.3.1"},
      {:ex_aws_s3, "~> 2.3.2"},
      {:sweet_xml, "~> 0.7.3"},
      {:stripity_stripe, "~> 2.13.0"},

      # dev, test
      {:ex_machina, "~> 2.7.0", only: :test},
      {:credo, "~> 1.6.4", only: [:dev, :test], runtime: false},
      {:dialyxir, "~> 1.1.0", only: [:dev, :test], runtime: false},
      {:sobelow, "~> 0.11.1", only: [:dev, :test], runtime: false}
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
