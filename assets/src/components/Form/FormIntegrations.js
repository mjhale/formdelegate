import { animateScroll } from 'react-scroll';
import { FieldArray } from 'formik';
import styled from 'styled-components';

import Button from 'components/Button';
import EmailIntegration from './EmailIntegration';

export const StyledDeleteButton = styled(Button)`
  flex: 0 1 auto;
  font-size: 0.6rem;
  justify-content: center;
  line-height: 16px;
  padding: 2px 8px;
`;

const IntegrationsContainer = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
`;

const FormIntegrations = ({ values }) => {
  return (
    <>
      <FieldArray
        name="email_integrations"
        render={(arrayHelpers) => (
          <IntegrationsContainer>
            <Button
              onClick={(evt) => {
                evt.preventDefault();
                arrayHelpers.push({
                  enabled: false,
                  email_integration_recipients: [{}],
                });
                animateScroll.scrollToBottom();
              }}
              style={{ marginBottom: '1rem' }}
            >
              Add Email Integration To Form
            </Button>
            {values?.email_integrations.length > 0
              ? values.email_integrations.map(
                  (emailIntegration, emailIntegrationIndex) => (
                    <EmailIntegration
                      arrayHelpers={arrayHelpers}
                      emailIntegration={emailIntegration}
                      emailIntegrationIndex={emailIntegrationIndex}
                      key={emailIntegrationIndex}
                    />
                  )
                )
              : null}
          </IntegrationsContainer>
        )}
      />
    </>
  );
};

export default FormIntegrations;
