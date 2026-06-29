defmodule FormDelegateWeb.Guardian do
  use Guardian, otp_app: :form_delegate

  alias FormDelegate.Accounts
  alias FormDelegate.Accounts.User

  # Access tokens carry the user's auth_token_version at issue time. Password
  # reset/change flows increment the database value, which invalidates older
  # tokens for that user when verify_claims/2 compares the claim to the current
  # user record.
  @auth_token_version_claim "auth_token_version"

  def subject_for_token(user = %User{}, _claims) do
    {:ok, "User:" <> to_string(user.id)}
  end

  def subject_for_token(_, _) do
    {:error, :unknown_resource}
  end

  def build_claims(claims, %User{} = user, _opts) do
    {:ok, Map.put(claims, @auth_token_version_claim, user.auth_token_version || 0)}
  end

  def verify_claims(%{"sub" => "User:" <> id} = claims, _opts) do
    with {:ok, %User{} = user} <- get_user(id),
         :ok <- verify_auth_token_version(user, claims) do
      {:ok, claims}
    end
  end

  def verify_claims(claims, _opts) do
    {:ok, claims}
  end

  def resource_from_claims(%{"sub" => "User:" <> id}) do
    get_user(id)
  end

  def resource_from_claims(_claims) do
    {:error, :no_resource}
  end

  defp get_user(id) do
    {:ok, Accounts.get_user!(id)}
  rescue
    Ecto.NoResultsError -> {:error, :no_resource}
  end

  defp verify_auth_token_version(%User{auth_token_version: auth_token_version}, claims) do
    if auth_token_version == claims_auth_token_version(claims) do
      :ok
    else
      {:error, :stale_auth_token}
    end
  end

  defp claims_auth_token_version(%{@auth_token_version_claim => version})
       when is_integer(version) do
    version
  end

  defp claims_auth_token_version(%{@auth_token_version_claim => version})
       when is_binary(version) do
    case Integer.parse(version) do
      {version, ""} -> version
      _ -> nil
    end
  end

  defp claims_auth_token_version(_claims), do: 0
end
