import type { EmailProviderStatus } from 'types/form';

export interface EmailIntegrationStatusUpdate {
  emailProviderLastVerifiedAt: string | null;
  emailProviderStatus: EmailProviderStatus;
  integrationId: string;
}

interface ReverifyAvailabilityInput {
  currentStatus: unknown;
  formId: unknown;
  integrationId: unknown;
  isDirty: boolean;
  provider: unknown;
}

export function canReverifyEmailIntegration({
  currentStatus,
  formId,
  integrationId,
  isDirty,
  provider,
}: ReverifyAvailabilityInput): boolean {
  return (
    currentStatus === 'verified' &&
    !isDirty &&
    isPresentString(formId) &&
    isPresentString(integrationId) &&
    isPresentString(provider)
  );
}

export function getReverifyFailureStatusUpdate(
  body: unknown,
  integrationId: string
): EmailIntegrationStatusUpdate | null {
  const type = getBackendErrorType(body);

  if (!isProviderVerificationFailureType(type)) {
    return null;
  }

  return {
    emailProviderLastVerifiedAt: null,
    emailProviderStatus: 'invalid',
    integrationId,
  };
}

export function getEmailIntegrationIndexById(
  emailIntegrations: Array<{ id?: unknown }>,
  integrationId: string
): number {
  return emailIntegrations.findIndex(
    (emailIntegration) => emailIntegration.id === integrationId
  );
}

export function isReverifyStatusUpdateForIntegration(
  statusUpdate: EmailIntegrationStatusUpdate,
  integrationId: unknown
): boolean {
  return statusUpdate.integrationId === integrationId;
}

function getBackendErrorType(body: unknown): unknown {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const error = (body as { error?: unknown }).error;

  if (!error || typeof error !== 'object') {
    return null;
  }

  return (error as { type?: unknown }).type;
}

function isProviderVerificationFailureType(type: unknown): boolean {
  return (
    typeof type === 'string' &&
    type.startsWith('EMAIL_PROVIDER_VERIFICATION_FAILED_')
  );
}

function isPresentString(value: unknown): value is string {
  return typeof value === 'string' && value !== '';
}
