import React from 'react';
import { Field } from 'redux-form';
import { findIndex } from 'lodash';

const FormIntegrationList = ({ integrations }) => {
  if (!integrations || integrations.length === 0) return null;

  return (
    <div>
      <h3>Integrations</h3>
      {integrations.map(integration =>
        <div key={integration.id} className="integration">
          <label className="label-switch status">
            <Field
              name={`form_integrations[${findIndex(integrations, [
                'id',
                integration.id,
              ])}][enabled]`}
              component="input"
              type="checkbox"
            />
            <div className="checkbox" />
          </label>
          <div className="type">
            {integration.integration.type}
          </div>
          <div className="settings">
            <div>
              <label>API Key</label>
              <Field
                name={`form_integrations[${findIndex(integrations, [
                  'id',
                  integration.id,
                ])}][settings][api_key]`}
                component="input"
                type="text"
              />
            </div>
            <div>
              <label>E-Mail Address</label>
              <Field
                name={`form_integrations[${findIndex(integrations, [
                  'id',
                  integration.id,
                ])}][settings][email]`}
                component="input"
                type="text"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormIntegrationList;
