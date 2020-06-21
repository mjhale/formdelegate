defmodule FormDelegate.Submissions.Attachment do
  use Ecto.Schema
  use Waffle.Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Submissions.{Attachment, Submission}
  alias FormDelegate.Uploaders.SubmissionAttachment

  @primary_key {:id, :binary_id, autogenerate: true}
  @timestamps_opts [type: :utc_datetime_usec]

  schema "attachments" do
    field :content_type, :string
    field :field_name, :string
    field :file, SubmissionAttachment.Type
    field :file_name, :string
    field :file_size, :integer

    belongs_to :submission, Submission, type: Ecto.UUID

    timestamps()
  end

  @doc false
  def insert_changeset(%Attachment{} = attachment, params \\ %{}) do
    attachment
    |> cast(params, [:field_name, :submission_id])
    |> cast_attachments(params, [:file])
    |> foreign_key_constraint(:submission_id)
    |> put_content_type(Map.get(params, "file"))
    |> put_file_name(Map.get(params, "file"))
    |> put_file_size(Map.get(params, "file"))
    |> validate_required([:field_name, :file, :file_name, :file_size])
  end

  defp put_content_type(changeset, %Plug.Upload{content_type: content_type}) do
    put_change(changeset, :content_type, content_type)
  end

  defp put_content_type(changeset, _), do: changeset

  defp put_file_name(changeset, %Plug.Upload{filename: filename}) do
    put_change(changeset, :file_name, filename)
  end

  defp put_file_name(changeset, _), do: changeset

  defp put_file_size(changeset, %Plug.Upload{} = file) do
    put_change(changeset, :file_size, file_size(file))
  end

  defp put_file_size(changeset, _), do: changeset

  defp file_size(%Plug.Upload{} = file) do
    case File.stat(file.path) do
      {:ok, stats} ->
        stats.size

      {:error, _} ->
        nil
    end
  end
end
