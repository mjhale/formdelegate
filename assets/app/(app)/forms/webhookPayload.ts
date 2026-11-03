import type { WebhookIntegration, WebhookIntegrationInput } from 'types/form';

export const MAX_WEBHOOK_INTEGRATIONS = 3;

// These are syntactic checks only. The API validates DNS and destination IPs.
export function isPublicWebhookUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const labels = host.split('.');
    const reservedSuffixes = [
      'localhost',
      'local',
      'localdomain',
      'internal',
      'intranet',
      'lan',
      'home',
      'test',
      'invalid',
      'example',
      'onion',
      'arpa',
    ];

    return (
      /^https:\/\//i.test(value) &&
      !/[\u0000-\u0020\u007f]/.test(value) &&
      !value.includes('#') &&
      !value.split('/')[2]?.includes('@') &&
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !url.hash &&
      (url.port === '' || url.port === '443') &&
      host.length <= 253 &&
      labels.length >= 2 &&
      !/^\d+(\.\d+)*$/.test(host) &&
      labels.every((label) =>
        /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)
      ) &&
      !reservedSuffixes.includes(labels.at(-1)) &&
      !['example.com', 'example.net', 'example.org'].some(
        (suffix) => host === suffix || host.endsWith(`.${suffix}`)
      )
    );
  } catch {
    return false;
  }
}

export function sanitizeWebhookDefaults(
  integrations?: Array<WebhookIntegration>
): Array<WebhookIntegrationInput> {
  return (integrations ?? []).map(({ id, enabled, url }) => ({
    id,
    enabled,
    url,
    signing_secret: '',
  }));
}

export function serializeWebhookPayload(
  integration: WebhookIntegrationInput
): WebhookIntegrationInput {
  return {
    ...(integration.id ? { id: integration.id } : {}),
    enabled: integration.enabled,
    url: integration.url,
    ...(integration.signing_secret
      ? { signing_secret: integration.signing_secret }
      : {}),
  };
}
