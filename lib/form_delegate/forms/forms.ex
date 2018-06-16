defmodule FormDelegate.Forms do
  @moduledoc """
  The Forms context.
  """

  import Ecto.Query, warn: false

  alias FormDelegate.Accounts.User
  alias FormDelegate.{Forms, Forms.Form}
  alias FormDelegate.Repo

  @doc """
  Returns the list of forms.

  ## Examples

      iex> list_forms_of_user(user)
      [%Form{}, ...]

  """
  def list_forms_of_user(%User{} = user) do
    Repo.all from f in Form,
      where: f.user_id == ^user.id,
      preload: [{
        :form_integrations, :integration
      }],
      order_by: f.inserted_at
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
    Repo.one! from f in Form,
      preload: [{
        :form_integrations, :integration
      }],
      where: f.id == ^id
  end

  @doc """
  Creates a form.

  ## Examples

      iex> create_form(%{field: value})
      {:ok, %Form{}}

      iex> create_form(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_form(attrs \\ %{}, %User{} = user) do
    %Form{}
    |> Form.changeset(attrs)
    |> Ecto.Changeset.cast_assoc(:form_integrations, with: &Forms.Integration.changeset/2)
    |> Ecto.Changeset.put_assoc(:user, user)
    |> Repo.insert()
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
    Form.changeset(form, attrs)
    |> Ecto.Changeset.cast_assoc(:form_integrations, with: &Forms.Integration.changeset/2)
    |> Repo.update()
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
end
