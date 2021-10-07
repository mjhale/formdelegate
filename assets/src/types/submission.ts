import Form from 'types/form';

export default interface Submission {
  body: string;
  data: Record<string, string>;
  flagged_at: string | null;
  flagged_type: string | null;
  form: Form;
  id: string;
  inserted_at: string;
  sender: string;
  sender_ip: string;
  sender_referrer: string;
  sender_user_agent: string;
  updated_at: string;
}
