import HCaptcha from '@hcaptcha/react-hcaptcha';
import React from 'react';
import styled from 'styled-components/macro';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import translations from 'translations';
import { createUser } from 'actions/users';
import { loginUser } from 'actions/sessions';

import Button from 'components/Button';
import Field from 'components/Field/FormikField';
import Flash from 'components/Flash';

const StyledCaptchaWrapper = styled.div`
  margin-bottom: 0.725rem;
`;

const RegisterUser = () => {
  const CAPTCHA_SITE_KEY = process.env.REACT_APP_CAPTCHA_SITE_KEY;
  const captchaRef = React.createRef();
  const dispatch = useDispatch();
  const history = useHistory();
  const registrationErrorMessage = useSelector(
    state => state.users.errorMessage
  );

  const handleRegistrationAndLogin = registrationFields => {
    try {
      dispatch(
        createUser({
          captchaToken: registrationFields.captcha,
          user: registrationFields.user,
        })
      )
        .then(() =>
          dispatch(
            loginUser({
              email: registrationFields.user.email,
              password: registrationFields.user.password,
            })
          )
        )
        .then(() => {
          captchaRef.current && captchaRef.current.resetCaptcha();
          history.push('/dashboard/');
        });
    } catch (error) {
      console.error(`FD registration flow error: ${error}`);
    }
  };

  return (
    <React.Fragment>
      {registrationErrorMessage && (
        <Flash type="error">
          {translations[registrationErrorMessage]
            ? translations[registrationErrorMessage]
            : registrationErrorMessage}
        </Flash>
      )}

      <h2>Create your Form Delegate account</h2>

      <Formik
        initialValues={{
          captcha: '',
          user: {
            email: '',
            name: '',
            password: '',
            password_confirmation: '',
          },
        }}
        onSubmit={handleRegistrationAndLogin}
        validationSchema={Yup.object({
          captcha: Yup.string().required('CAPTCHA validation is required'),
          user: Yup.object({
            email: Yup.string()
              .email('Invalid email address')
              .required('Email is required'),
            name: Yup.string().required('Name is required'),
            password: Yup.string()
              .min(8, 'Password must be at least 8 characters')
              .required('Password is required'),
            password_confirmation: Yup.string()
              .oneOf([Yup.ref('password'), null], 'Passwords must match')
              .required('Password confirmation is required'),
          }),
        })}
      >
        {formProps => (
          <Form>
            <Field
              label="Email"
              name="user.email"
              placeholder="Email"
              type="email"
            />
            <Field
              label="Full Name"
              name="user.name"
              placeholder="Full Name"
              type="text"
            />
            <Field
              label="Password"
              name="user.password"
              placeholder="Password"
              type="password"
            />
            <Field
              label="Confirm password"
              name="user.password_confirmation"
              placeholder="Confirm password"
              type="password"
            />
            <StyledCaptchaWrapper>
              <HCaptcha
                ref={captchaRef}
                sitekey={CAPTCHA_SITE_KEY}
                onVerify={token => formProps.setFieldValue('captcha', token)}
              />
            </StyledCaptchaWrapper>
            <Button
              disabled={
                formProps.isSubmitting ||
                !(formProps.isValid && formProps.dirty)
              }
              type="submit"
            >
              Create Account
            </Button>
          </Form>
        )}
      </Formik>
    </React.Fragment>
  );
};

export default RegisterUser;
