interface EmailIntegration {
  email_api_key: string | null;
  email_from_address: string | null;
  email_integration_recipients: Array<{
    email: string;
    id: number;
    name: string;
    type: 'to' | 'cc' | 'bcc';
  }>;
  enabled: boolean;
  id: string;
  inserted_at: string;
  updated_at: string;
}

export default interface Form {
  callback_success_includes_data: boolean;
  callback_success_url: string | null;
  email_integrations: Array<EmailIntegration>;
  hosts: Array<string> | null;
  id: string;
  inserted_at: string;
  name: string;
  submission_count: number;
  updated_at: string;
  verified: boolean;
}
