import PropTypes from 'prop-types';
import React from 'react';
import styled, { css } from 'styled-components/macro';

import theme from 'constants/theme';

const inputStyle = css`
  background-clip: padding-box;
  border: 1px ${theme.ghostGray} solid;
  border-radius: 4px;
  box-sizing: border-box;
  display: block;
  font-weight: bold;
  padding: ${props =>
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

const Field = styled.div`
  padding: 0.1rem 0 0 0;
  width: 100%;
`;

const FieldMessage = styled.p`
  display: block;
  margin: 0.4rem 0 0;
  line-height: 1.15rem;
`;

const FieldError = styled(FieldMessage)`
  color: ${theme.darkCarnation};
`;

const FieldWarning = styled(FieldMessage)`
  color: ${theme.lightCarnation};
`;

const Input = styled.input`
  ${inputStyle};
`;

const InputWrapper = styled.div`
  font-size: 0.9rem;
  margin-bottom: 1rem;
  position: relative;
`;

const FloatingLabel = styled.label`
  box-sizing: border-box;
  color: ${theme.mineBlack};
  display: block;
  font-size: 0.75rem;
  font-weight: normal;
  margin: 0.35rem 0 0 0.075rem;
  opacity: ${props => (props.showFloatingLabel ? 1 : 0)};
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

const Textarea = styled.textarea`
  ${inputStyle} height: 200px;
`;

class InputField extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    input: PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
    label: PropTypes.string,
    meta: PropTypes.shape({
      error: PropTypes.string,
      touched: PropTypes.bool,
      warning: PropTypes.string,
    }).isRequired,
    placeholder: PropTypes.string,
    type: PropTypes.string,
  };

  render() {
    const {
      disabled,
      input,
      label,
      meta: { error, touched, warning },
      placeholder,
      type,
    } = this.props;

    const displayError = error && <FieldError>{error}</FieldError>;
    const displayWarning = warning && <FieldWarning>{warning}</FieldWarning>;

    /**
     * @TODO: Include `OR (active && visited)` evaluation in order to prevent placeholder
     * returning before the input's blur trigger.
     */
    const showFloatingLabel =
      (touched && input.value) || (!touched && input.value);

    // Input and textarea types
    const inputType = (
      <Input
        {...input}
        disabled={disabled}
        placeholder={placeholder}
        showFloatingLabel={showFloatingLabel}
        type={type}
      />
    );
    const textareaType = (
      <Textarea
        {...input}
        disabled={disabled}
        placeholder={placeholder}
        showFloatingLabel={showFloatingLabel}
      />
    );

    return (
      <Field>
        <InputWrapper>
          <FloatingLabel
            htmlFor={input.name}
            showFloatingLabel={showFloatingLabel}
          >
            {label}
          </FloatingLabel>
          <React.Fragment>
            {type === 'textarea' ? textareaType : inputType}
            {touched && (displayError || displayWarning)}
          </React.Fragment>
        </InputWrapper>
      </Field>
    );
  }
}

export default InputField;
