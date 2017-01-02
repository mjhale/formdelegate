defmodule FormDelegate.Repo do
  use Ecto.Repo, otp_app: :form_delegate
  use Scrivener, page_size: 25
end
