import { schema } from 'normalizr';

const integrationSchema = new schema.Entity('integrations');
export const integrationListSchema = new schema.Array(integrationSchema);
const formIntegrationSchema = new schema.Entity('form_integrations', {
  integration: integrationSchema,
});
export const formSchema = new schema.Entity('forms', {
  form_integrations: [formIntegrationSchema],
  integrations: [integrationSchema],
});
