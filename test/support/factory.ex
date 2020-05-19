defmodule FormDelegate.Factory do
  use ExMachina.Ecto, repo: FormDelegate.Repo

  alias FormDelegate.Accounts.User

  @spec user_factory :: FormDelegate.Accounts.User.t()
  def user_factory do
    %FormDelegate.Accounts.User{
      email: sequence(:email, &"User #{&1}")
    }
  end

  def submission_factory do
    %FormDelegate.Submissions.Submission{
      user: build(:user),
      sender: sequence(:sender, &"User #{&1}"),
      content: sequence(:content, &"Content submission #{&1}")
    }
  end

  def integration_factory do
    %FormDelegate.Integrations.Integration{
      type: sequence(:type, &"Type #{&1}")
    }
  end

  def form_factory do
    %FormDelegate.Forms.Form{
      form: sequence(:type, &"Form #{&1}"),
      user: build(:user)
    }
  end

  def make_admin(user) do
    %{user | is_admin: true}
  end

  def set_password(user, password) do
    user
    |> User.changeset(%{"password" => password})
    |> Ecto.Changeset.apply_changes()
  end
end
