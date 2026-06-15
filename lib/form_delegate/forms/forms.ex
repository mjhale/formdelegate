defmodule FormDelegate.Forms do
  @moduledoc """
  The Forms context.
  """

  import Ecto.Query, warn: false

  alias FormDelegate.Accounts.User
  alias FormDelegate.Forms.Form
  alias FormDelegate.Integrations
  alias FormDelegate.Integrations.EmailIntegration
  alias FormDelegate.Repo
  alias FormDelegate.Teams.Team

  @doc """
  Returns the list of forms.

  ## Examples

      iex> list_forms_of_user(user)
      [%Form{}, ...]

  """
  def list_forms_of_user(%User{} = user) do
    Repo.all(
      from f in Form,
        where: f.user_id == ^user.id,
        preload: [email_integrations: [:email_integration_recipients]],
        order_by: f.inserted_at
    )
  end

  @doc """
  Returns the list of forms belonging to a team.

  ## Examples

      iex> list_forms_of_team(team)
      [%Form{}, ...]

  """
  def list_forms_of_team(%Team{} = team) do
    Repo.all(
      from f in Form,
        where: f.team_id == ^team.id,
        preload: [email_integrations: [:email_integration_recipients]],
        order_by: f.inserted_at
    )
  end

  @doc """
  Gets a single form.

  Raises `Ecto.NoResultsError` if the Form does not exist.

  ## Examples

      iex> get_form!(123)
      %Form{}

      iex> get_form!(456)
      ** (Ecto.NoResultsError)

  """
  def get_form!(id) do
    Repo.one!(
      from f in Form,
        preload: [
          [email_integrations: [:email_integration_recipients]],
          :team,
          :user
        ],
        where: f.id == ^id
    )
  end

  @doc """
  Creates a form.

  ## Examples

      iex> create_form(%{field: value})
      {:ok, %Form{}}

      iex> create_form(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_form(attrs, %User{} = user, %Team{} = team) do
    Repo.transaction(fn ->
      with {:ok, %Form{} = form} <-
             %Form{}
             |> Form.changeset(attrs)
             |> Ecto.Changeset.cast_assoc(:email_integrations,
               with: &EmailIntegration.changeset/2
             )
             |> Ecto.Changeset.put_assoc(:user, user)
             |> Ecto.Changeset.put_assoc(:team, team)
             |> Repo.insert(),
           {:ok, %Form{} = form} <- maybe_verify_email_integrations(form) do
        form
      else
        {:error, status, metadata} when is_atom(status) and is_map(metadata) ->
          Repo.rollback({status, metadata})

        {:error, reason} ->
          Repo.rollback(reason)
      end
    end)
    |> normalize_transaction_result()
  end

  @doc """
  Updates a form.

  ## Examples

      iex> update_form(form, %{field: new_value})
      {:ok, %Form{}}

      iex> update_form(form, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_form(%Form{} = form, attrs) do
    Repo.transaction(fn ->
      with {:ok, %Form{} = form} <-
             form
             |> Form.changeset(attrs)
             |> Ecto.Changeset.cast_assoc(:email_integrations,
               with: &EmailIntegration.changeset/2
             )
             |> Repo.update(returning: true),
           {:ok, %Form{} = form} <- maybe_verify_email_integrations(form) do
        form
      else
        {:error, status, metadata} when is_atom(status) and is_map(metadata) ->
          Repo.rollback({status, metadata})

        {:error, reason} ->
          Repo.rollback(reason)
      end
    end)
    |> normalize_transaction_result()
  end

  @doc """
  Deletes a Form.

  ## Examples

      iex> delete_form(form)
      {:ok, %Form{}}

      iex> delete_form(form)
      {:error, %Ecto.Changeset{}}

  """
  def delete_form(%Form{} = form) do
    Repo.delete(form)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking form changes.

  ## Examples

      iex> change_form(form)
      %Ecto.Changeset{source: %Form{}}

  """
  def change_form(%Form{} = form) do
    Form.changeset(form, %{})
  end

  defp normalize_transaction_result({:ok, %Form{} = form}), do: {:ok, form}

  defp normalize_transaction_result({:error, {:error, status, metadata}}),
    do: {:error, status, metadata}

  defp normalize_transaction_result({:error, {status, metadata}}), do: {:error, status, metadata}
  defp normalize_transaction_result({:error, reason}), do: {:error, reason}

  defp maybe_verify_email_integrations(%Form{} = form) do
    form = Repo.preload(form, [email_integrations: [:email_integration_recipients]], force: true)

    verification_result =
      form.email_integrations
      |> Enum.filter(&(&1.enabled and &1.email_provider_status == :pending_verification))
      |> Enum.reduce_while(:ok, fn email_integration, _acc ->
        case Integrations.verify_email_integration_provider(email_integration) do
          {:ok, _email_integration} ->
            {:cont, :ok}

          {:error, verification_error} ->
            {:halt,
             {:error, :bad_request,
              %{type: Integrations.verification_error_type(verification_error)}}}
        end
      end)

    case verification_result do
      :ok ->
        {:ok,
         Repo.preload(form, [email_integrations: [:email_integration_recipients]], force: true)}

      {:error, _status, _metadata} = error ->
        error
    end
  end
end
