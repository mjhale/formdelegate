defmodule FormDelegate.Factory do
  use ExMachina.Ecto, repo: FormDelegate.Repo

  alias FormDelegate.Accounts.User
  alias FormDelegate.Forms.Form
  alias FormDelegate.Integrations.{EmailIntegrationRecipient, Integration}
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
      body: "Content submission body",
      fields: %{
        message: "Content submission body"
      },
      form: build(:form),
      sender: sequence(:sender, &"User #{&1}")
    }
  end

  def integration_factory do
    %Integration{
      name: sequence(:integration_name, &"Type #{&1}"),
      type_code: sequence(:type_code, &"type_#{&1}")
    }
  end

  def email_integration_recipient_factory do
    %EmailIntegrationRecipient{
      name: sequence(:email_recipient_name, &"User #{&1}"),
      email: sequence(:email_recipient_email, fn n -> "email-#{n}@formdelegate.com" end),
      type: sequence(:email_recipient_type, ["to", "cc", "bcc"])
    }
  end

  def form_factory do
    %Form{
      name: sequence(:form, &"Form #{&1}"),
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
