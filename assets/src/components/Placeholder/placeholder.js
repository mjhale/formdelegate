import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro';
import theme from 'constants/theme';

const PlaceholderRow = styled.div`
  background-color: ${theme.navTextColor};
  height: 0.75rem;
  margin: 1.5rem 1rem;
  width: 50%;
`;

const Placeholder = ({ children, isFetching, rows, type }) => {
  if (isFetching) {
    let placeholders = [];

    for (let i = 0; i < rows; i++) {
      placeholders.push(<PlaceholderRow key={i} />);
    }

    return <div>{placeholders}</div>;
  } else {
    return children;
  }
};

Placeholder.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  rows: PropTypes.number,
  type: PropTypes.oneOf(['text', 'image']),
};

Placeholder.defaultProps = {
  isFetching: true,
  rows: 1,
  type: 'text',
};

export default Placeholder;
