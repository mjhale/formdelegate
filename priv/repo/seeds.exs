# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#

alias FormDelegate.Repo
alias FormDelegate.Accounts.User
alias FormDelegate.BillingCounts.BillingCount
alias FormDelegate.Forms.Form
alias FormDelegate.Integrations.{EmailIntegration, EmailIntegrationRecipient}
alias FormDelegate.Memberships.Membership
alias FormDelegate.Plans.Plan
alias FormDelegate.Submissions.Submission
alias FormDelegate.Teams.Team

# Scrub prior data before seeding
Repo.delete_all(Membership)
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
    is_admin: true
  })

user_team = FormDelegate.Repo.insert!(%Team{})

user =
  Repo.insert!(%User{
    name: "Joshua Fern",
    email: "josh.f@gmail.com",
    password_hash: Pbkdf2.hash_pwd_salt("securepass"),
    # pre-set the counter cache
    form_count: 1
  })

# Create memberships
Repo.insert!(%Membership{
  user_id: admin_user.id,
  team_id: admin_team.id,
  is_billing_account: true
})

Repo.insert!(%Membership{
  user_id: user.id,
  team_id: user_team.id,
  is_billing_account: true
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
  stripe_product_id: "prod_LbAPNMP79ulNj4"
})

Repo.insert!(%Plan{
  id: "7682f531-e326-4e00-9691-99858e6f5aaa",
  name: "Professional",
  limit_submissions: 5000,
  limit_forms: 0,
  # 10 GB
  limit_storage: 10_000_000_000,
  stripe_product_id: "prod_KVODnj3MBjuDTJ",
  stripe_price_id: "price_1JqNR8AZx7ESoF8IrQIAiTGr"
})

Repo.insert!(%Plan{
  id: "06539042-4b76-4d97-a41d-9f505c298924",
  name: "Enterprise",
  limit_submissions: 100_000,
  limit_forms: 0,
  # 100 GB
  limit_storage: 100_000_000_000,
  stripe_product_id: "prod_Pw8LFemakwJiNG",
  stripe_price_id: "price_1P6G51AZx7ESoF8IEhPmTT4u"
})

# Seed Forms
admin_contact_form =
  Repo.insert!(%Form{
    name: "Contact Form",
    user: admin_user,
    team: admin_team,
    verified: true,
    # pre-set the counter cache based on seed data
    submission_count: 2
  })

admin_error_form =
  Repo.insert!(%Form{
    name: "Error Form",
    user: admin_user,
    team: admin_team,
    verified: true,
    # pre-set the counter cache based on seed data
    submission_count: 1
  })

user_form =
  Repo.insert!(%Form{
    name: "More Info Form",
    user: user,
    team: user_team,
    verified: false,
    # pre-set the counter cache
    submission_count: 1
  })

admin_contact_form_email_integration =
  Repo.insert!(%EmailIntegration{
    form: admin_contact_form,
    enabled: false,
    email_provider: :smtp,
    email_provider_status: :unconfigured,
    email_provider_config: %{},
    email_provider_secrets: %{}
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
