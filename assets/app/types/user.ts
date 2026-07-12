export default interface User {
  confirmed_at: string | null;
  email: string;
  form_count: number;
  id: number;
  is_admin: boolean;
  name: string;
}

export interface Plan {
  id: string;
  inserted_at: string;
  limit_forms: number;
  limit_storage: number;
  limit_submissions: number;
  name: string;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  updated_at: string;
}

export interface Subscription {
  ends_at: string | null;
  id: string;
  plan: Plan;
  stripe_subscription_id: string;
  stripe_subscription_status: string;
}

export interface Team {
  id: string;
  name: string | null;
  stripe_customer_id: string | null;
  subscriptions: Subscription[];
}

export interface Membership {
  id: string;
  is_billing_account: boolean;
  team: Team;
}

export interface TeamMembershipUser {
  email: string;
  id: number;
  name: string;
}

export interface TeamMembership {
  id: string;
  is_billing_account: boolean;
  user: TeamMembershipUser;
}

export interface TeamInvitation {
  accepted_at: string | null;
  email: string;
  expires_at: string;
  id: string;
  inviter: TeamMembershipUser | null;
  status: 'pending' | 'accepted' | 'cancelled';
  team: {
    id: string;
    name: string | null;
  };
}

export interface Profile {
  current_membership: Membership | null;
  current_team: Team | null;
  memberships: Membership[];
  user: User;
}

export type BillingUsageStatus =
  | 'unlimited'
  | 'ok'
  | 'warning'
  | 'over_limit'
  | 'blocked';

export interface BillingCountUsage {
  grace_limit: number | null;
  limit: number;
  status: BillingUsageStatus;
  used: number;
}

export interface BillingStorageUsage {
  grace_limit_bytes: number;
  limit_bytes: number;
  status: BillingUsageStatus;
  used_bytes: number;
}

export interface BillingUsage {
  period: {
    ended_at: string;
    started_at: string;
  };
  plan: Plan;
  subscription: Subscription | null;
  team_id: string;
  usage: {
    forms: BillingCountUsage;
    storage: BillingStorageUsage;
    submissions: BillingCountUsage;
  };
}
