defmodule FormDelegate.Submissions do
  @moduledoc """
  The Submissions context.
  """

  import Ecto.Query, warn: false

  alias Ecto.{Changeset, Multi}
  alias FormDelegate.Accounts.User
  alias FormDelegate.Forms.Form
  alias FormDelegate.Submissions.{FlaggedType, Submission}
  alias FormDelegate.Repo

  @doc """
  Returns a paginated list of submissions for a user.

  ## Examples

      iex> list_submissions_of_user(user, params)
      [%Submission{}, ...]

  """
  def list_submissions_of_user(%User{} = user, params) do
    query =
      from s in Submission,
        inner_join: form in Form,
        on: form.user_id == ^user.id and form.id == s.form_id,
        order_by: [desc: s.inserted_at],
        preload: [
          :attachments,
          :flagged_type,
          form: {form, form_integrations: :integration}
        ]

    query
    |> Repo.paginate(params)
  end

  @doc """
  Returns a paginated list of submissions from a search.

  @TODO: Allow searches of particular forms.

  ## Examples

      iex> list_search_submissions_of_user(user, params)
      [%Submission{}, ...]

  """
  def list_search_submissions_of_user(%User{} = user, params) do
    query =
      from s in Submission,
        inner_join: form in Form,
        on: form.user_id == ^user.id and form.id == s.form_id,
        # @TODO: Improve where clause matching
        where:
          ilike(s.content, ^"%#{params["query"]}%") or
            ilike(s.sender, ^"%#{params["query"]}%") or
            fragment("?->>? ilike ?", s.data, "user_mail", ^"%#{params["query"]}%"),
        order_by: [desc: s.inserted_at],
        preload: [
          :attachments,
          :flagged_type,
          form: {form, form_integrations: :integration}
        ]

    query
    |> Repo.paginate(params)
  end

  @doc """
  Returns the daily count of recent submission activity of a user for past 365 days.

  ## Examples

      iex> get_submission_activity_of_user(user)
      [%{day, count}, ...]

  """
  def get_submission_activity_of_user(%User{} = user) do
    query =
      from m in Submission,
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
          submission_count: count(m.id)
        }

    Repo.all(query)
  end

  @doc """
  Gets a single submission.

  Raises `Ecto.NoResultsError` if the Submission does not exist.

  ## Examples

      iex> get_submission!(8f8ef4dd-dfb2-4441-a1ad-dd65c23c7ea7)
      %Submission{}

      iex> get_submission!(00000000-1234-5555-1234-000000000000)
      ** (Ecto.NoResultsError)

  """
  def get_submission!(id) do
    Repo.one!(
      from s in Submission,
        where: s.id == ^id,
        preload: [
          :attachments,
          :flagged_type,
          form: [form_integrations: :integration]
        ]
    )
  end

  @doc """
  Updates a submission.

  ## Examples

      iex> update_submission(submission, %{field: new_value})
      {:ok, %Submission{}}

      iex> update_submission(submission, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_submission(%Submission{} = submission, attrs) do
    submission
    |> Submission.update_changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Updates a submission with a flagged status.

  ## Examples

      iex> flag_submission(submission, %{field: new_value})
      {:ok, %Submission{}}

      iex> flag_submission(submission, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def flag_submission(%Submission{} = submission, attrs) do
    submission
    |> Submission.flag_submission_changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Creates a submission.

  @TODO: Decouple form and user contexts

  ## Examples

      iex> create_submission(%{field: value})
      {:ok, %Submission{}}

      iex> create_submission(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_submission(params \\ %{}) do
    Multi.new()
    |> Multi.insert(
      :submission,
      Submission.insert_changeset(%Submission{}, params) |> update_form_submission_count(1)
    )
    |> Multi.update(:submission_with_attachments, fn %{submission: submission} ->
      submission
      |> Repo.preload([:attachments, :flagged_type, form: [form_integrations: :integration]])
      |> Submission.update_changeset(params)
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{submission: _submission, submission_with_attachments: submission_with_attachments}} ->
        {:ok, submission_with_attachments}

      {:error, _failed_operation, failed_value, _changes_so_far} ->
        {:error, failed_value}
    end
  end

  @doc """
  Gets a flagged type or creates a flagged type if it does not already exist.

  ## Examples

      iex> get_or_create_flagged_type(%{type: name})
      %Flagged_Type{}

      iex> get_or_create_flagged_type(%{})
      {:error, %Ecto.Changeset{}}

  """
  def get_or_create_flagged_type(flagged_type_attrs) do
    if type = flagged_type_attrs[:type] do
      Repo.get_by(FlaggedType, type: type) ||
        Repo.insert!(FlaggedType.changeset(%FlaggedType{}, flagged_type_attrs))
    end
  end

  defp update_form_submission_count(changeset, value) do
    if changeset.valid? do
      changeset
      |> Changeset.prepare_changes(fn prepared_changeset ->
        if form = Changeset.get_change(prepared_changeset, :form) do
          query = from(Form, where: [id: ^form.data.id])
          prepared_changeset.repo.update_all(query, inc: [submission_count: value])
        end

        prepared_changeset
      end)
    else
      changeset
    end
  end
end
