const DEFAULT_PUBLIC_FORM_ORIGIN = 'https://www.formdelegate.com';

export function publicFormEndpoint(formId: string): string {
  return `${DEFAULT_PUBLIC_FORM_ORIGIN}/f/${formId}`;
}
