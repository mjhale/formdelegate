import { VStack } from '@chakra-ui/react';
import * as React from 'react';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';

import { userResetPasswordTokenVerify } from 'actions/userResetPassword';

import Field from 'components/Field/FormikField';
import {
  StyledContinueBotton,
  StyledFormWrapper,
  StyledInstructionText,
  StyledPrimaryLink,
} from 'pages/reset-password';
import { useAppDispatch, useAppSelector } from 'hooks/useRedux';

const ResetPasswordForm = ({ token }) => {
  const dispatch = useAppDispatch();

  const [hasSubmitted, setHasSubmitted] = React.useState(false);
  const errorMessage = useAppSelector(
    (state) => state.userResetPassword.errorMessage
  );
  const isFetching = useAppSelector(
    (state) => state.userResetPassword.isFetching
  );

  const handleResetPassword = (values) => {
    setHasSubmitted(true);

    dispatch(
      userResetPasswordTokenVerify({
        password: values.password,
        token: token,
      })
    );
  };

  if (!token) {
    return null;
  }

  if (isFetching) {
    return <StyledInstructionText>Processing...</StyledInstructionText>;
  }

  if (errorMessage) {
    if (errorMessage === 'INVALID_OR_EXPIRED_CONFIRMATION_TOKEN') {
      return (
        <>
          <StyledInstructionText>
            <span>Sorry, your reset password link has expired. </span>
            <StyledPrimaryLink href="/reset-password">
              Request a new link
            </StyledPrimaryLink>
          </StyledInstructionText>
        </>
      );
    }

    return (
      <StyledInstructionText>
        <span>Sorry, we were unable to reset your password. </span>
        <StyledPrimaryLink href="/reset-password">
          Request a new link
        </StyledPrimaryLink>
      </StyledInstructionText>
    );
  }

  if (hasSubmitted && !isFetching && !errorMessage) {
    return (
      <StyledInstructionText>
        <span>You've successfully changed your password. </span>
        <StyledPrimaryLink href="/login">
          Log in to your account
        </StyledPrimaryLink>
      </StyledInstructionText>
    );
  }

  return (
    <>
      <StyledInstructionText>Reset your account password</StyledInstructionText>
      <StyledFormWrapper>
        <Formik
          initialValues={{
            password: '',
            password_confirmation: '',
          }}
          onSubmit={handleResetPassword}
          validationSchema={Yup.object({
            password: Yup.string().required('Password is required'),
            password_confirmation: Yup.string()
              .oneOf([Yup.ref('password'), null], 'Passwords must match')
              .required('Password confirmation is required'),
          })}
        >
          {(formProps) => (
            <Form>
              <VStack spacing={2}>
                <Field
                  type="password"
                  label="New Password"
                  name="password"
                  placeholder="New password"
                />
                <Field
                  type="password"
                  label="Confirm your password"
                  name="password_confirmation"
                  placeholder="Confirm your password"
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

export default ResetPasswordForm;
