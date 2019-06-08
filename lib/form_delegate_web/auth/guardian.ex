defmodule FormDelegateWeb.Guardian do
  use Guardian, otp_app: :form_delegate

  alias FormDelegate.Accounts
  alias FormDelegate.Accounts.User

  def subject_for_token(user = %User{}, _claims) do
    {:ok, "User:" <> to_string(user.id)}
  end

  def subject_for_token(_, _) do
    {:error, :unknown_resource}
  end

  def resource_from_claims(%{"sub" => "User:" <> id}) do
    {:ok, Accounts.get_user!(id)}
  end

  def resource_from_claims(_claims) do
    {:error, :no_resource}
  end
end
