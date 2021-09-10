import CopyToClipboard from 'react-copy-to-clipboard';
import React from 'react';
import styled from 'styled-components';

import theme from 'constants/theme';

import Button from 'components/Button';
import Card from 'components/Card';
import Link from 'components/Link';

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
  display: flex;
  justify-content: space-between;
  padding-top: 0.5rem;
`;

const FormActionButton = styled((props) => <Button as={Link} {...props} />)`
  margin-right: 0.5rem;
`;

const FormActionGroup = styled.div`
  align-self: flex-start;
`;

const FormActionDelete = styled.div`
  align-self: flex-end;
`;

let FormList = ({ forms, isFetching, onDeleteClick }) => {
  if (isFetching) {
    return null;
  }

  return (
    <React.Fragment>
      {forms.map((form) => (
        <FormSimpleView
          key={form.id}
          form={form}
          onDeleteClick={onDeleteClick}
        />
      ))}
    </React.Fragment>
  );
};

const FormSimpleView = ({ form, onDeleteClick }) => {
  return (
    <Card header={form.name}>
      <FormAddress>
        <CopyToClipboard
          text={`https://api.formdelegate.com/v1/submissions/${form.id}`}
        >
          <span>{`https://api.formdelegate.com/v1/submissions/${form.id}`}</span>
        </CopyToClipboard>
      </FormAddress>
      <FormActions>
        <FormActionGroup>
          <FormActionButton href={`/forms/${form.id}/edit`}>
            Edit Form
          </FormActionButton>
          <FormActionButton href={`/forms/${form.id}/submissions`}>
            View Submissions
          </FormActionButton>
        </FormActionGroup>
        <FormActionDelete>
          <Button
            onClick={(evt) => onDeleteClick(form.id, evt)}
            variant="delete"
          >
            Delete Form
          </Button>
        </FormActionDelete>
      </FormActions>
    </Card>
  );
};

export default FormList;
