import { clearFix } from 'polished';
import * as React from 'react';
import styled from 'styled-components';

import theme from 'constants/theme';

import EmailRecipientList from 'components/Form/EmailRecipientList';
import ToggleSwitch from 'components/ToggleSwitch';
import { StyledDeleteButton } from 'components/Form/FormIntegrations';

const StyledHeader = styled.div`
  align-items: center;
  background-color: ${theme.backgroundColor};
  display: flex;
  justify-content: space-between;
  font-family: ${theme.systemFont};
  font-size: 0.9rem;
  padding: 0.2rem 0.5rem;
`;

const StyledIntegrationContainer = styled.li`
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

const EmailIntegration = ({
  arrayHelpers,
  emailIntegration,
  emailIntegrationIndex,
}) => {
  return (
    <StyledIntegrationContainer>
      <StyledHeader>
        <TypeHeader>Email Integration</TypeHeader>
        <ToggleContainer>
          <ToggleSwitch
            name={`email_integrations.${emailIntegrationIndex}.enabled]`}
          />
        </ToggleContainer>
        <StyledDeleteButton
          onClick={(evt) => {
            evt.preventDefault();
            let confirm = window.confirm(
              'Are you positive you want to remove this email integration?'
            );
            if (confirm) {
              arrayHelpers.remove(emailIntegrationIndex);
            }
          }}
          variant="delete"
        >
          x
        </StyledDeleteButton>
      </StyledHeader>
      <Settings>
        <h2>Recipients</h2>
        <EmailRecipientList
          emailIntegration={emailIntegration}
          emailIntegrationIndex={emailIntegrationIndex}
        />
      </Settings>
    </StyledIntegrationContainer>
  );
};

export default EmailIntegration;
