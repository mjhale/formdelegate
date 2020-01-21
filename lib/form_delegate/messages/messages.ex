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

      iex> list_messages_of_user(user, params)
      [%Message{}, ...]

  """
  def list_messages_of_user(%User{} = user, params) do
    query =
      from m in Message,
        where: m.user_id == ^user.id,
        preload: [
          {
            :form,
            [{:form_integrations, :integration}]
          }
        ],
        order_by: [desc: m.id]

    query
    |> Repo.paginate(params)
  end

  @doc """
  Returns the search result list of paginated messages.

  ## Examples

      iex> list_search_messages_of_user(user, params)
      [%Message{}, ...]

  """
  def list_search_messages_of_user(%User{} = user, params) do
    query =
      from m in Message,
        where: m.user_id == ^user.id,
        where:
          ilike(m.content, ^"%#{params["query"]}%") or
            ilike(m.sender, ^"%#{params["query"]}%") or
            fragment("?->>? ilike ?", m.unknown_fields, "user_mail", ^"%#{params["query"]}%"),
        preload: [
          {
            :form,
            [{:form_integrations, :integration}]
          }
        ],
        order_by: [desc: m.id]

    query
    |> Repo.paginate(params)
  end

  @doc """
  Returns the daily count of recent message activity of a user.

  ## Examples

      iex> get_message_activity_of_user(user)
      [%{day, count}, ...]

  """
  def get_message_activity_of_user(%User{} = user) do
    query =
      from m in Message,
        right_join:
          day in fragment(
            "SELECT generate_series(CURRENT_DATE - INTERVAL '365 days', CURRENT_DATE, '1 day') :: date AS d"
          ),
        on: day.d == fragment("date(?)", m.inserted_at),
        on: m.user_id == ^user.id,
        group_by: day.d,
        order_by: day.d,
        select: %{
          day: fragment("date(?)", day.d),
          message_count: count(m.id)
        }

    Repo.all(query)
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
    Repo.one!(
      from m in Message,
        where: m.id == ^id,
        preload: [
          {
            :form,
            [{:form_integrations, :integration}]
          }
        ]
    )
  end

  @doc """
  Updates a message.

  ## Examples

      iex> update_message(message, %{field: new_value})
      {:ok, %Message{}}

      iex> update_message(message, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_message(%Message{} = message, attrs) do
    Message.changeset(message, attrs)
    |> Repo.update()
  end
end
