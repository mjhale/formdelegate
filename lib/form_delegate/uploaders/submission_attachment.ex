defmodule FormDelegate.Uploaders.SubmissionAttachment do
  use Waffle.Definition

  # Include ecto support (requires package waffle_ecto installed):
  use Waffle.Ecto.Definition

  @acl :private
  @versions [:original]

  def storage_dir(_version, {_file, attachment}) do
    "uploads/submissions/#{attachment.submission_id}/#{URI.encode(attachment.field_name)}"
  end
end
