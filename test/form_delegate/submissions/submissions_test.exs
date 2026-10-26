defmodule FormDelegate.SubmissionsTest do
  use FormDelegate.DataCase, async: true

  import FormDelegate.Factory

  alias FormDelegate.Submissions
  alias FormDelegate.Submissions.Submission

  test "increments the correct form once for each persisted submission" do
    form = insert(:form)
    other_form = insert(:form)

    assert {:ok, first} =
             Submissions.create_submission(%{"form_id" => form.id, "body" => "First"})

    assert first.form.submission_count == 1
    assert Repo.reload!(form).submission_count == 1

    assert {:ok, _second} =
             Submissions.create_submission(%{form_id: form.id, body: "Second"})

    assert Repo.reload!(form).submission_count == 2
    assert Repo.reload!(other_form).submission_count == 0
  end

  test "invalid submissions do not increment the form count" do
    form = insert(:form)

    assert {:error, %Ecto.Changeset{}} = Submissions.create_submission(%{form_id: form.id})
    assert Repo.reload!(form).submission_count == 0
    assert Repo.aggregate(Submission, :count) == 0
  end

  test "an attachment validation failure rolls back the insert and count together" do
    form = insert(:form)

    assert {:error, %Ecto.Changeset{}} =
             Submissions.create_submission(%{
               "form_id" => form.id,
               "body" => "Invalid attachment",
               "attachments" => [%{}]
             })

    assert Repo.reload!(form).submission_count == 0
    assert Repo.aggregate(Submission, :count) == 0
  end

  test "editing a submission does not count it again" do
    form = insert(:form)
    {:ok, submission} = Submissions.create_submission(%{form_id: form.id, body: "Original"})

    assert {:ok, _updated} = Submissions.update_submission(submission, %{body: "Edited"})
    assert Repo.reload!(form).submission_count == 1
  end
end
