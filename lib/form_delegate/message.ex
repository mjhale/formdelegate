defmodule FormDelegate.Message do
  use FormDelegateWeb, :model

  schema "messages" do
    field :content, :string, null: false
    field :sender, :string, null: false
    field :unknown_fields, :map

    belongs_to :user, FormDelegate.Accounts.User
    belongs_to :form, FormDelegate.Form, type: Ecto.UUID

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:content, :sender, :unknown_fields, :user_id, :form_id])
    |> assoc_constraint(:user)
    |> assoc_constraint(:form)
  end

  def create_changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:content, :sender, :unknown_fields, :user_id, :form_id])
    |> assoc_constraint(:user)
    |> assoc_constraint(:form)
    |> update_counter_cache(1)
  end

  def delete_changeset(struct) do
    changeset(struct, %{})
    |> update_counter_cache(-1)
  end

  defp update_counter_cache(changeset, value) do
    case changeset do
      %Ecto.Changeset{valid?: true} ->
        changeset
        |> prepare_changes(fn prepared_changeset ->
          assoc(prepared_changeset.data, :form)
          |> prepared_changeset.repo.update_all(inc: [message_count: value])

          prepared_changeset
        end)
      _ ->
        changeset
    end
  end
end
