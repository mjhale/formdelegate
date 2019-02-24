defmodule FormDelegate.Repo do
  use Ecto.Repo,
    otp_app: :form_delegate,
    adapter: Ecto.Adapters.Postgres
  use Scrivener, page_size: 15

  @doc """
  Dynamically loads the repository url from the
  DATABASE_URL environment variable.
  """
  def init(_, opts) do
    {:ok, Keyword.put(opts, :url, System.get_env("DATABASE_URL"))}
  end
end
