import React from 'react';
import { FormIntegrationList } from './FormIntegrationList';

export const FormList = ({ forms, isFetching }) => {
  if (isFetching) {
    return (
      <p>Loading forms...</p>
    );
  }

  return (
    <div>
      {forms.map((form) => (
        <div key={form.id}>
          <h2 className="name">{form.name}</h2>
          <div className="form card">
            <div>Host: {form.host || 'Not Specified'}</div>
            <div>Number of Messages: {form.messages_count}</div>
            <FormIntegrationList integrations={form.form_integrations} />
          </div>
        </div>
      ))}
    </div>
  );
};
