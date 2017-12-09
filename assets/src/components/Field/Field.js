import React from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  font-size: 0.8rem;
  margin-bottom: 1rem;
`;

const InputError = styled.span`
  font-style: italic;
`;

export const renderInputField = ({
  input,
  label,
  meta: { touched, error },
  placeholder,
  type,
}) => (
  <InputContainer>
    <label>{label}</label>
    <div>
      <input {...input} placeholder={placeholder} type={type} />

      {touched && error && <InputError>{error}</InputError>}
    </div>
  </InputContainer>
);

export default renderInputField;
