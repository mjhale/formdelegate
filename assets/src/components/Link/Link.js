import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components/macro';
import { Link as RouterLink } from 'react-router-dom';

import ExternalLink from 'components/Link/ExternalLink';

const UnstyledLink = styled(Link)`
  background-color: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  font-style: inherit;
  font-weight: inherit;
  margin: 0;
  padding: 0;
  text-align: inherit;
  text-decoration: none;
  outline: none;
`;

function Link(props) {
  const { children, className, href, onPress } = props;

  if (href.includes('http') || href.includes('https')) {
    return (
      <ExternalLink className={className} {...props}>
        {children}
      </ExternalLink>
    );
  }

  return (
    <RouterLink className={className} onClick={onPress} to={href}>
      {children}
    </RouterLink>
  );
}

Link.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  href: PropTypes.string,
  onPress: PropTypes.func,
};

export default UnstyledLink;
