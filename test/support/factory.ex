defmodule FormDelegate.Factory do
  use ExMachina.Ecto, repo: FormDelegate.Repo

  alias FormDelegate.Accounts.User
  alias FormDelegate.Forms.Form
  alias FormDelegate.Integrations.Integration
  alias FormDelegate.Submissions.Submission

  def valid_user_password, do: "a sufficiently long password"

  def user_factory do
    %User{
      confirmation_sent_at: DateTime.utc_now(),
      confirmation_token: User.generate_random_url_safe_string(32),
      email: sequence(:email, fn n -> "email-#{n}@formdelegate.com" end),
      is_admin: false,
      name: sequence(:name, &"User #{&1}"),
      password_hash: "not an actual password hash"
    }
  end

  def submission_factory do
    %Submission{
      user: build(:user),
      sender: sequence(:sender, &"User #{&1}"),
      content: sequence(:content, &"Content submission #{&1}")
    }
  end

  def integration_factory do
    %Integration{
      type: sequence(:type, &"Type #{&1}")
    }
  end

  def form_factory do
    %Form{
      form: sequence(:type, &"Form #{&1}"),
      user: build(:user)
    }
  end

  def make_admin(user) do
    %{user | is_admin: true}
  end

  def set_password(user, password) do
    user
    |> User.registration_changeset(%{"password" => password})
    |> Ecto.Changeset.apply_changes()
  end
end
