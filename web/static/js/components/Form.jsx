import React, { PropTypes } from 'react';
import { Field } from 'redux-form';
import { last } from 'lodash';
import FormIntegrationList from '../components/FormIntegrationList';
import NewIntegrations from '../components/NewIntegrations';

const FormEdit = (props) => {
  const { form, handleSubmit, newIntegrationFields, lastFormIntegrationId, integrationTypes, submitting, pristine, reset } = props;

  if (!form) return null;

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="header">
        <div className="verified">
          {(form.verified) ? 'Verified' : 'Unverified'}
        </div>
        {form.form}
      </div>
      <div className="card">
        <div>
          <label>Form Name</label>
          <Field
            name="form"
            component="input"
            type="text"
          />
        </div>
        <div>
          <label>Form ID</label>
          <Field
            name="id"
            component="input"
            type="text"
            disabled
          />
        </div>
        <div>
          <label>Number of Messages</label>
          <Field
            name="message_count"
            component="input"
            type="text"
            disabled
          />
        </div>
        <FormIntegrationList integrations={form.form_integrations} />
        <NewIntegrations
          newIntegrationFields={newIntegrationFields}
          integrationTypes={integrationTypes}
          lastFormIntegrationId={lastFormIntegrationId}
        />
      </div>
      <div>
        <button type="submit" className="btn" disabled={submitting}>Save Form</button>
      </div>
    </form>
  );
};

export default FormEdit;
