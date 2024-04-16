import { z } from 'zod';

export const schema = z.object({
  id: z.string().uuid().nullable(),
  name: z.string().min(1),
  email_integrations: z
    .object({
      id: z.string().uuid().nullable(),
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
