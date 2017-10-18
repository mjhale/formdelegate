import React from 'react';
import PropTypes from 'prop-types';

const defaultProps = {
  message: 'There was an unknown error, please try again.',
  type: 'error',
};

const propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

const Error = ({ message, type }) => {
  return <div className={`flash-${type}`}>{message}</div>;
};

Error.defaultProps = defaultProps;
Error.propTypes = propTypes;

export default Error;
