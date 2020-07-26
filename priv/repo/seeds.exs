# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#

alias FormDelegate.Repo
alias FormDelegate.Accounts.User
alias FormDelegate.Forms.Form
alias FormDelegate.Integrations.{EmailIntegration, EmailIntegrationRecipient, Integration}
alias FormDelegate.Submissions.Submission

# Scrub prior data before seeding
Repo.delete_all(User)
Repo.delete_all(Submission)
Repo.delete_all(Form)

# Seed Users
admin_user =
  Repo.insert!(%User{
    name: "The Administrator",
    email: "admin@admin.com",
    password_hash: Pbkdf2.hash_pwd_salt("password"),
    # pre-set the counter cache
    form_count: 2,
    confirmed_at: DateTime.utc_now(),
    is_admin: true
  })

user =
  Repo.insert!(%User{
    name: "Joshua Fern",
    email: "josh.f@gmail.com",
    password_hash: Pbkdf2.hash_pwd_salt("securepass")
  })

# Seed Forms
admin_contact_form =
  Repo.insert!(%Form{
    name: "Contact Form",
    user: admin_user,
    verified: true,
    # pre-set the counter cache
    submission_count: 2
  })

admin_error_form =
  Repo.insert!(%Form{
    name: "Error Form",
    user: admin_user,
    verified: true,
    # pre-set the counter cache
    submission_count: 1
  })

user_form =
  Repo.insert!(%Form{
    name: "More Info Form",
    user: user,
    verified: false,
    # pre-set the counter cache
    submission_count: 1
  })

# Seed Integrations
Repo.insert!(%Integration{
  name: "E-mail",
  type_code: "email"
})

email_integration = Repo.get_by!(Integration, type_code: "email")

admin_contact_form_email_integration =
  Repo.insert!(%EmailIntegration{
    form: admin_contact_form,
    email_api_key: nil,
    email_from_address: nil,
    enabled: true,
    integration: email_integration
  })

Repo.insert!(%EmailIntegrationRecipient{
  email: "admin@admin.com",
  email_integration: admin_contact_form_email_integration,
  type: "to"
})

# Seed Submissions
Repo.insert!(%Submission{
  body: "We need more tests!",
  fields: %{
    message: "We need more tests!"
  },
  form: admin_contact_form,
  sender: "Anonymous"
})

Repo.insert!(%Submission{
  body: "There's a bug in some code.",
  fields: %{
    message: "There's a bug in some code.",
    from: "Merk"
  },
  form: admin_error_form,
  sender: "Merk"
})

Repo.insert!(%Submission{
  body: "And also better architecture.",
  fields: %{
    message: "And also better architecture."
  },
  form: admin_contact_form,
  sender: "Anonymous"
})

Repo.insert!(%Submission{
  body: "Let's meet at 6:30 pm at the coffee shop.",
  fields: %{
    message: "Let's meet at 6:30 pm at the coffee shop.",
    email: "sam@gmail.com"
  },
  form: user_form,
  sender: "sam@gmail.com"
})
