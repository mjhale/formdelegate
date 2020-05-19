defmodule FormDelegate.Submissions do
  @moduledoc """
  The Integrations context.
  """

  import Ecto.Query, warn: false

  alias Ecto.Changeset
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
      from m in Submission,
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
  Returns a paginated list of submissions from a search.

  @TODO: Allow searches of particular forms.

  ## Examples

      iex> list_search_submissions_of_user(user, params)
      [%Submission{}, ...]

  """
  def list_search_submissions_of_user(%User{} = user, params) do
    query =
      from m in Submission,
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
  Returns the daily count of recent submission activity of a user.

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

      iex> get_submission!(123)
      %Submission{}

      iex> get_submission!(456)
      ** (Ecto.NoResultsError)

  """
  def get_submission!(id) do
    Repo.one!(
      from m in Submission,
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
  Updates a submission.

  ## Examples

      iex> update_submission(submission, %{field: new_value})
      {:ok, %Submission{}}

      iex> update_submission(submission, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_submission(%Submission{} = submission, attrs) do
    submission
    |> Submission.changeset(attrs)
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

      iex> create_submission(form, %{field: value})
      {:ok, %Submission{}}

      iex> create_submission(form, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_submission(form, attrs \\ %{}) do
    %Submission{}
    |> Submission.changeset(attrs)
    |> Changeset.put_assoc(:form, form)
    |> Changeset.put_assoc(:user, form.user)
    |> Changeset.put_assoc(:flagged_type, nil)
    |> Changeset.assoc_constraint(:form)
    |> Changeset.assoc_constraint(:user)
    |> update_form_submission_count(1)
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
