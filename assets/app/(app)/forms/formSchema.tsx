import { z } from 'zod';

const nullableUuid = z.preprocess(
  (value) => (value === '' ? null : value),
  z.string().uuid().nullable()
);

const emailProviderSchema = z.enum(['smtp', 'postmark', 'sendgrid']);
const emailProviderCurrentStatusSchema = z
  .enum(['unconfigured', 'pending_verification', 'verified', 'invalid'])
  .optional();
const emailProviderStatusSchema = z.literal('pending_verification').optional();
const looseProviderPayloadSchema = z.record(z.string(), z.unknown());

const smtpEmailProviderConfigSchema = z.object({
  from_address: z.string().email(),
  host: z.string().min(1),
  port: z.coerce.number().int().positive(),
  username: z.string().min(1),
});

const postmarkEmailProviderConfigSchema = z.object({
  from_address: z.string().email(),
  message_stream: z.string().min(1),
});

const sendgridEmailProviderConfigSchema = z.object({
  from_address: z.string().email(),
});

const emailProviderConfigSchemas = {
  smtp: smtpEmailProviderConfigSchema,
  postmark: postmarkEmailProviderConfigSchema,
  sendgrid: sendgridEmailProviderConfigSchema,
};

const smtpEmailProviderSecretsSchema = z.object({
  password: z.string().min(1),
});

const postmarkEmailProviderSecretsSchema = z.object({
  server_token: z.string().min(1),
});

const sendgridEmailProviderSecretsSchema = z.object({
  api_key: z.string().min(1),
});

const emailProviderSecretsSchemas = {
  smtp: smtpEmailProviderSecretsSchema,
  postmark: postmarkEmailProviderSecretsSchema,
  sendgrid: sendgridEmailProviderSecretsSchema,
};

const providerRequirements = {
  smtp: {
    config: ['from_address', 'host', 'port', 'username'],
    secrets: ['password'],
  },
  postmark: {
    config: ['from_address', 'message_stream'],
    secrets: ['server_token'],
  },
  sendgrid: {
    config: ['from_address'],
    secrets: ['api_key'],
  },
} as const;

const emailIntegrationRecipientSchema = z.object({
  id: z.number().nullable(),
  name: z.string().nullable(),
  email: z.string().email(),
  type: z.enum(['to', 'cc', 'bcc']),
});

const emailIntegrationSchema = z
  .object({
    _email_provider_status: emailProviderCurrentStatusSchema,
    id: nullableUuid,
    enabled: z.coerce.boolean(),
    email_provider: emailProviderSchema.nullable().optional(),
    email_provider_config: looseProviderPayloadSchema.nullable().optional(),
    email_provider_secrets: looseProviderPayloadSchema.optional(),
    email_provider_status: emailProviderStatusSchema,
    email_integration_recipients: emailIntegrationRecipientSchema.array(),
    verify_provider: z.coerce.boolean().optional(),
  })
  .superRefine((integration, context) => {
    const provider = integration.email_provider;
    const requestsVerification =
      integration.email_provider_status === 'pending_verification' &&
      integration.verify_provider === true;

    if (integration.verify_provider === true) {
      if (integration.email_provider_status !== 'pending_verification') {
        context.addIssue({
          code: 'custom',
          message:
            'must be pending_verification when verification is requested',
          path: ['email_provider_status'],
        });
      }
    }

    if (
      integration.email_provider_status === 'pending_verification' &&
      integration.verify_provider !== true
    ) {
      context.addIssue({
        code: 'custom',
        message: 'must be true when verification is requested',
        path: ['verify_provider'],
      });
    }

    if (!integration.enabled) {
      return;
    }

    if (!provider) {
      context.addIssue({
        code: 'custom',
        message: 'is required when email integration is enabled',
        path: ['email_provider'],
      });

      return;
    }

    const requirements = providerRequirements[provider];

    if (
      !integration.email_integration_recipients.some(
        (recipient) => recipient.type === 'to'
      )
    ) {
      context.addIssue({
        code: 'custom',
        message: "must include at least one 'to' recipient",
        path: ['email_integration_recipients'],
      });
    }

    if (
      !hasRequiredKeys(
        integration.email_provider_config,
        requirements.config
      ) ||
      !emailProviderConfigSchemas[provider].safeParse(
        integration.email_provider_config
      ).success
    ) {
      context.addIssue({
        code: 'custom',
        message: 'is required when email integration is enabled',
        path: ['email_provider_config'],
      });
    }

    if (
      integration.id === null &&
      (!hasRequiredKeys(
        integration.email_provider_secrets,
        requirements.secrets
      ) ||
        !emailProviderSecretsSchemas[provider].safeParse(
          integration.email_provider_secrets
        ).success)
    ) {
      context.addIssue({
        code: 'custom',
        message: 'is required for new enabled email integrations',
        path: ['email_provider_secrets'],
      });
    }

    if (integration.id === null && !requestsVerification) {
      context.addIssue({
        code: 'custom',
        message: 'must be pending_verification for new enabled integrations',
        path: ['email_provider_status'],
      });

      context.addIssue({
        code: 'custom',
        message: 'must be true for new enabled integrations',
        path: ['verify_provider'],
      });
    }

    if (
      integration.id !== null &&
      integration._email_provider_status !== 'verified' &&
      !requestsVerification
    ) {
      context.addIssue({
        code: 'custom',
        message: 'must be pending_verification for unverified integrations',
        path: ['email_provider_status'],
      });

      context.addIssue({
        code: 'custom',
        message: 'must be true for unverified integrations',
        path: ['verify_provider'],
      });
    }
  })
  .transform(
    ({
      _email_provider_status,
      email_provider_status,
      verify_provider,
      ...integration
    }) => {
      if (
        integration.enabled &&
        email_provider_status === 'pending_verification' &&
        verify_provider === true
      ) {
        return {
          ...integration,
          email_provider_status,
          verify_provider,
        };
      }

      return integration;
    }
  );

export const formSchema = z.object({
  id: nullableUuid,
  name: z.string().min(1),
  verified: z.never().optional(),
  email_integrations: emailIntegrationSchema.array(),
});

export const createFormSchema = formSchema.omit({ id: true });

export const updateFormSchema = formSchema.extend({
  id: z.string().uuid(),
});

function hasRequiredKeys(
  value: unknown,
  keys: readonly string[]
): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  return keys.every((key) => {
    const fieldValue = record[key];

    return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
  });
}
