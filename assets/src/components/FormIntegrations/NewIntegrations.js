import React from 'react';
import { Field } from 'redux-form';
import styled, { keyframes } from 'styled-components';
import renderInputField from 'components/Field';
import theme from 'constants/theme';

const Integration = styled.div`
  animation: ${keyframes`
    0% {
      background-color: ${theme.solidWhite};
      border: 1px solid ${theme.solidWhite};
      box-shadow: 0 0 0.2em 0 ${theme.solidWhite};
    }
    50% {
      box-shadow: 0 0 0.2em 0 ${theme.chathamBlue};
    }
    100% {
      background-color: ${theme.offWhite};
      border: 1px solid ${theme.ghostGray};
      box-shadow: 0 0 0.2em 0 ${theme.solidWhite};
    }
  `} 0.75s linear 1 forwards;
  padding: 0.5rem;

  &:not(:last-child) {
    margin-bottom: 0.5rem;
  }
`;

const renderIntegrationTypeSelector = ({ integrationTypes, ...props }) => (
  <div>
    <select {...props.input}>
      <option value="" />
      {Object.keys(integrationTypes).map(key => {
        return (
          <option
            value={integrationTypes[key].id}
            key={integrationTypes[key].id}
          >
            {integrationTypes[key].type}
          </option>
        );
      })}
    </select>
  </div>
);

const NewIntegrations = ({
  newIntegrationFields,
  integrationTypes,
  lastFormIntegrationId,
}) => {
  if (!newIntegrationFields) return null;
  if (typeof lastFormIntegrationId === 'undefined') lastFormIntegrationId = -1;

  let items = [];

  for (let i = 1; i <= newIntegrationFields; i++) {
    const currentId = lastFormIntegrationId + i;
    items.push(
      <Integration key={i}>
        <div>
          <label>Integration Type</label>
          <Field
            name={`form_integrations[${currentId}][integration_id]`}
            integrationTypes={integrationTypes}
            component={renderIntegrationTypeSelector}
          />
        </div>
        <Field
          component={renderInputField}
          name={`form_integrations[${currentId}][settings][api_key]`}
          label="API Key"
          type="text"
        />
        <Field
          component={renderInputField}
          name={`form_integrations[${currentId}][settings][email]`}
          label="E-Mail Address"
          type="text"
        />
      </Integration>
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
