export type EmailProvider = 'smtp' | 'postmark' | 'sendgrid';

export type EmailProviderStatus =
  | 'unconfigured'
  | 'pending_verification'
  | 'verified'
  | 'invalid';

export type EmailProviderWritableStatus = 'pending_verification';

export type EmailIntegrationRecipientType = 'to' | 'cc' | 'bcc';

export interface SMTPEmailProviderConfig {
  from_address: string;
  host: string;
  port: number;
  use_ssl?: boolean;
  username: string;
}

export interface PostmarkEmailProviderConfig {
  from_address: string;
  message_stream: string;
}

export interface SendGridEmailProviderConfig {
  from_address: string;
}

export type EmailProviderConfigShape =
  | SMTPEmailProviderConfig
  | PostmarkEmailProviderConfig
  | SendGridEmailProviderConfig;

export type EmailProviderConfig = Record<string, unknown>;

export interface SMTPEmailProviderSecretsInput {
  password: string;
}

export interface PostmarkEmailProviderSecretsInput {
  server_token: string;
}

export interface SendGridEmailProviderSecretsInput {
  api_key: string;
}

export type EmailProviderSecretsInput = Record<string, unknown>;

export interface EmailIntegrationRecipientInput {
  email: string;
  id: number | null;
  name: string | null;
  type: EmailIntegrationRecipientType;
}

export interface EmailIntegrationRecipient {
  email: string;
  id: number;
  name: string | null;
  type: EmailIntegrationRecipientType;
}

export interface EmailIntegrationInput {
  _email_provider_last_verified_at?: string | null;
  _email_provider_status?: EmailProviderStatus;
  email_provider?: EmailProvider | null;
  email_provider_config?: EmailProviderConfig | null;
  email_provider_secrets?: EmailProviderSecretsInput;
  email_provider_status?: EmailProviderWritableStatus;
  email_integration_recipients: Array<EmailIntegrationRecipientInput>;
  enabled: boolean;
  id: string | null;
  verify_provider?: boolean;
}

export interface EmailIntegration {
  email_provider: EmailProvider | null;
  email_provider_config: EmailProviderConfig | null;
  email_provider_last_verified_at: string | null;
  email_provider_status: EmailProviderStatus;
  email_integration_recipients: Array<EmailIntegrationRecipient>;
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
