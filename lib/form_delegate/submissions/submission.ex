defmodule FormDelegate.Submissions.Submission do
  use Ecto.Schema
  use Waffle.Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Forms.Form
  alias FormDelegate.Submissions.{Attachment, FlaggedType, Submission}

  @primary_key {:id, :binary_id, autogenerate: true}
  @timestamps_opts [type: :utc_datetime_usec]

  schema "submissions" do
    field :sender, :string
    field :body, :string

    field :flagged_at, :naive_datetime

    field :sender_ip, :string
    field :sender_referrer, :string
    field :sender_user_agent, :string

    field :fields, {:map, :string}
    has_many :attachments, Attachment

    belongs_to :form, Form, type: Ecto.UUID
    belongs_to :flagged_type, FlaggedType, on_replace: :update

    timestamps()
  end

  @doc false
  def insert_changeset(%Submission{} = submission, attrs \\ %{}) do
    submission
    |> cast(attrs, [
      :body,
      :fields,
      :form_id,
      :sender,
      :sender_ip,
      :sender_referrer,
      :sender_user_agent
    ])
    |> foreign_key_constraint(:form_id)
    |> validate_required_inclusion([:body, :fields, :sender])
  end

  @doc false
  def update_changeset(submission, attrs \\ %{}) do
    submission
    |> insert_changeset(attrs)
    |> cast_assoc(:attachments,
      with: &Attachment.insert_changeset(Map.put(&1, :submission_id, submission.id), &2)
    )
  end

  @doc false
  def flag_submission_changeset(%Submission{} = submission, attrs \\ %{}) do
    submission
    |> cast(attrs, [:flagged_at])
    |> put_assoc(:flagged_type, attrs[:flagged_type])
  end

  defp present?(changeset, field) do
    value = get_field(changeset, field)
    value && (value != "" && value != %{})
  end

  defp validate_required_inclusion(changeset, fields) do
    if Enum.any?(fields, &present?(changeset, &1)) do
      changeset
    else
      add_error(changeset, hd(fields), "One of these fields must be present: #{inspect(fields)}")
    end
  end
end
