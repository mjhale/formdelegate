import PropTypes from 'prop-types';
import React from 'react';
import styled, { css } from 'styled-components';

import theme from 'constants/theme';

const ToggleButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: block;
  height: 60px;
  outline: 0;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const ToggleIcon = styled.span`
  &,
  &::after,
  &::before {
    background-color: #fff;
    content: ' ';
    cursor: pointer;
    display: block;
    height: 2px;
    left: 15px;
    opacity: 1;
    position: absolute;
    top: 28px;
    width: 20px;
  }

  &::after {
    left: 0;
    top: 6px;
  }

  &::before {
    left: 0;
    top: -6px;
  }
`;

const ToggleTextStyles = css`
  color: ${theme.offWhite};
  font-size: 0.9rem;
  letter-spacing: 1px;
  line-height: 1;
  text-transform: uppercase;
`;

const ToggleTextClose = styled.span`
  left: 42px;
  opacity: 1;
  position: absolute;
  top: 22px;

  ${ToggleTextStyles};
`;

const ToggleTextMenu = styled.span`
  left: 45px;
  opacity: 1;
  position: absolute;
  top: 22px;

  ${ToggleTextStyles};
`;

const ToggleTextWrapper = styled.span`
  height: 60px;
  position: absolute;
  right: 0;
  top: 0;
  width: 105px;
`;

const ToggleWrapper = styled.div`
  height: 60px;
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
`;

const NavToggle = ({ handleNavTaggle, isNavVisible, isSmallDevice }) => {
  if (!isSmallDevice) return null;

  const toggleText = !isNavVisible ? (
    <ToggleTextMenu>Menu</ToggleTextMenu>
  ) : (
    <ToggleTextClose>Close</ToggleTextClose>
  );

  return (
    <ToggleWrapper>
      <ToggleButton onClick={handleNavTaggle}>
        <ToggleTextWrapper>
          <ToggleIcon />
          {toggleText}
        </ToggleTextWrapper>
      </ToggleButton>
    </ToggleWrapper>
  );
};

NavToggle.propTypes = {
  handleNavTaggle: PropTypes.func.isRequired,
  isNavVisible: PropTypes.bool.isRequired,
  isSmallDevice: PropTypes.bool.isRequired,
};

export default NavToggle;
