import React from 'react';
import { string } from 'prop-types';

const defaultProps = {
  message: 'There was an unknown error, please try again.',
  type: 'error',
};

const propTypes = {
  message: string.isRequired,
  type: string.isRequired,
};

const Error = ({ message, type }) => {
  return <div className={`flash-${type}`}>{message}</div>;
};

Error.defaultProps = defaultProps;
Error.propTypes = propTypes;

export default Error;
