import type { EmailProvider, EmailProviderStatus } from 'types/form';

export const emailProviderRequirements = {
  smtp: {
    config: ['from_address', 'host', 'port', 'use_ssl', 'username'],
    requiredConfig: ['from_address', 'host', 'port', 'username'],
    secrets: ['password'],
  },
  postmark: {
    config: ['from_address', 'message_stream'],
    requiredConfig: ['from_address'],
    secrets: ['server_token'],
  },
  sendgrid: {
    config: ['from_address'],
    requiredConfig: ['from_address'],
    secrets: ['api_key'],
  },
} as const;

interface FormPayloadInput extends Record<string, unknown> {
  email_integrations?: Array<EmailIntegrationPayloadInput>;
}

interface EmailIntegrationPayloadInput extends Record<string, unknown> {
  _email_provider_status?: EmailProviderStatus;
}

export function serializeFormPayload(
  form: FormPayloadInput,
  sourceForm: FormPayloadInput = form
): Record<string, unknown> {
  const formPayload: Record<string, unknown> = { ...form };
  const emailIntegrations = form.email_integrations;

  delete formPayload.email_integrations;
  delete formPayload.verified;

  if (!Array.isArray(emailIntegrations)) {
    return formPayload;
  }

  const sourceEmailIntegrations = Array.isArray(sourceForm.email_integrations)
    ? sourceForm.email_integrations
    : [];

  return {
    ...formPayload,
    email_integrations: emailIntegrations.map((integration, index) =>
      serializeEmailIntegrationPayload(
        integration,
        sourceEmailIntegrations[index]
      )
    ),
  };
}

function serializeEmailIntegrationPayload(
  integration: EmailIntegrationPayloadInput,
  sourceIntegration?: EmailIntegrationPayloadInput
): Record<string, unknown> {
  const payload: Record<string, unknown> = { ...integration };
  const provider = getEmailProvider(payload.email_provider);
  const currentStatus = getCurrentProviderStatus(
    sourceIntegration?._email_provider_status
  );
  const requestsVerification =
    payload.email_provider_status === 'pending_verification' ||
    payload.verify_provider === true;
  const shouldRequestVerification =
    payload.enabled === true &&
    provider !== null &&
    (requestsVerification ||
      payload.id === null ||
      payload.id === undefined ||
      currentStatus !== 'verified');

  delete payload._email_provider_last_verified_at;
  delete payload._email_provider_status;
  delete payload.email_provider_config;
  delete payload.email_provider_secrets;
  delete payload.email_provider_status;
  delete payload.verify_provider;

  if (provider) {
    const requirements = emailProviderRequirements[provider];
    const config = compactEmailProviderConfig(
      provider,
      integration.email_provider_config
    );
    const secrets = compactRecord(
      integration.email_provider_secrets,
      requirements.secrets
    );

    payload.email_provider = provider;
    payload.email_provider_config = config ?? {};

    if (secrets) {
      payload.email_provider_secrets = secrets;
    }
  } else if (integration.email_provider === null) {
    payload.email_provider = null;
  } else {
    delete payload.email_provider;
  }

  if (shouldRequestVerification) {
    payload.email_provider_status = 'pending_verification';
    payload.verify_provider = true;
  }

  return payload;
}

export function compactEmailProviderConfig(
  provider: EmailProvider,
  value: unknown
): Record<string, unknown> | undefined {
  const config = compactRecord(
    value,
    emailProviderRequirements[provider].config
  );

  if (!config || provider !== 'postmark') {
    return config;
  }

  const messageStream = config.message_stream;

  if (typeof messageStream !== 'string') {
    return config;
  }

  const trimmedMessageStream = messageStream.trim();

  if (trimmedMessageStream === '') {
    delete config.message_stream;
  } else {
    config.message_stream = trimmedMessageStream;
  }

  return Object.keys(config).length === 0 ? undefined : config;
}

export function compactRecord(
  value: unknown,
  allowedKeys?: readonly string[]
): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const allowedKeySet = allowedKeys ? new Set(allowedKeys) : null;

  const entries = Object.entries(value)
    .filter(([, fieldValue]) => {
      return (
        fieldValue !== undefined && fieldValue !== null && fieldValue !== ''
      );
    })
    .filter(([fieldKey]) => {
      return !allowedKeySet || allowedKeySet.has(fieldKey);
    });

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries);
}

function getEmailProvider(provider: unknown): EmailProvider | null {
  if (
    provider === 'smtp' ||
    provider === 'postmark' ||
    provider === 'sendgrid'
  ) {
    return provider;
  }

  return null;
}

function getCurrentProviderStatus(
  status: unknown
): EmailProviderStatus | undefined {
  if (
    status === 'unconfigured' ||
    status === 'pending_verification' ||
    status === 'verified' ||
    status === 'invalid'
  ) {
    return status;
  }

  return undefined;
}
