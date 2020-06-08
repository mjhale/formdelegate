import React, { useState } from 'react';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';
import { useDispatch, useSelector } from 'react-redux';

import { userResetPasswordTokenVerify } from 'actions/userResetPassword';

import Field from 'components/Field/FormikField';
import {
  StyledContinueBotton,
  StyledFormWrapper,
  StyledInstructionText,
  StyledPrimaryLink,
} from 'components/User/ForgotPassword';

const ResetPasswordForm = ({ token }) => {
  const dispatch = useDispatch();

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const errorMessage = useSelector(
    state => state.userResetPassword.errorMessage
  );
  const isFetching = useSelector(state => state.userResetPassword.isFetching);

  const handleResetPassword = values => {
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
            <StyledPrimaryLink href="/reset">
              Request a new link
            </StyledPrimaryLink>
          </StyledInstructionText>
        </>
      );
    }

    return (
      <StyledInstructionText>
        <span>Sorry, we were unable to reset your password. </span>
        <StyledPrimaryLink href="/reset">Request a new link</StyledPrimaryLink>
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
          {formProps => (
            <Form>
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
            </Form>
          )}
        </Formik>
      </StyledFormWrapper>
    </>
  );
};

export default ResetPasswordForm;
