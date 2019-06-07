import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components/macro';

import theme from 'constants/theme';

const DefaultButton = styled.button`
  background: linear-gradient(
    to bottom,
    ${theme.porcelainGray},
    ${theme.offWhite}
  );
  border: 1px solid ${theme.borderColor};
  border-radius: 3px;
  color: ${theme.mineBlack};
  cursor: pointer;
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 600;
  line-height: 20px;
  padding: 6px 12px;
  text-decoration: none;
  text-transform: uppercase;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;

  &:hover {
    background: linear-gradient(to bottom, #eee 100%, #ddd 100%);
    border-color: #ccc;
  }

  &:disabled {
    background: ${theme.disabledBtnBackgroundColor};
    pointer-events: none;
  }
`;

const DeleteButton = styled(DefaultButton)`
  background: linear-gradient(to bottom, #dd4b39 50%, #b53727 100%);
  border-color: #d73925;
  color: #f5f7ff;

  &:hover {
    background: linear-gradient(to bottom, #b53727 100%, #b53727 100%);
    border-color: #333;
  }
`;

const DisabledButton = styled(DefaultButton)`
  background: ${theme.disabledBtnBackgroundColor};
  pointer-events: none;
`;

const Button = props => {
  const { as, type, variant, ...restProps } = props;
  const Component = as;

  switch (variant) {
    case 'disabled':
      return <DisabledButton as={Component} {...restProps} />;
    case 'delete':
      return <DeleteButton as={Component} {...restProps} />;
    default:
      return <DefaultButton as={Component} {...restProps} />;
  }
};

Button.propTypes = {
  as: PropTypes.element,
  href: PropTypes.string,
  type: PropTypes.oneOf(['button', 'reset', 'submit', null]),
  variant: PropTypes.string,
};

Button.defaultProps = {
  disabled: false,
  type: 'button',
  variant: 'primary',
};

export default Button;
