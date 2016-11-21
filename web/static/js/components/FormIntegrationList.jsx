import React from 'react';

export const FormIntegrationList = ({ integrations }) => {
  return(
    <div>
      <h3>Integrations</h3>
      {integrations.map((integration) => (
        <div key={integration.id}>
          {integration.integration.type}
          <IntegrationSettings settings={integration.settings} />
        </div>
      ))}
    </div>
  );
};

const IntegrationSettings = ({ settings }) => {
  return(
    <div key={settings.id}>
      <span>API Key: {settings.api_key || 'None'}</span>
      {' - '}
      <span>E-mail: {settings.email || 'None'}</span>
    </div>
  );
};
