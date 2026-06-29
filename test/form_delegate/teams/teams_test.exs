defmodule FormDelegate.TeamsTest do
  use FormDelegate.DataCase

  import FormDelegate.Factory

  alias FormDelegate.Memberships.Membership
  alias FormDelegate.Repo
  alias FormDelegate.Teams

  describe "team_admin?/2" do
    test "grants access to app admins" do
      admin = insert(:user, is_admin: true)
      team = insert(:team)

      assert Teams.team_admin?(admin, team)
    end

    test "grants access to billing members of the team" do
      team = insert(:team)
      other_team = insert(:team)
      billing_user = insert(:user)
      member_user = insert(:user)

      membership_fixture(team, user: billing_user, is_billing_account: true)
      membership_fixture(team, user: member_user, is_billing_account: false)

      assert Teams.team_admin?(billing_user, team)
      refute Teams.team_admin?(member_user, team)
      refute Teams.team_admin?(billing_user, other_team)
    end
  end

  describe "list_memberships/2" do
    test "lists memberships for team admins" do
      team = insert(:team)
      admin = insert(:user)
      member = insert(:user)
      admin_membership = membership_fixture(team, user: admin, is_billing_account: true)
      member_membership = membership_fixture(team, user: member, is_billing_account: false)

      assert {:ok, memberships} = Teams.list_memberships(admin, team)

      assert MapSet.new(Enum.map(memberships, & &1.id)) ==
               MapSet.new([admin_membership.id, member_membership.id])

      assert Enum.all?(memberships, &Ecto.assoc_loaded?(&1.user))
      assert Enum.all?(memberships, &Ecto.assoc_loaded?(&1.team))
    end

    test "rejects non-admin team members" do
      team = insert(:team)
      admin = insert(:user)
      member = insert(:user)

      membership_fixture(team, user: admin, is_billing_account: true)
      membership_fixture(team, user: member, is_billing_account: false)

      assert {:error, :forbidden} = Teams.list_memberships(member, team)
    end

    test "rejects billing members from other teams" do
      team = insert(:team)
      other_team = insert(:team)
      billing_user = insert(:user)

      membership_fixture(other_team, user: billing_user, is_billing_account: true)

      assert {:error, :forbidden} = Teams.list_memberships(billing_user, team)
    end
  end

  describe "update_membership/4" do
    test "updates billing authority for team admins" do
      team = insert(:team)
      admin = insert(:user)
      member = insert(:user)
      membership_fixture(team, user: admin, is_billing_account: true)
      member_membership = membership_fixture(team, user: member, is_billing_account: false)

      assert {:ok, %Membership{} = membership} =
               Teams.update_membership(admin, team, member_membership, %{
                 is_billing_account: true
               })

      assert membership.is_billing_account
      assert reload_membership(member_membership).is_billing_account
      assert Ecto.assoc_loaded?(membership.user)
      assert Ecto.assoc_loaded?(membership.team)
    end

    test "rejects non-admin team members" do
      team = insert(:team)
      admin = insert(:user)
      member = insert(:user)
      admin_membership = membership_fixture(team, user: admin, is_billing_account: true)
      membership_fixture(team, user: member, is_billing_account: false)

      assert {:error, :forbidden} =
               Teams.update_membership(member, team, admin_membership, %{
                 is_billing_account: false
               })

      assert reload_membership(admin_membership).is_billing_account
    end

    test "does not demote the final team admin" do
      team = insert(:team)
      admin = insert(:user)
      member = insert(:user)
      admin_membership = membership_fixture(team, user: admin, is_billing_account: true)
      membership_fixture(team, user: member, is_billing_account: false)

      assert {:error, :last_team_admin} =
               Teams.update_membership(admin, team, admin_membership, %{
                 is_billing_account: false
               })

      assert reload_membership(admin_membership).is_billing_account
    end

    test "returns a changeset error when billing authority is nil" do
      team = insert(:team)
      admin = insert(:user)
      member = insert(:user)
      membership_fixture(team, user: admin, is_billing_account: true)
      member_membership = membership_fixture(team, user: member, is_billing_account: false)

      assert {:error, %Ecto.Changeset{} = changeset} =
               Teams.update_membership(admin, team, member_membership, %{
                 is_billing_account: nil
               })

      assert %{is_billing_account: ["can't be blank"]} = errors_on(changeset)
      refute reload_membership(member_membership).is_billing_account
    end

    test "prevents cross-team access" do
      team = insert(:team)
      other_team = insert(:team)
      admin = insert(:user)
      other_member = insert(:user)
      membership_fixture(team, user: admin, is_billing_account: true)
      other_membership = membership_fixture(other_team, user: other_member)

      assert {:error, :not_found} =
               Teams.update_membership(admin, team, other_membership, %{
                 is_billing_account: true
               })

      assert {:error, :forbidden} =
               Teams.update_membership(admin, other_team, other_membership, %{
                 is_billing_account: true
               })
    end
  end

  describe "remove_membership/3" do
    test "removes a member for team admins" do
      team = insert(:team)
      admin = insert(:user)
      member = insert(:user)
      membership_fixture(team, user: admin, is_billing_account: true)
      member_membership = membership_fixture(team, user: member, is_billing_account: false)

      assert {:ok, %Membership{id: removed_id}} =
               Teams.remove_membership(admin, team, member_membership)

      assert removed_id == member_membership.id
      refute Repo.get(Membership, member_membership.id)
    end

    test "does not remove the final team member" do
      team = insert(:team)
      admin = insert(:user)
      admin_membership = membership_fixture(team, user: admin, is_billing_account: true)

      assert {:error, :last_team_member} =
               Teams.remove_membership(admin, team, admin_membership)

      assert reload_membership(admin_membership)
    end

    test "does not remove the final team admin" do
      team = insert(:team)
      admin = insert(:user)
      member = insert(:user)
      admin_membership = membership_fixture(team, user: admin, is_billing_account: true)
      membership_fixture(team, user: member, is_billing_account: false)

      assert {:error, :last_team_admin} =
               Teams.remove_membership(admin, team, admin_membership)

      assert reload_membership(admin_membership)
    end

    test "allows self-removal when another team admin remains" do
      team = insert(:team)
      admin = insert(:user)
      other_admin = insert(:user)
      admin_membership = membership_fixture(team, user: admin, is_billing_account: true)
      membership_fixture(team, user: other_admin, is_billing_account: true)

      assert {:ok, %Membership{id: removed_id}} =
               Teams.remove_membership(admin, team, admin_membership)

      assert removed_id == admin_membership.id
      refute Repo.get(Membership, admin_membership.id)
    end

    test "prevents cross-team access" do
      team = insert(:team)
      other_team = insert(:team)
      admin = insert(:user)
      other_member = insert(:user)
      membership_fixture(team, user: admin, is_billing_account: true)
      other_membership = membership_fixture(other_team, user: other_member)

      assert {:error, :not_found} = Teams.remove_membership(admin, team, other_membership)
      assert {:error, :forbidden} = Teams.remove_membership(admin, other_team, other_membership)
    end
  end

  defp membership_fixture(team, attrs) do
    user = Keyword.get_lazy(attrs, :user, fn -> insert(:user) end)
    is_billing_account = Keyword.get(attrs, :is_billing_account, false)

    Repo.insert!(%Membership{
      user_id: user.id,
      team_id: team.id,
      is_billing_account: is_billing_account
    })
  end

  defp reload_membership(%Membership{id: id}) do
    Repo.get!(Membership, id)
  end
end
