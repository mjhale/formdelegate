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
    |> validate_host_settings()
    |> check_constraint(:submission_source_policy,
      name: :forms_submission_source_policy_check
    )
  end

  defp normalize_hosts(nil), do: nil

  defp normalize_hosts(hosts) do
    hosts
    |> Enum.map(fn
      host when is_binary(host) -> HostRule.normalize(host)
      host -> host
    end)
    |> Enum.reject(&(&1 == ""))
    |> Enum.uniq()
  end

  defp validate_host_settings(changeset) do
    policy = get_field(changeset, :submission_source_policy)

    if policy == :restricted or Map.has_key?(changeset.changes, :hosts) do
      validate_effective_hosts(changeset, get_field(changeset, :hosts))
    else
      changeset
    end
  end

  defp validate_effective_hosts(changeset, hosts) when hosts in [nil, []] do
    if get_field(changeset, :submission_source_policy) == :restricted do
      add_error(changeset, :hosts, "must include at least one hostname when restricted")
    else
      changeset
    end
  end

  defp validate_effective_hosts(changeset, hosts) when is_list(hosts) do
    changeset
    |> then(fn changeset ->
      if length(hosts) > @max_hosts do
        add_error(changeset, :hosts, "should have at most #{@max_hosts} item(s)")
      else
        changeset
      end
    end)
    |> then(fn changeset ->
      if Enum.all?(hosts, &HostRule.valid?/1) do
        changeset
      else
        add_error(changeset, :hosts, "contains an invalid hostname or wildcard")
      end
    end)
  end

  defp validate_effective_hosts(changeset, _hosts), do: changeset
end
