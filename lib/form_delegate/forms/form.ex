defmodule FormDelegate.Forms.Form do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Accounts.User
  alias FormDelegate.Forms.Form
  alias FormDelegate.Forms.HostRule
  alias FormDelegate.Integrations.{EmailIntegration, FormIntegration}
  alias FormDelegate.Submissions.Submission
  alias FormDelegate.Teams.Team

  @primary_key {:id, :binary_id, autogenerate: true}
  @timestamps_opts [type: :utc_datetime_usec]
  @max_hosts 50
  @submission_source_policies [:unrestricted, :restricted]

  schema "forms" do
    field :callback_success_includes_data, :boolean, default: false
    field :callback_success_url, :string
    field :hosts, {:array, :string}
    field :name, :string

    field :submission_source_policy, Ecto.Enum,
      values: @submission_source_policies,
      default: :unrestricted

    field :submission_count, :integer, default: 0
    field :verified, :boolean, default: false

    belongs_to :user, User
    belongs_to :team, Team, type: Ecto.UUID
    has_many :submissions, Submission, on_delete: :delete_all

    has_many :form_integrations, FormIntegration, on_delete: :delete_all, on_replace: :delete

    has_many :email_integrations, EmailIntegration,
      where: [integration_type: :email],
      on_delete: :delete_all,
      on_replace: :delete

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(%Form{} = form, attrs) do
    form
    |> cast(attrs, [
      :callback_success_includes_data,
      :callback_success_url,
      :name,
      :hosts,
      :submission_source_policy
    ])
    |> update_change(:hosts, &normalize_hosts/1)
    |> validate_required([:name, :submission_source_policy])
    |> validate_length(:hosts, max: @max_hosts)
    |> validate_change(:hosts, &validate_hosts/2)
    |> validate_restricted_hosts()
    |> check_constraint(:submission_source_policy,
      name: :forms_submission_source_policy_check
    )
  end

  defp normalize_hosts(nil), do: nil

  defp normalize_hosts(hosts) do
    hosts
    |> Enum.map(&HostRule.normalize/1)
    |> Enum.reject(&(&1 == ""))
    |> Enum.uniq()
  end

  defp validate_hosts(:hosts, hosts) do
    invalid_hosts = Enum.reject(hosts, &HostRule.valid?/1)

    case invalid_hosts do
      [] -> []
      _ -> [hosts: "contains an invalid hostname or wildcard"]
    end
  end

  defp validate_restricted_hosts(changeset) do
    case {get_field(changeset, :submission_source_policy), get_field(changeset, :hosts)} do
      {:restricted, hosts} when hosts in [nil, []] ->
        add_error(changeset, :hosts, "must include at least one hostname when restricted")

      _ ->
        changeset
    end
  end
end
