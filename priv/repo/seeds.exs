# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#

alias FormDelegate.Repo
alias FormDelegate.Accounts.User
alias FormDelegate.BillingCounts.BillingCount
alias FormDelegate.Forms.Form
alias FormDelegate.Integrations.{EmailIntegration, EmailIntegrationRecipient}
alias FormDelegate.Plans.Plan
alias FormDelegate.Submissions.Submission
alias FormDelegate.Teams.Team

# Scrub prior data before seeding
Repo.delete_all(User)
Repo.delete_all(Team)
Repo.delete_all(BillingCount)
Repo.delete_all(Submission)
Repo.delete_all(Form)
Repo.delete_all(Plan)

# Seed Users
admin_team = FormDelegate.Repo.insert!(%Team{})

admin_user =
  Repo.insert!(%User{
    name: "The Administrator",
    email: "admin@admin.com",
    password_hash: Pbkdf2.hash_pwd_salt("password"),
    # pre-set the counter cache
    form_count: 2,
    confirmed_at: DateTime.utc_now(),
    team: admin_team,
    is_admin: true
  })

user_team = FormDelegate.Repo.insert!(%Team{})

user =
  Repo.insert!(%User{
    name: "Joshua Fern",
    email: "josh.f@gmail.com",
    password_hash: Pbkdf2.hash_pwd_salt("securepass"),
    # pre-set the counter cache
    form_count: 1,
    team: user_team
  })

# Create billing count tracker for teams
Repo.insert!(%BillingCount{
  team: admin_team,
  # pre-set the counter based on seed data
  submission_count: 3,
  form_count: 2
})

Repo.insert!(%BillingCount{
  team: user_team,
  # pre-set the counter based on seed data
  submission_count: 1,
  form_count: 1
})

# Plans
Repo.insert!(%Plan{
  name: "Free",
  limit_submissions: 100,
  limit_forms: 5,
  limit_storage: 5_000_000,
  # Replace with your Stripe product ID
  stripe_product_id: "prod_LbAPNMP79ulNj4"
})

# Seed Forms
admin_contact_form =
  Repo.insert!(%Form{
    name: "Contact Form",
    user: admin_user,
    verified: true,
    # pre-set the counter cache based on seed data
    submission_count: 2
  })

admin_error_form =
  Repo.insert!(%Form{
    name: "Error Form",
    user: admin_user,
    verified: true,
    # pre-set the counter cache based on seed data
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

admin_contact_form_email_integration =
  Repo.insert!(%EmailIntegration{
    form: admin_contact_form,
    email_api_key: nil,
    email_from_address: nil,
    enabled: true,
    integration_type: :email
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
