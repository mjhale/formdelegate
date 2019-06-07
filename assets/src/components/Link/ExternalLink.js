import PropTypes from 'prop-types';
import React from 'react';

const ExternalLink = props => {
  const { children, className, href, onPress, openInNewWindow } = props;

  return (
    <a
      className={className}
      href={href}
      onClick={onPress}
      target={openInNewWindow ? '_blank' : null}
      rel={openInNewWindow ? 'noopener noreferrer' : null}
    >
      {children}
    </a>
  );
};

ExternalLink.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  href: PropTypes.string,
  onPress: PropTypes.func,
  openInNewWindow: PropTypes.bool,
};

ExternalLink.defaultProps = {
  openInNewWindow: false,
};

export default ExternalLink;
