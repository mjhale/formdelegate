import { schema } from 'normalizr';

export const userSchema = new schema.Entity('users');

export const emailIntegrationSchema = new schema.Entity('email_integrations');

export const formSchema = new schema.Entity('forms', {
  email_integrations: [emailIntegrationSchema],
});

export const planSchema = new schema.Entity('plans');

export const submissionSchema = new schema.Entity('submissions', {
  form: formSchema,
});

export const submissionActivitySchema = new schema.Entity(
  'submission_activity',
  {},
  {
    idAttribute: 'day',
  }
);
