export function safeRedirectPath(
  destination: FormDataEntryValue | string | null | undefined,
  fallback = '/dashboard'
) {
  if (typeof destination !== 'string') {
    return fallback;
  }

  if (!destination.startsWith('/')) {
    return fallback;
  }

  const variants = redirectVariants(destination);

  if (
    variants.length === 0 ||
    variants.some(
      (value) => value.startsWith('//') || /[\u0000-\u001F\u007F\\]/.test(value)
    )
  ) {
    return fallback;
  }

  const baseUrl = 'https://formdelegate.local';
  const parsedUrl = new URL(destination, baseUrl);

  if (parsedUrl.origin !== baseUrl) {
    return fallback;
  }

  return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
}

export function invitationAcceptancePath(token: string) {
  return `/team-invitations/accept?${new URLSearchParams({ token }).toString()}`;
}

function redirectVariants(destination: string) {
  const variants = [destination];
  let current = destination;

  for (let index = 0; index < 3; index += 1) {
    try {
      const decoded = decodeURIComponent(current);

      if (decoded === current) {
        return variants;
      }

      variants.push(decoded);
      current = decoded;
    } catch (_error) {
      return [];
    }
  }

  return variants;
}
