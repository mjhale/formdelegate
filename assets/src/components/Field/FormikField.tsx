import type { FieldInputProps } from 'formik';

import styled from 'styled-components';
import { useField } from 'formik';

import theme from 'constants/theme';

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
} from '@chakra-ui/react';

const StyledField = styled.div`
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

type Props = {
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  type?: string;
  name: string;
};

const Field = ({
  disabled,
  label,
  placeholder,
  type,
  name,
  ...fieldProps
}: Props) => {
  const [field, meta] = useField({
    name,
    ...fieldProps,
  });

  const displayError =
    meta.error && meta.touched ? (
      <FormErrorMessage>{meta.error}</FormErrorMessage>
    ) : null;

  const inputType = (
    <Input
      {...field}
      disabled={disabled}
      placeholder={placeholder}
      type={type}
    />
  );

  const textareaType = (
    <Textarea {...field} disabled={disabled} placeholder={placeholder} />
  );

  return (
    <StyledField>
      <FormControl id={name} isInvalid={meta.error && meta.touched}>
        {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
        {type === 'textarea' ? textareaType : inputType}
        {displayError}
      </FormControl>
    </StyledField>
  );
};

export default Field;
