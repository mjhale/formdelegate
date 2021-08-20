import React from 'react';
import styled from 'styled-components/macro';
import { Field } from 'formik';

const SwitchContainer = styled.span`
  --action-color: #477dca;
  --base-background-color: #fff;
  --switch-width: 40px;
  --switch-padding: 2px;
  --switch-height: 22px;
  --switch-radius: var(--switch-height);
  --knob-size: 18px;
  --knob-radius: 18px;
  --knob-width: var(--knob-size);
  --switch-background: var(--base-background-color);
  --switch-border-background: #e8e8e8;
  --switch-shadow: 0 2px 5px rgba(0, 0, 0, 0.6);
`;

const SwitchLabel = styled.label`
  border-radius: var(--switch-radius);
  cursor: pointer;
  display: inline-block;
  height: var(--switch-height);
  position: relative;
  width: var(--switch-width);
`;

const CheckboxInput = styled(Field)`
  display: none;

  &:checked + div {
    background: var(--action-color);

    &::before {
      transform: scale(0);
    }

    &::after {
      left: 20px;
    }
  }
`;

const Checkbox = styled.div`
  background: var(--switch-border-background);
  border: 0;
  border-radius: var(--switch-radius);
  cursor: pointer;
  height: var(--switch-height);
  margin: 0;
  padding: 0;
  position: relative;
  transition: all 0.3s ease;
  width: var(--switch-width);
  z-index: 0;

  &::before {
    background: var(--switch-background);
    border-radius: var(--switch-radius);
    content: '';
    height: var(--knob-radius);
    left: 2px;
    position: absolute;
    top: 2px;
    transform: scale(1);
    transition: all 0.3s ease;
    width: 36px;
    z-index: 1;
  }

  &::after {
    background: var(--switch-background);
    border-radius: var(--knob-radius);
    box-shadow: var(--switch-shadow);
    content: '';
    height: var(--knob-size);
    left: 2px;
    position: absolute;
    top: 2px;
    transition: all 0.3s ease;
    width: var(--knob-size);
    z-index: 2;
  }
`;

const ToggleSwitch = props => (
  <SwitchContainer>
    <SwitchLabel>
      <CheckboxInput {...props} component="input" type="checkbox" />
      <Checkbox />
    </SwitchLabel>
  </SwitchContainer>
);

export default ToggleSwitch;
