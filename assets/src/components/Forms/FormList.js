import React from 'react';
import { Link } from 'react-router-dom';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled from 'styled-components';
import Button from 'components/Button';
import Card from 'components/Card';
import theme from 'constants/theme';

const DeleteButton = styled(Button)`
  float: right;
`;

const FormAddress = styled.div`
  background-color: #4e4d5a;
  border: 1px solid ${theme.mineBlack};
  box-shadow: 0 0 10px #403c3c inset, 0px 0px 0px ${theme.solidWhite};
  color: #e2eaea;
  font-family: ${theme.codeFont};
  font-size: 0.85rem;
  font-weight: 300;
  padding: 1rem;
  text-align: center;
  transition: all 0.25s linear;
  user-select: none;
  word-break: break-all;

  &:hover {
    cursor: hand;
    cursor: pointer;
  }

  &:active {
    box-shadow: 0 0 10px #403c3c inset, 0 0.2rem ${theme.primaryColor};
    transition: all 0s;
  }
`;

const FormActions = styled.div`
  padding-top: 0.5rem;
`;

let FormList = ({ forms, isFetching, onDeleteClick }) => {
  if (isFetching) {
    return null;
  }

  return (
    <div>
      {forms.map(form => (
        <FormSimpleView
          key={form.id}
          form={form}
          onDeleteClick={onDeleteClick}
        />
      ))}
    </div>
  );
};

const FormSimpleView = ({ form, onDeleteClick }) => {
  return (
    <Card header={form.form}>
      <FormAddress>
        <CopyToClipboard
          text={`https://api.formdelegate.com/v1/requests/${form.id}`}
        >
          <span>{`https://api.formdelegate.com/v1/requests/${form.id}`}</span>
        </CopyToClipboard>
      </FormAddress>
      <FormActions>
        <Link to={`/forms/${form.id}/edit`}>
          <Button tabIndex="-1">Edit Form</Button>
        </Link>
        <DeleteButton
          type="delete"
          onClick={evt => onDeleteClick(form.id, evt)}
        >
          Delete Form
        </DeleteButton>
      </FormActions>
    </Card>
  );
};

export default FormList;
