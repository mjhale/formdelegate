defmodule FormDelegate.TestObanEngine do
  @moduledoc false

  # Keep isolated test engines compatible with Oban while overriding only insertion.
  defmacro __using__(_opts) do
    Code.ensure_loaded!(Oban.Engines.Basic)

    delegates =
      for {name, arity} <- Oban.Engine.behaviour_info(:callbacks),
          {name, arity} != {:insert_job, 3},
          function_exported?(Oban.Engines.Basic, name, arity) do
        args = Macro.generate_arguments(arity, __MODULE__)

        quote do
          @impl true
          defdelegate unquote(name)(unquote_splicing(args)), to: Oban.Engines.Basic
        end
      end

    quote do
      @behaviour Oban.Engine
      unquote_splicing(delegates)
    end
  end
end
