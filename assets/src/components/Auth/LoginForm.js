import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { Field } from 'redux-form';
import { Link } from 'react-router-dom';

import Button from 'components/Button';
import Card from 'components/Card';
import renderField from 'components/Field';

const LoginContainer = styled.div`
  margin: 0 auto;
  max-width: 320px;
  padding: 1rem;
`;

const LoginButton = styled(Button)`
  float: right;
`;

const LoginForm = props => {
  const { onSubmit, pristine, submitting } = props;

  return (
    <LoginContainer>
      <Card>
        <form onSubmit={onSubmit}>
          <Field
            component={renderField}
            label="Email"
            name="email"
            placeholder="Email"
            type="text"
          />
          <Field
            component={renderField}
            label="Password"
            name="password"
            placeholder="Password"
            type="password"
          />
          <LoginButton type="submit" disabled={submitting | pristine}>
            Login
          </LoginButton>
        </form>
      </Card>
    </LoginContainer>
  );
};

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export default LoginForm;
