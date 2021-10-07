import { FieldArray } from 'formik';
import * as React from 'react';
import styled from 'styled-components';

import Button from 'components/Button';
import Field from 'components/Field/FormikField';
import { StyledDeleteButton } from 'components/Form/FormIntegrations';

const StyledEmailIntegrationContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  width: 100%;
`;

const EmailRecipientList = ({ emailIntegrationIndex, emailIntegration }) => {
  return (
    <FieldArray
      name={`email_integrations.${emailIntegrationIndex}.email_integration_recipients`}
      render={(recipientArrayHelpers) => (
        <>
          {Array.isArray(emailIntegration.email_integration_recipients) &&
          emailIntegration.email_integration_recipients.length > 0
            ? emailIntegration.email_integration_recipients.map(
                (recipient, recipientIndex) => (
                  <React.Fragment key={recipientIndex}>
                    <StyledEmailIntegrationContainer>
                      <div
                        style={{
                          marginRight: '0.5rem',
                          width: '100%',
                        }}
                      >
                        <Field
                          label="Email Address"
                          name={`email_integrations.${emailIntegrationIndex}.email_integration_recipients.${recipientIndex}.email`}
                          placeholder="Email Address"
                          type="text"
                        />
                      </div>
                      <div
                        style={{
                          marginRight: '0.5rem',
                          width: '75%',
                        }}
                      >
                        <Field
                          label="Recipient Name"
                          name={`email_integrations.${emailIntegrationIndex}.email_integration_recipients.${recipientIndex}.name`}
                          placeholder="Recipient Name"
                          type="text"
                          value={recipient.name ?? ''}
                        />
                      </div>
                      <div
                        style={{
                          marginRight: '0.5rem',
                          width: '40%',
                        }}
                      >
                        <Field
                          as="select"
                          label="Recipient Type"
                          name={`email_integrations.${emailIntegrationIndex}.email_integration_recipients.${recipientIndex}.type`}
                          placeholder="Recipient Type"
                        >
                          <option>Select type</option>
                          <option value="to">To</option>
                          <option value="cc">CC</option>
                          <option value="bcc">BCC</option>
                        </Field>
                      </div>
                      <div
                        style={{
                          marginBottom: '1rem',
                        }}
                      >
                        <StyledDeleteButton
                          onClick={() =>
                            recipientArrayHelpers.remove(recipientIndex)
                          }
                          variant="delete"
                        >
                          Delete
                        </StyledDeleteButton>
                      </div>
                    </StyledEmailIntegrationContainer>
                  </React.Fragment>
                )
              )
            : null}
          <div>
            <Button
              onClick={() =>
                recipientArrayHelpers.push({
                  email: '',
                  name: '',
                  type: '',
                })
              }
            >
              Add Recipient
            </Button>
          </div>
        </>
      )}
    />
  );
};

export default EmailRecipientList;
