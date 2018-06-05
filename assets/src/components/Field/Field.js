import React from 'react';
import styled from 'styled-components';

import theme from 'constants/theme';

const Error = styled.span`
  color: ${theme.lightCarnation};
  font-style: italic;
`;

const FieldContainer = styled.div`
  font-size: 0.8rem;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 25rem;
`;

const Textarea = styled.textarea`
  height: 5rem;
  width: 25rem;
`;

export const renderInputField = ({
  input,
  label,
  meta: { touched, error },
  placeholder,
  type,
}) => {
  const inputType = <Input {...input} placeholder={placeholder} type={type} />;
  const textareaType = <Textarea {...input} />;

  return (
    <FieldContainer>
      <label>{label}</label>
      <div>
        {type !== 'textarea' ? inputType : textareaType}
        {touched && error && <Error>{error}</Error>}
      </div>
    </FieldContainer>
  );
};

export default renderInputField;
