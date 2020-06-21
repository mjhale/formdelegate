defmodule FormDelegateWeb.AttachmentView do
  use FormDelegateWeb, :view

  alias FormDelegate.Uploaders.SubmissionAttachment

  def render("attachment.json", %{attachment: attachment}) do
    %{
      field_name: attachment.field_name,
      file_name: attachment.file_name,
      file_size: attachment.file_size,
      id: attachment.id,
      submission_id: attachment.submission_id,
      url: SubmissionAttachment.url({attachment.file, attachment}, signed: true)
    }
  end
end
