import React from 'react';
import { Link } from 'react-router-dom';
import CopyToClipboard from 'react-copy-to-clipboard';

let FormList = ({ forms, isFetching, onDeleteClick }) => {
  if (isFetching) {
    return null;
  }

  return (
    <div className="form-list">
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
    <div className="form">
      <div className="card-header">
        <span className="form-name">{form.form}</span>
      </div>
      <div className="card">
        <CopyToClipboard
          text={`https://www.formdelegate.com/api/requests/${form.id}`}
        >
          <div className="address tooltip-item">
            https://www.formdelegate.com/api/requests/{form.id}
            <div className="tooltip">Copy to Clipboard</div>
          </div>
        </CopyToClipboard>
        <div className="actions">
          <Link to={`/forms/${form.id}/edit`} className="btn">
            Edit Form
          </Link>
          <a
            className="btn delete"
            data-confirm="Are you positive you want to delete this Gist?"
            onClick={evt => onDeleteClick(form.id, evt)}
          >
            Delete Form
          </a>
        </div>
      </div>
    </div>
  );
};

export default FormList;
