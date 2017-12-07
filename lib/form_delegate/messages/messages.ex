defmodule FormDelegate.Messages do
  @moduledoc """
  The Integrations context.
  """

  import Ecto.Query, warn: false

  alias FormDelegate.Accounts.User
  alias FormDelegate.Messages.Message
  alias FormDelegate.Repo

  @doc """
  Returns the list of paginated messages.

  ## Examples

      iex> list_paginated_messages_of_user(user, params)
      [%Message{}, ...]

  """
  def list_paginated_messages_of_user(%User{} = user, params) do
    query = from m in Message,
      where: m.user_id == ^user.id,
      left_join: f in assoc(m, :form),
      left_join: fi in assoc(f, :form_integrations),
      left_join: i in assoc(fi, :integration),
      preload: [
        form: {
          f,
          form_integrations: {fi, integration: i},
        }
      ],
      distinct: true,
      order_by: [desc: m.id]

      query
      |> Repo.paginate(params)
  end

  @doc """
  Gets a single message.

  Raises `Ecto.NoResultsError` if the Message does not exist.

  ## Examples

      iex> get_message!(123)
      %Message{}

      iex> get_message!(456)
      ** (Ecto.NoResultsError)

  """
  def get_message!(id) do
    Repo.one! from m in Message,
      where: m.id == ^id,
      left_join: f in assoc(m, :form),
      left_join: fi in assoc(f, :form_integrations),
      left_join: i in assoc(fi, :integration),
      preload: [
        form: {
          f,
          form_integrations: {fi, integration: i},
        }
      ]
  end


end
