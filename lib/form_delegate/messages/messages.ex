defmodule FormDelegate.Messages do
  @moduledoc """
  The Integrations context.
  """

  import Ecto.Query, warn: false

  alias Ecto.Changeset
  alias FormDelegate.Accounts.User
  alias FormDelegate.Forms.Form
  alias FormDelegate.Messages.{FlaggedType, Message}
  alias FormDelegate.Repo

  @doc """
  Returns a paginated list of messages for a user.

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
          },
          :flagged_type
        ],
        order_by: [desc: m.id]

    query
    |> Repo.paginate(params)
  end

  @doc """
  Returns a paginated list of messages from a search.

  @TODO: Allow searches of particular forms.

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
          },
          :flagged_type
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
          },
          :flagged_type
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
    message
    |> Message.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Updates a message with a flagged status.

  ## Examples

      iex> flag_message(message, %{field: new_value})
      {:ok, %Message{}}

      iex> flag_message(message, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def flag_message(%Message{} = message, attrs) do
    message
    |> Message.flag_message_changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Creates a message.

  @TODO: Decouple form and user contexts

  ## Examples

      iex> create_message(form, %{field: value})
      {:ok, %Message{}}

      iex> create_message(form, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_message(form, attrs \\ %{}) do
    %Message{}
    |> Message.changeset(attrs)
    |> Changeset.put_assoc(:form, form)
    |> Changeset.put_assoc(:user, form.user)
    |> Changeset.put_assoc(:flagged_type, nil)
    |> Changeset.assoc_constraint(:form)
    |> Changeset.assoc_constraint(:user)
    |> update_form_message_count(1)
    |> Repo.insert()
  end

  # @doc """
  # Gets a flagged type or creates a flagged type if it does not already exist.

  # ## Examples

  #     iex> get_or_create_flagged_type(%{type: name})
  #     %Flagged_Type{}

  #     iex> get_or_create_flagged_type(%{})
  #     {:error, %Ecto.Changeset{}}

  # """
  def get_or_create_flagged_type(flagged_type_attrs) do
    if type = flagged_type_attrs[:type] do
      Repo.get_by(FlaggedType, type: type) ||
        Repo.insert!(FlaggedType.changeset(%FlaggedType{}, flagged_type_attrs))
    end
  end

  defp update_form_message_count(changeset, value) do
    if changeset.valid? do
      changeset
      |> Changeset.prepare_changes(fn prepared_changeset ->
        if form = Changeset.get_change(prepared_changeset, :form) do
          query = from(Form, where: [id: ^form.data.id])
          prepared_changeset.repo.update_all(query, inc: [message_count: value])
        end

        prepared_changeset
      end)
    else
      changeset
    end
  end
end
