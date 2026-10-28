import Form from 'types/form';

interface FileUploadField {
  field_name: string;
  file_name: string;
  file_size: string;
  url: string;
}

export default interface Submission {
  body: string;
  data: Record<string, string | FileUploadField>;
  flagged_at: string | null;
  flagged_type: { type: string } | string | null;
  moderation_status?:
    'unclassified' | 'pending' | 'accepted' | 'review' | 'spam' | 'approved';
  spam_assessment?: {
    engine: string;
    decision: string;
    mode: string;
    score: number;
    reasons: string[];
  } | null;
  reviewed_at?: string | null;
  reviewed_by_id?: number | null;
  form: Form;
  id: string;
  inserted_at: string;
  sender: string;
  sender_ip: string;
  sender_referrer: string;
  sender_user_agent: string;
  updated_at: string;
}
