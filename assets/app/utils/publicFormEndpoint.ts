const DEFAULT_PUBLIC_FORM_ORIGIN = 'https://www.formdelegate.com';

function publicFormOrigin(): string {
  // Next.js inlines this direct reference into client bundles at build time.
  const configured = process.env.NEXT_PUBLIC_FORM_ORIGIN?.trim();
  if (!configured) return DEFAULT_PUBLIC_FORM_ORIGIN;

  try {
    const url = new URL(configured);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    ) {
      throw new Error('Invalid origin');
    }
    return url.origin;
  } catch {
    throw new Error(
      'NEXT_PUBLIC_FORM_ORIGIN must be an HTTP(S) origin without credentials, a path, query, or fragment.'
    );
  }
}

export function publicFormEndpoint(formId: string): string {
  return `${publicFormOrigin()}/f/${encodeURIComponent(formId)}`;
}
