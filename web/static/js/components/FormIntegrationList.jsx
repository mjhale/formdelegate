import React from 'react';

export const FormIntegrationList = ({ integrations }) => {
  return(
    <div>
      <h3>Integrations</h3>
      {integrations.map((integration) => (
        <div key={integration.id} className="integration">
          <label className="label-switch status">
            <input type="checkbox" defaultChecked={integration.enabled} />
            <div className="checkbox"></div>
          </label>
          <div className="type">{integration.integration.type}</div>
          <IntegrationSettings settings={integration.settings} />
        </div>
      ))}
    </div>
  );
};

const IntegrationSettings = ({ settings }) => {
  return(
    <div key={settings.id} className="settings">
      <div>API Key: {settings.api_key || 'Not Set'}</div>
      <div>E-mail: {settings.email || 'Not Set'}</div>
    </div>
  );
};
