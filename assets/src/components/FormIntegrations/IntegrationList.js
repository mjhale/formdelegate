import React from 'react';
import styled from 'styled-components/macro';
import { animateScroll } from 'react-scroll';
import { clearFix } from 'polished';
import { Field, FieldArray } from 'redux-form';

import renderField from 'components/Field';
import theme from 'constants/theme';

import Button from 'components/Button';
import ToggleSwitch from 'components/ToggleSwitch';

const Delete = styled(Button)`
  flex: 0 1 auto;
  font-size: 0.6rem;
  justify-content: center;
  line-height: 16px;
  padding: 2px 8px;
`;

const Header = styled.div`
  align-items: center;
  background-color: ${theme.backgroundColor};
  display: flex;
  justify-content: space-between;
  font-family: ${theme.systemFont};
  font-size: 0.9rem;
  padding: 0.2rem 0.5rem;
`;

const Integration = styled.li`
  background-color: #fafafa;
  border: 2px solid ${theme.borderColor};
  font-size: 0.8rem;
  line-height: 1rem;
  text-transform: uppercase;

  &:not(:last-child) {
    margin-bottom: 0.5rem;
  }
`;

const Settings = styled.div`
  padding: 0.5rem;

  ${clearFix()};
`;

const IntegrationsContainer = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
`;

const TypeHeader = styled.div`
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: center;
`;

const ToggleContainer = styled.div`
  justify-content: center;
  flex: 0 1 auto;
  margin: 0.15rem 0.5rem 0 0.5rem;
`;

const IntegrationType = ({
  formIntegration,
  formIntegrationId,
  integrationTypes,
}) => {
  if (formIntegration && formIntegration.integration) {
    return <TypeHeader>{formIntegration.integration.type}</TypeHeader>;
  } else {
    return (
      <TypeHeader>
        <Field component="select" name={`${formIntegrationId}[integration_id]`}>
          <option />
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
        </Field>
      </TypeHeader>
    );
  }
};

const renderIntegrations = ({
  fields,
  integrationTypes,
  removeIntegration,
}) => {
  return (
    <IntegrationsContainer>
      {fields.map((integration, index) => {
        return (
          <Integration key={index}>
            <Header>
              <IntegrationType
                fields={fields}
                formIntegration={fields.get(index)}
                formIntegrationId={integration}
                integrationTypes={integrationTypes}
              />
              <ToggleContainer>
                <ToggleSwitch name={`${integration}[enabled]`} />
              </ToggleContainer>
              <Delete
                onClick={evt => {
                  evt.preventDefault();
                  let confirm = window.confirm(
                    'Are you positive you want to remove this integration?'
                  );
                  if (confirm) {
                    removeIntegration(integration);
                    fields.remove(index);
                  }
                }}
                variant="delete"
              >
                x
              </Delete>
            </Header>
            <Settings>
              <Field
                component={renderField}
                label="API Key"
                name={`${integration}[settings][api_key]`}
                placeholder="API Key"
                type="text"
              />
              <Field
                component={renderField}
                label="Email"
                name={`${integration}[settings][email]`}
                placeholder="Email"
                type="text"
              />
            </Settings>
          </Integration>
        );
      })}

      <Button
        onClick={evt => {
          evt.preventDefault();
          fields.push();
          animateScroll.scrollToBottom();
        }}
      >
        Add Integration To Form
      </Button>
    </IntegrationsContainer>
  );
};

const FormIntegrationList = ({
  integrations,
  integrationTypes,
  removeIntegration,
}) => {
  return (
    <React.Fragment>
      <h2>Integrations</h2>
      <FieldArray
        name="form_integrations"
        component={renderIntegrations}
        integrations={integrations}
        integrationTypes={integrationTypes}
        removeIntegration={removeIntegration}
      />
    </React.Fragment>
  );
};

export default FormIntegrationList;
