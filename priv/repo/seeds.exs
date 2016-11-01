# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#

alias FormDelegate.Repo
alias FormDelegate.Account
alias FormDelegate.Message

# Scrub prior data before seeding
Repo.delete_all(Message)
Repo.delete_all(Account)

# Seed Accounts
Repo.insert! %Account{
  id: 1,
  name: "The Administrator",
  username: "admin",
  password_hash: Comeonin.Pbkdf2.hashpwsalt("admin"),
  messages_count: 2, # pre-set the counter cache
  verified: true,
}

Repo.insert! %Account{
  id: 2,
  name: "Joshua Fern",
  username: "josh.f",
  password_hash: Comeonin.Pbkdf2.hashpwsalt("securepass"),
  messages_count: 1, # pre-set the counter cache
}

# Seed Messages
admin_account = Repo.get!(Account, 1)

Repo.insert! %Message{
  content: "We need more tests!",
  account: admin_account,
  sender: "Anonymous",
}

Repo.insert! %Message{
  content: "And also better architecture.",
  account: admin_account,
  sender: "Anonymous",
}

user_account = Repo.get!(Account, 2)

Repo.insert! %Message{
  content: "Let's meet at 6:30 pm at the coffee shop.",
  account: user_account,
  sender: "sam@gmail.com",
}
