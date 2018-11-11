import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components/macro';
import { Field } from 'redux-form';
import { Link } from 'react-router-dom';

import renderField from 'components/Field';

import Button from 'components/Button';

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

const LoginForm = props => {
  const { onSubmit, pristine, submitting } = props;

  return (
    <React.Fragment>
      <form onSubmit={onSubmit}>
        <Field
          autoComplete="email"
          component={renderField}
          label="Email"
          name="email"
          placeholder="Email"
          tabIndex="0"
          type="text"
        />
        <Field
          autoComplete="current-password"
          component={renderField}
          label="Password"
          name="password"
          placeholder="Password"
          tabIndex="0"
          type="password"
        />
        <LoginButton
          autoComplete="off"
          disabled={submitting | pristine}
          tabIndex="0"
          type="submit"
        >
          Continue
        </LoginButton>
      </form>
      <LoginSecondaryActions>
        Remember me
        <LoginHelp to="/LoginHelp">Need help?</LoginHelp>
      </LoginSecondaryActions>
    </React.Fragment>
  );
};

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export default LoginForm;
