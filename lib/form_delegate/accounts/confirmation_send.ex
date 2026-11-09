defmodule FormDelegate.Accounts.ConfirmationSend do
  @moduledoc "One confirmation email committed for delivery to an account."
  use Ecto.Schema

  alias FormDelegate.Accounts.User

  schema "confirmation_email_sends" do
    belongs_to :user, User
    field :inserted_at, :utc_datetime_usec
  end

  @type t :: %__MODULE__{}
end
