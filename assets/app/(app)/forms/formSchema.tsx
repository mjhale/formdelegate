import { z } from 'zod';

const nullableUuid = z.preprocess(
  (value) => (value === '' ? null : value),
  z.string().uuid().nullable()
);

export const formSchema = z.object({
  id: nullableUuid,
  name: z.string().min(1),
  email_integrations: z
    .object({
      id: nullableUuid,
      enabled: z.coerce.boolean(),
      email_integration_recipients: z
        .object({
          id: z.number().nullable(),
          name: z.string().nullable(),
          email: z.string().email(),
          type: z.enum(['to', 'cc', 'bcc']),
        })
        .array(),
    })
    .array(),
});

export const createFormSchema = formSchema.omit({ id: true });

export const updateFormSchema = formSchema.extend({
  id: z.string().uuid(),
});
