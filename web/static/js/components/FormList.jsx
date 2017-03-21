import React from 'react';
import { Link } from 'react-router';
import CopyToClipboard from 'react-copy-to-clipboard';

let FormList = ({ forms, isFetching }) => {
  if (isFetching) {
    return null;
  }

  return (
    <div className="form-list">
      {forms.map((form) => (
        <FormSimpleView key={form.id} form={form} />
      ))}
    </div>
  );
};

const FormSimpleView = ({ form }) => {
  return (
    <div className="form">
      <div className="header">
        <span className="form-name">{form.form}</span>
      </div>

      <div className="card">
        <CopyToClipboard
          text={`https://www.formdelegate.com/api/requests/${form.id}`}
        >
          <div className="address tooltip-item">
            https://www.formdelegate.com/api/requests/{form.id}
            <div className="tooltip">
              Copy to Clipboard
            </div>
          </div>
        </CopyToClipboard>
        <div className="actions">
          <Link to={`/forms/${form.id}/edit`} className="btn">Edit Form</Link>
          <Link to={``} className="btn delete">Delete Form</Link>
        </div>
      </div>
    </div>
  );
};

export default FormList;
