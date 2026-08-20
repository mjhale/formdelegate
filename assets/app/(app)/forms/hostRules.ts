export const MAX_HOST_RULES = 50;
export const MAX_HOST_RULE_LENGTH = 253;

export function normalizeHostRule(rule: string): string {
  let normalized = rule.trim().toLowerCase().replace(/\.+$/, '');

  if (normalized.startsWith('[') && normalized.endsWith(']')) {
    normalized = normalized.slice(1, -1);
  }

  return normalized;
}

export function normalizeHostRules(rules: string[]): string[] {
  return Array.from(
    new Set(rules.map(normalizeHostRule).filter((rule) => rule.length > 0))
  );
}

export function isValidHostRule(rule: string): boolean {
  if (rule.length === 0 || rule.length > MAX_HOST_RULE_LENGTH) {
    return false;
  }

  if (rule.startsWith('*.')) {
    const host = rule.slice(2);

    return (
      rule.length <= MAX_HOST_RULE_LENGTH &&
      host !== 'localhost' &&
      !isIpAddress(host) &&
      isValidDnsName(host)
    );
  }

  return (
    rule === 'localhost' ||
    isIpAddress(rule) ||
    (!isNumericDottedAddress(rule) && isValidDnsName(rule))
  );
}

function isIpAddress(host: string): boolean {
  return isIpv4Address(host) || isIpv6Address(host);
}

function isIpv4Address(host: string): boolean {
  const parts = host.split('.');

  return (
    parts.length === 4 &&
    parts.every(
      (part) =>
        /^\d{1,3}$/.test(part) && Number(part) >= 0 && Number(part) <= 255
    )
  );
}

function isIpv6Address(host: string): boolean {
  if (!host.includes(':')) {
    return false;
  }

  try {
    const parsed = new URL(`http://[${host}]`);
    return parsed.hostname.length > 0;
  } catch {
    return false;
  }
}

function isNumericDottedAddress(host: string): boolean {
  return /^\d+(?:\.\d+)+$/.test(host);
}

function isValidDnsName(host: string): boolean {
  return (
    host.length <= MAX_HOST_RULE_LENGTH &&
    /^[\x00-\x7F]+$/.test(host) &&
    host.split('.').every(isValidDnsLabel)
  );
}

function isValidDnsLabel(label: string): boolean {
  return (
    label.length >= 1 &&
    label.length <= 63 &&
    /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)
  );
}
