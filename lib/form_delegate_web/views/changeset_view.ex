defmodule FormDelegateWeb.ChangesetView do
  use FormDelegateWeb, :view

  @doc """
  Traverses and translates changeset errors.

  See `Ecto.Changeset.traverse_errors/2` and
  `FormDelegateWeb.ErrorHelpers.translate_error/1` for more details.
  """
  def translate_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, &translate_error/1)
  end

  def render("error.json", %{changeset: changeset}) do
    %{
      error: %{
        code: 422,
        errors: translate_errors(changeset),
        type: "UNPROCESSABLE_ENTITY"
      }
    }
  end
end
