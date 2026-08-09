import { z } from 'zod';

export type MessageFormField = 'email' | 'message';

export type MessageFormFieldErrors = Partial<
  Record<MessageFormField, string[]>
>;

export type MessageFormState =
  | { status: 'idle' }
  | { status: 'field_error'; fieldErrors: MessageFormFieldErrors }
  | { status: 'sent'; message: string }
  | { status: 'service_error'; message: string };

export const SENT_MESSAGE =
  'Your message has been sent. We’ll get back to you soon.';

export const SERVICE_ERROR_MESSAGE =
  'We couldn’t send your message right now. Please try again in a moment.';

const emailSchema = z.string().transform((email) => email.trim());

const messageSchema = z.string().superRefine((message, context) => {
  if (message.trim().length === 0) {
    context.addIssue({
      code: 'custom',
      message: 'Enter a message.',
    });
  }
});

export const messageInputSchema = z
  .object({
    name: z.string().transform((name) => name.trim()),
    email: emailSchema,
    message: messageSchema,
  })
  .superRefine(({ email }, context) => {
    if (email.length === 0) {
      context.addIssue({
        code: 'custom',
        message: 'Enter your email address.',
        path: ['email'],
      });
    } else if (!z.string().email().safeParse(email).success) {
      context.addIssue({
        code: 'custom',
        message: 'Enter a valid email address.',
        path: ['email'],
      });
    }
  });

export type MessageInput = z.infer<typeof messageInputSchema>;

export function fieldErrorState(
  error: z.ZodError<z.infer<typeof messageInputSchema>>
): MessageFormState {
  const fieldErrors = error.flatten().fieldErrors;
  const messageFieldErrors: MessageFormFieldErrors = {};

  if (fieldErrors.email) {
    messageFieldErrors.email = fieldErrors.email;
  }

  if (fieldErrors.message) {
    messageFieldErrors.message = fieldErrors.message;
  }

  return {
    status: 'field_error',
    fieldErrors: messageFieldErrors,
  };
}

export function sentState(): MessageFormState {
  return { status: 'sent', message: SENT_MESSAGE };
}

export function serviceErrorState(): MessageFormState {
  return { status: 'service_error', message: SERVICE_ERROR_MESSAGE };
}

export function validateMessageEndpoint(endpoint?: string): string | null {
  if (!endpoint) {
    return null;
  }

  try {
    const parsedEndpoint = new URL(endpoint);

    if (
      !['http:', 'https:'].includes(parsedEndpoint.protocol) ||
      parsedEndpoint.username.length > 0 ||
      parsedEndpoint.password.length > 0
    ) {
      return null;
    }

    return parsedEndpoint.toString();
  } catch {
    return null;
  }
}

export function buildSubmissionBody(input: MessageInput): URLSearchParams {
  return new URLSearchParams({
    name: input.name,
    email: input.email,
    message: input.message,
  });
}

export function isSuccessfulSubmissionStatus(status: number): boolean {
  return status >= 200 && status < 300;
}
