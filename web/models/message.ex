defmodule FormDelegate.Message do
  use FormDelegate.Web, :model

  schema "messages" do
    field :content, :string, null: false
    field :sender, :string, null: false
    field :unknown_fields, :map

    belongs_to :account, FormDelegate.Account

    timestamps()
  end

  @required_fields ~w(account_id sender content)
  @optional_fields ~w(unknown_fields)

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, @required_fields, @optional_fields)
  end

  def create_changeset(struct, params \\ %{}) do
    struct
    |> cast(params, @required_fields, @optional_fields)
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
          assoc(prepared_changeset.data, :account)
          |> prepared_changeset.repo.update_all(inc: [messages_count: value])

          prepared_changeset
        end)
      _ ->
        changeset
    end
  end
end
