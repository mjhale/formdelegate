import PropTypes from 'prop-types';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import ExternalLink from 'components/Link/ExternalLink';

const Link = props => {
  const { children, className, href, onPress } = props;

  if (href.includes('http') || href.includes('https')) {
    return <ExternalLink {...props}>{children}</ExternalLink>;
  }

  return (
    <RouterLink className={className} onClick={onPress} to={href}>
      {children}
    </RouterLink>
  );
};

Link.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  href: PropTypes.string,
  onPress: PropTypes.func,
};

export default Link;
