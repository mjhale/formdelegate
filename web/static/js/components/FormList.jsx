import React from 'react';
import FormIntegrationList from './FormIntegrationList';

export const FormList = ({ forms, isFetching }) => {
  if (isFetching) {
    return (
      <p>Loading forms...</p>
    );
  }

  return (
    <div className="forms-list">
      {forms.map((form) => (
        <div key={form.id}>
          <h2 className="name">{form.form}</h2>
          <div className="form card">
            <div>https://www.formdelegate.com/api/requests/{form.id}</div>
            <div>Domain Whitelist: {form.host || 'All'}</div>
            <div>No. of Messages: {form.messages_count || 'None'}</div>

            <FormIntegrationList integrations={form.form_integrations} />
          </div>
        </div>
      ))}
    </div>
  );
};
