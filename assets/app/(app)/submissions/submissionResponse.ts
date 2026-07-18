export const INVALID_FORM_FILTER = 'INVALID_FORM_FILTER';

export function submissionApiErrorType(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object' || !('error' in payload)) {
    return undefined;
  }

  const error = payload.error;
  if (!error || typeof error !== 'object' || !('type' in error)) {
    return undefined;
  }

  return typeof error.type === 'string' ? error.type : undefined;
}

export function submissionFilterRecoveryHref(query: string): string {
  const params = new URLSearchParams();

  if (query) {
    params.set('query', query);
  }

  const queryString = params.toString();
  return queryString ? `/submissions?${queryString}` : '/submissions';
}

export function numericPaginationHeader(value: string | null): number {
  if (value === null || value.trim() === '') {
    return 0;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}
