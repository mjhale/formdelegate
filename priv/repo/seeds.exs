# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#

alias FormDelegate.Repo
alias FormDelegate.Account
alias FormDelegate.Form
alias FormDelegate.Integration
alias FormDelegate.FormIntegration
alias FormDelegate.Message

# Scrub prior data before seeding
Repo.delete_all(Account)
Repo.delete_all(Message)
Repo.delete_all(Form)

# Seed Accounts
Repo.insert! %Account{
  name: "The Administrator",
  email: "admin@admin.com",
  password_hash: Comeonin.Pbkdf2.hashpwsalt("admin"),
  messages_count: 2, # pre-set the counter cache
  forms_count: 1, # pre-set the counter cache
  verified: true,
}
admin_account = Repo.get_by!(Account, email: "admin@admin.com")

Repo.insert! %Account{
  name: "Joshua Fern",
  email: "josh.f@gmail.com",
  password_hash: Comeonin.Pbkdf2.hashpwsalt("securepass"),
  messages_count: 1, # pre-set the counter cache
}
user_account = Repo.get_by!(Account, email: "josh.f@gmail.com")

# Seed Forms
Repo.insert! %Form{
  form: "Contact Form",
  account: admin_account,
  verified: true,
}
admin_form = Repo.get_by!(Form, form: "Contact Form")

Repo.insert! %Form{
  form: "More Info Form",
  account: user_account,
  verified: false,
}
user_form = Repo.get_by!(Form, form: "More Info Form")

# Seed Integrations
Repo.insert! %Integration{
  type: "E-mail",
}
email_integration = Repo.get_by!(Integration, type: "E-mail")

Repo.insert! %Integration{
  type: "Ifttt",
}
ifttt_integration = Repo.get_by!(Integration, type: "Ifttt")

Repo.insert! %FormIntegration{
  form: admin_form,
  enabled: true,
  integration: ifttt_integration,
  settings: %{
    api_key: "31134"
  }
}

Repo.insert! %FormIntegration{
  form: admin_form,
  enabled: false,
  integration: email_integration,
  settings: %{
    api_key: "00000-523-232222"
  }
}

# Seed Messages
Repo.insert! %Message{
  content: "We need more tests!",
  account: admin_account,
  form: admin_form,
  sender: "Anonymous",
}

Repo.insert! %Message{
  content: "And also better architecture.",
  account: admin_account,
  form: admin_form,
  sender: "Anonymous",
}

Repo.insert! %Message{
  content: "Let's meet at 6:30 pm at the coffee shop.",
  account: user_account,
  form: user_form,
  sender: "sam@gmail.com",
}
