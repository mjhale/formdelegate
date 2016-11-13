import React from 'react';

export const FormList = ({ forms, isFetching }) => {
  if (isFetching) {
    return (
      <p>Loading forms...</p>
    );
  }

  return (
    <div>
      {forms.map((form) => (
        <div key={form.id} className="form card">
          <div className="id">{form.id}</div>
          <div className="name">{form.name}</div>
        </div>
      ))}
    </div>
  );
};
