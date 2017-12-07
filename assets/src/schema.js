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

export const messageSchema = new schema.Entity('messages');
export const messageActivitySchema = new schema.Entity(
  'message_activity',
  {},
  {
    idAttribute: 'day',
  }
);
