import { schema } from 'normalizr';

export const userSchema = new schema.Entity('users');

export const integrationSchema = new schema.Entity('integrations');

const formIntegrationSchema = new schema.Entity('form_integrations', {
  integration: integrationSchema,
});
export const formSchema = new schema.Entity('forms', {
  form_integrations: [formIntegrationSchema],
  integrations: [integrationSchema],
});

export const submissionSchema = new schema.Entity('submissions');
export const submissionActivitySchema = new schema.Entity(
  'submission_activity',
  {},
  {
    idAttribute: 'day',
  }
);
