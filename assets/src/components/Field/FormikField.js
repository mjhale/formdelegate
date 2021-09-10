import React from 'react';
import styled, { css } from 'styled-components';
import { useField } from 'formik';

import theme from 'constants/theme';

const inputStyle = css`
  background-clip: padding-box;
  border: 1px ${theme.ghostGray} solid;
  border-radius: 4px;
  box-sizing: border-box;
  display: block;
  font-weight: bold;
  padding: ${(props) =>
    props.showFloatingLabel ? '1.3rem 0.75rem 0.4rem' : '0.85rem 0.75rem'};
  transition: all 0.25s ease-out;
  width: 100%;
  word-break: normal;

  &::placeholder {
    color: ${theme.mineBlack};
    font-weight: normal;
  }

  &:focus {
    border: 1px ${theme.lightCarnation} solid;
    box-shadow: 0 0 0 1px ${theme.lightCarnation};
    outline: none;
  }
`;

const StyledField = styled.div`
  padding: 0.1rem 0 0 0;
  width: 100%;
`;

const StyledFieldMessage = styled.p`
  display: block;
  margin: 0.4rem 0 0;
  line-height: 1.15rem;
`;

export const StyledFieldError = styled(StyledFieldMessage)`
  color: ${theme.darkCarnation};
`;

const StyledFieldWarning = styled(StyledFieldMessage)`
  color: ${theme.lightCarnation};
`;

const StyledInput = styled.input`
  ${inputStyle};
`;

const StyledInputWrapper = styled.div`
  font-size: 0.9rem;
  position: relative;
`;

const StyledFloatingLabel = styled.label`
  box-sizing: border-box;
  color: ${theme.mineBlack};
  display: block;
  font-size: 0.75rem;
  font-weight: normal;
  margin: 0.35rem 0 0 0.075rem;
  opacity: ${(props) => (props.showFloatingLabel ? 1 : 0)};
  overflow: hidden;
  padding: 0 0.75rem;
  pointer-events: none;
  position: absolute;
  text-overflow: ellipsis;
  top: 0;
  transform: translateY(2px);
  transition: all 0.25s ease-out;
  user-select: none;
  white-space: nowrap;
  width: 100%;
  z-index: 1;
`;

const StyledTextarea = styled.textarea`
  ${inputStyle} height: 200px;
`;

const Field = ({ disabled, label, placeholder, type, ...props }) => {
  const [field, meta] = useField(props);

  /**
   * @TODO: Include `OR (active && visited)` evaluation in order to prevent placeholder
   * returning before the input's blur trigger.
   */
  const showFloatingLabel =
    (meta.touched && meta.value) || (!meta.touched && meta.value !== '');

  const displayError = meta.error && (
    <StyledFieldError>{meta.error}</StyledFieldError>
  );
  const displayWarning = meta.warning && (
    <StyledFieldWarning>{meta.warning}</StyledFieldWarning>
  );

  // Input and textarea types
  const inputType = (
    <StyledInput
      {...field}
      disabled={disabled}
      placeholder={placeholder}
      showFloatingLabel={showFloatingLabel}
      type={type}
      {...props}
    />
  );

  const textareaType = (
    <StyledTextarea
      {...field}
      disabled={disabled}
      placeholder={placeholder}
      showFloatingLabel={showFloatingLabel}
      {...props}
    />
  );

  return (
    <StyledField>
      <StyledInputWrapper>
        <StyledFloatingLabel
          htmlFor={props.id || props.name}
          showFloatingLabel={showFloatingLabel}
        >
          {label}
        </StyledFloatingLabel>
        <React.Fragment>
          {type === 'textarea' ? textareaType : inputType}
          {meta.touched && (displayError || displayWarning)}
        </React.Fragment>
      </StyledInputWrapper>
    </StyledField>
  );
};

export default Field;
