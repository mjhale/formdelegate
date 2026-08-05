import { z } from 'zod';

import {
  compactEmailProviderConfig,
  compactRecord,
  emailProviderRequirements as providerRequirements,
} from './emailProviderPayload';

const nullableUuid = z.preprocess(
  (value) => (value === '' ? null : value),
  z.string().uuid().nullable()
);

const emailProviderSchema = z.enum(['smtp', 'postmark', 'sendgrid']);
const nullableEmailProviderSchema = z.preprocess(
  (value) => (value === '' ? null : value),
  emailProviderSchema.nullable().optional()
);
const emailProviderCurrentStatusSchema = z
  .enum(['unconfigured', 'pending_verification', 'verified', 'invalid'])
  .optional();
const emailProviderLastVerifiedAtSchema = z
  .preprocess((value) => (value === '' ? null : value), z.string().nullable())
  .optional();
const emailProviderStatusSchema = z.literal('pending_verification').optional();
const looseProviderPayloadSchema = z.record(z.string(), z.unknown());

const smtpEmailProviderConfigSchema = z.object({
  from_address: z.string().email(),
  host: z.string().min(1),
  port: z.coerce.number().int().positive(),
  use_ssl: z.coerce.boolean().optional(),
  username: z.string().min(1),
});

const postmarkEmailProviderConfigSchema = z.object({
  from_address: z.string().email(),
  message_stream: z.string().optional(),
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

const emailIntegrationRecipientSchema = z.object({
  id: z.number().nullable(),
  name: z.string().nullable(),
  email: z.string().email(),
  type: z.enum(['to', 'cc', 'bcc']),
});

const emailIntegrationSchema = z
  .object({
    _email_provider_last_verified_at: emailProviderLastVerifiedAtSchema,
    _email_provider_status: emailProviderCurrentStatusSchema,
    id: nullableUuid,
    enabled: z.coerce.boolean(),
    email_provider: nullableEmailProviderSchema,
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

    addProviderFieldIssues(
      context,
      integration.email_provider_config,
      emailProviderConfigSchemas[provider],
      'email_provider_config',
      requirements.requiredConfig
    );

    if (integration.id === null) {
      addProviderFieldIssues(
        context,
        integration.email_provider_secrets,
        emailProviderSecretsSchemas[provider],
        'email_provider_secrets',
        requirements.secrets
      );
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
      _email_provider_last_verified_at,
      _email_provider_status,
      email_provider_status,
      email_provider_secrets,
      verify_provider,
      ...integration
    }) => {
      const requirements = integration.email_provider
        ? providerRequirements[integration.email_provider]
        : null;
      const compactConfig = integration.email_provider
        ? compactEmailProviderConfig(
            integration.email_provider,
            integration.email_provider_config
          )
        : compactRecord(integration.email_provider_config);
      const compactSecrets = requirements
        ? compactRecord(email_provider_secrets, requirements.secrets)
        : compactRecord(email_provider_secrets);
      const payload = {
        ...integration,
        ...(requirements
          ? { email_provider_config: compactConfig ?? {} }
          : compactConfig
            ? { email_provider_config: compactConfig }
            : {}),
        ...(compactSecrets ? { email_provider_secrets: compactSecrets } : {}),
      };

      if (
        integration.enabled &&
        email_provider_status === 'pending_verification' &&
        verify_provider === true
      ) {
        return {
          ...payload,
          email_provider_status,
          verify_provider,
        };
      }

      return payload;
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

function addProviderFieldIssues(
  context: z.RefinementCtx,
  value: unknown,
  schema: z.ZodType,
  groupPath: 'email_provider_config' | 'email_provider_secrets',
  requiredKeys: readonly string[]
) {
  const record =
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : {};
  const missingKeys = new Set(
    requiredKeys.filter((key) => {
      const fieldValue = record[key];

      return (
        fieldValue === undefined || fieldValue === null || fieldValue === ''
      );
    })
  );

  missingKeys.forEach((key) => {
    context.addIssue({
      code: 'custom',
      message: 'is required',
      path: [groupPath, key],
    });
  });

  const result = schema.safeParse(value);

  if (result.success) {
    return;
  }

  result.error.issues.forEach((issue) => {
    const field = issue.path[0];

    if (
      (typeof field === 'string' && missingKeys.has(field)) ||
      (issue.path.length === 0 && missingKeys.size > 0)
    ) {
      return;
    }

    context.addIssue({
      code: 'custom',
      message: issue.message,
      path: [groupPath, ...issue.path],
    });
  });
}
