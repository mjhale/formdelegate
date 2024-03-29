import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

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

const Button = React.forwardRef((props, ref) => {
  const { className, variant, ...restProps } = props;

  switch (variant) {
    case 'delete':
      return <DeleteButton className={className} ref={ref} {...restProps} />;
    default:
      return <DefaultButton className={className} ref={ref} {...restProps} />;
  }
});

Button.propTypes = {
  as: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string,
    PropTypes.shape({ render: PropTypes.func.isRequired }),
  ]),
  children: PropTypes.node,
  disabled: PropTypes.bool,
  tabIndex: PropTypes.string,
  type: PropTypes.oneOf(['button', 'reset', 'submit', null]),
  variant: PropTypes.string,
};

Button.defaultProps = {
  type: 'button',
  variant: 'primary',
};

export default Button;
