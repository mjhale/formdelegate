export function getBackendValidationMessages(body): Array<string> {
  const error = body?.error;

  if (!error) {
    return [];
  }

  const messages = [
    getBackendErrorTypeMessage(error.type),
    ...flattenBackendErrors(error.errors),
  ].filter(Boolean);

  return messages.length > 0
    ? messages
    : ['Validation failed. Check the form and integration settings.'];
}

function getBackendErrorTypeMessage(type): string | null {
  switch (type) {
    case 'EMAIL_PROVIDER_VERIFICATION_FAILED_INVALID_CREDENTIALS':
      return 'Email provider verification failed: invalid credentials. Check the provider secret and account credentials, then try again.';
    case 'EMAIL_PROVIDER_VERIFICATION_FAILED_CONNECTION_FAILED':
      return 'Email provider verification failed: connection failed. Check the provider host, port, SSL setting, and network access.';
    case 'EMAIL_PROVIDER_VERIFICATION_FAILED_INVALID_CONFIGURATION':
      return 'Email provider verification failed: invalid configuration. Check the provider settings and required fields.';
    case 'EMAIL_PROVIDER_VERIFICATION_FAILED_UNSUPPORTED_AUTH_METHOD':
      return 'Email provider verification failed: unsupported authentication method. Use provider credentials that support the required authentication method.';
    case 'EMAIL_PROVIDER_VERIFICATION_FAILED_UNKNOWN':
      return 'Email provider verification failed. Check the provider settings and try again.';
    case 'UNSUPPORTED_EMAIL_PROVIDER':
      return 'Unsupported email provider. Select SMTP, Postmark, SendGrid, or Resend before reverifying.';
    case 'UNPROCESSABLE_ENTITY':
      return null;
    default:
      return type ? 'Form validation failed.' : null;
  }
}

function flattenBackendErrors(errors, path: Array<string> = []): Array<string> {
  if (!errors) {
    return [];
  }

  if (Array.isArray(errors)) {
    if (errors.every((error) => typeof error === 'string')) {
      return errors.map((error) => formatBackendError(path, error));
    }

    return errors.flatMap((error, index) =>
      flattenBackendErrors(error, [...path, String(index + 1)])
    );
  }

  if (typeof errors === 'object') {
    return Object.entries(errors).flatMap(([field, value]) =>
      flattenBackendErrors(value, [...path, humanizeBackendField(field)])
    );
  }

  return [];
}

function formatBackendError(path: Array<string>, error: string): string {
  if (path.length === 0) {
    return error;
  }

  return `${path.join(' > ')}: ${error}`;
}

function humanizeBackendField(field: string): string {
  return field.replaceAll('_', ' ');
}
