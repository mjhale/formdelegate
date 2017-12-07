import React from 'react';
import { Field } from 'redux-form';
import { findIndex } from 'lodash';
import styled from 'styled-components';
import theme from 'constants/theme';
import ToggleSwitch from 'components/ToggleSwitch';

const Header = styled.div`
  background-color: ${theme.backgroundColor};
  display: flex;
  justify-content: space-between;
  font-family: ${theme.systemFont};
  font-size: 0.9rem;
  padding: 0.2rem 0.5rem;
`;

const Integration = styled.div`
  background-color: #fafafa;
  border: 2px solid ${theme.borderColor};
  font-size: 0.8rem;
  line-height: 1rem;
  text-transform: uppercase;

  &:not(:last-child) {
    margin-bottom: 0.5rem;
  }
`;

const IntegrationToggle = styled(ToggleSwitch)`
  display: flex;
`;

const Settings = styled.div`
  padding: 0.5rem;
`;

const Type = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const FormIntegrationList = ({ integrations }) => {
  if (!integrations || integrations.length === 0) return null;

  return (
    <div>
      <h3>Integrations</h3>
      {integrations.map(integration => (
        <Integration key={integration.id}>
          <Header>
            <Type>{integration.integration.type}</Type>
            <ToggleSwitch
              name={`form_integrations[${findIndex(integrations, [
                'id',
                integration.id,
              ])}][enabled]`}
            />
          </Header>
          <Settings>
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
          </Settings>
        </Integration>
      ))}
    </div>
  );
};

export default FormIntegrationList;
