# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#

alias FormDelegate.Repo
alias FormDelegate.Accounts.User
alias FormDelegate.{Forms, Forms.Form}
alias FormDelegate.Integrations.Integration
alias FormDelegate.Messages.Message

# Scrub prior data before seeding
Repo.delete_all(User)
Repo.delete_all(Message)
Repo.delete_all(Form)

# Seed Users
Repo.insert! %User{
  name: "The Administrator",
  email: "admin@admin.com",
  password_hash: Pbkdf2.hash_pwd_salt("admin"),
  form_count: 2, # pre-set the counter cache
  verified: true,
  is_admin: true,
}
admin_user = Repo.get_by!(User, email: "admin@admin.com")

Repo.insert! %User{
  name: "Joshua Fern",
  email: "josh.f@gmail.com",
  password_hash: Pbkdf2.hash_pwd_salt("securepass"),
}
user = Repo.get_by!(User, email: "josh.f@gmail.com")

# Seed Forms
Repo.insert! %Form{
  form: "Contact Form",
  user: admin_user,
  verified: true,
  message_count: 2, # pre-set the counter cache
}
admin_contact_form = Repo.get_by!(Form, form: "Contact Form")

Repo.insert! %Form{
  form: "Error Form",
  user: admin_user,
  verified: true,
  message_count: 1, # pre-set the counter cache
}
admin_error_form = Repo.get_by!(Form, form: "Error Form")


Repo.insert! %Form{
  form: "More Info Form",
  user: user,
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

Repo.insert! %Forms.Integration{
  form: admin_contact_form,
  enabled: true,
  integration: ifttt_integration,
  settings: %{
    api_key: "31134"
  }
}

Repo.insert! %Forms.Integration{
  form: admin_contact_form,
  enabled: false,
  integration: email_integration,
  settings: %{
    api_key: "00000-523-232222"
  }
}

# Seed Messages
Repo.insert! %Message{
  content: "We need more tests!",
  user: admin_user,
  form: admin_contact_form,
  sender: "Anonymous",
}

Repo.insert! %Message{
  content: "There's a bug in some code.",
  user: admin_user,
  form: admin_error_form,
  sender: "Merk",
}

Repo.insert! %Message{
  content: "And also better architecture.",
  user: admin_user,
  form: admin_contact_form,
  sender: "Anonymous",
}

Repo.insert! %Message{
  content: "Let's meet at 6:30 pm at the coffee shop.",
  user: user,
  form: user_form,
  sender: "sam@gmail.com",
}
