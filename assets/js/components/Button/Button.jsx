import React from 'react';
import styled from 'styled-components';
import theme from 'constants/theme';

let DefaultButton = styled.button`
  background: linear-gradient(
    to bottom,
    ${theme.porcelainGray},
    ${theme.offWhite}
  );
  border: 1px solid ${theme.borderColor};
  border-radius: 3px;
  color: ${theme.mineBlack};
  display: inline-block;
  cursor: pointer;
  font-size: 0.65rem;
  font-weight: 600;
  line-height: 20px;
  padding: 6px 12px;
  text-decoration: none;
  text-transform: uppercase;
  white-space: nowrap;
  vertical-align: middle;
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-user-select: none;
  user-select: none;

  &:hover {
    background: linear-gradient(to bottom, #eee 100%, #ddd 100%);
    border-color: #ccc;
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    background: ${theme.disabledBtnBackgroundColor};
    pointer-events: none;
  }
`;

const DeleteButton = DefaultButton.extend`
  background: linear-gradient(to bottom, #dd4b39 50%, #b53727 100%);
  border-color: #d73925;
  color: #f5f7ff;
  float: right;

  &:hover {
    background: linear-gradient(to bottom, #b53727 100%, #b53727 100%);
    border-color: #333;
  }
`;

const Button = props => {
  const { type, ...restProps } = props;

  switch (type) {
    case 'delete':
      return <DeleteButton {...restProps} />;
    default:
      return <DefaultButton {...restProps} />;
  }
};

export default Button;