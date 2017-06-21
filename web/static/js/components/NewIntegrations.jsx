import React, { PropTypes } from 'react';
import { Field } from 'redux-form';

const renderIntegrationTypeSelector = (props) => {
  const { integrationTypes } = props;

  return (
    <div>
      <select {...props.input}>
        <option value=""></option>
        {Object.keys(integrationTypes).map((key) => {
          return (
            <option value={integrationTypes[key].id} key={integrationTypes[key].id}>
              {integrationTypes[key].type}
            </option>
          );
        })}
      </select>
    </div>
  );
};

const NewIntegrations = ({ newIntegrationFields, integrationTypes, lastFormIntegrationId }) => {
  if (!newIntegrationFields) return null;
  if (!lastFormIntegrationId) lastFormIntegrationId = -1;

  let items = [];

  for (let i = 1; i <= newIntegrationFields; i++) {
    const currentId = lastFormIntegrationId + i;
    items.push(
      <div key={i} className="integration new-integration">
        <div className="settings">
          <div>
            <label>Integration Type</label>
            <Field
              name={`form_integrations[${currentId}][integration_id]`}
              integrationTypes={integrationTypes}
              component={renderIntegrationTypeSelector}
            />
          </div>
          <div>
            <label>API Key</label>
            <Field
              name={`form_integrations[${currentId}][settings][api_key]`}
              component="input"
              type="text"
            />
          </div>
          <div>
            <label>E-Mail Address</label>
            <Field
              name={`form_integrations[${currentId}][settings][email]`}
              component="input"
              type="text"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3>New Integrations</h3>
      {items}
    </div>
  );
};

export default NewIntegrations;
