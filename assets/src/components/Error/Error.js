import React from 'react';
import { string } from 'prop-types';
import Flash from 'components/Flash';

const defaultProps = {
  message: 'There was an unknown error, please try again.',
};

const propTypes = {
  message: string.isRequired,
};

const Error = ({ message }) => {
  return <Flash type="error">{message}</Flash>;
};

Error.defaultProps = defaultProps;
Error.propTypes = propTypes;

export default Error;
