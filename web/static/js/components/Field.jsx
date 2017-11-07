import React from 'react';

const renderField = ({
  input,
  label,
  meta: { touched, error },
  placeholder,
  type,
}) => (
  <div className="input-container">
    <label>{label}</label>
    <div>
      <input {...input} placeholder={placeholder} type={type} />

      {touched && error && <span className="input-error">{error}</span>}
    </div>
  </div>
);

export default renderField;
