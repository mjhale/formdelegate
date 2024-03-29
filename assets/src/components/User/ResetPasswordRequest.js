import { VStack } from '@chakra-ui/react';
import * as React from 'react';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';
import { useDispatch } from 'react-redux';

import { userResetPasswordRequest } from 'actions/userResetPassword';

import Field from 'components/Field/FormikField';
import {
  StyledContinueBotton,
  StyledFormWrapper,
  StyledInstructionText,
} from 'pages/reset-password';

const ResetPasswordRequest = () => {
  const dispatch = useDispatch();

  const [formStatus, setFormStatus] = React.useState('');

  const handleResetPasswordRequest = (values) => {
    dispatch(userResetPasswordRequest(values.email));
    setFormStatus('submitted');
  };

  const Submitted = () => {
    if (formStatus !== 'submitted') return null;

    return (
      <StyledInstructionText>
        Got it! Check your email for instructions to reset your password.
      </StyledInstructionText>
    );
  };

  const ResetPasswordForm = () => {
    if (formStatus !== '') return null;

    return (
      <>
        <StyledInstructionText>
          Enter your account's email address and we'll send you a link to reset
          your password.
        </StyledInstructionText>
        <StyledFormWrapper>
          <Formik
            initialValues={{
              email: '',
            }}
            onSubmit={handleResetPasswordRequest}
            validationSchema={Yup.object({
              email: Yup.string().required('Email is required'),
            })}
          >
            {(formProps) => (
              <Form>
                <VStack spacing={2}>
                  <Field
                    type="email"
                    label="Email"
                    name="email"
                    placeholder="Email"
                  />
                  <StyledContinueBotton
                    disabled={!(formProps.isValid && formProps.dirty)}
                    type="submit"
                  >
                    Continue
                  </StyledContinueBotton>
                </VStack>
              </Form>
            )}
          </Formik>
        </StyledFormWrapper>
      </>
    );
  };

  return (
    <>
      <ResetPasswordForm />
      <Submitted />
    </>
  );
};

export default ResetPasswordRequest;
