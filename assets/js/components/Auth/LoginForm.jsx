import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Field } from 'redux-form';
import { Link } from 'react-router-dom';
import Button from 'components/Button';
import Card from 'components/Card';
import renderField from 'components/Field';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  pristine: PropTypes.bool.isRequired,
};

const LoginContainer = styled.div`
  margin: 0 auto;
  max-width: 320px;
  padding: 1rem;
`;

const SignUpLink = styled(Link)`
  float: right;
`;

const LoginForm = props => {
  const { handleSubmit, submitting, pristine } = props;

  return (
    <LoginContainer>
      <Card>
        <form onSubmit={handleSubmit}>
          <Field
            component={renderField}
            name="email"
            label="E-Mail Address"
            type="text"
          />
          <Field
            component={renderField}
            name="password"
            label="Password"
            type="password"
          />
          <Button type="submit" disabled={submitting | pristine}>
            Login
          </Button>
          <SignUpLink to="/register">
            <Button tabIndex="-1">Sign Up</Button>
          </SignUpLink>
        </form>
      </Card>
    </LoginContainer>
  );
};

LoginForm.propTypes = propTypes;

export default LoginForm;
