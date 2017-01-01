import React from 'react';

const renderField = ({ input, label, type, meta: { touched, error } }) => (
  <div>
    <label>{label}</label>
    <div>
      <input
        {...input}
        placeholder={label}
        type={type}
      />

      {touched && error && <span className="input-error">{error}</span>}
    </div>
  </div>
);

export default renderField;
