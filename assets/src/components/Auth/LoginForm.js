import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';

import Button from 'components/Button';
import Field from 'components/Field/FormikField';
import Link from 'components/Link';

const LoginButton = styled(Button)`
  font-size: 1.166em;
  line-height: 1em;
  min-width: 100px;
  padding: 10px 20px;
  text-align: center;
  width: 100%;
`;

const LoginHelp = styled(Link)`
  justify-content: flex-end;
`;

const LoginSecondaryActions = styled.div`
  display: flex;
  font-size: 0.8rem;
  font-weight: bold;
  justify-content: space-between;
  margin: 0.75rem 0 0;
`;

const LoginForm = (props) => {
  return (
    <>
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        onSubmit={props.handleLogin}
        validationSchema={Yup.object({
          email: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),
          password: Yup.string().required('Password is required'),
        })}
      >
        {(formProps) => (
          <Form>
            <Field
              autoComplete="email"
              label="Email"
              name="email"
              placeholder="Email"
              tabIndex="0"
              type="email"
            />
            <Field
              autoComplete="current-password"
              label="Password"
              name="password"
              placeholder="Password"
              tabIndex="0"
              type="password"
            />
            <LoginButton
              autoComplete="off"
              disabled={formProps.isSubmitting}
              tabIndex="0"
              type="submit"
            >
              Continue
            </LoginButton>
          </Form>
        )}
      </Formik>

      <LoginSecondaryActions>
        <span></span>
        <LoginHelp href="/reset-password">Need help?</LoginHelp>
      </LoginSecondaryActions>
    </>
  );
};

LoginForm.propTypes = {
  handleLogin: PropTypes.func.isRequired,
};

export default LoginForm;
