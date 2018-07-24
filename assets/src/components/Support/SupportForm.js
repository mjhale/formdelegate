import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, reset } from 'redux-form';

import { addNotification } from 'actions/notifications';
import { createSupportTicket } from 'actions/supportTickets';

import Button from 'components/Button';
import Card from 'components/Card';
import renderField from 'components/Field';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
};

const submitFormValidations = values => {
  const errors = {};

  if (!values.name) {
    errors.name = 'Required';
  }

  if (!values.email) {
    errors.email = 'Required';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }

  if (!values.message) {
    errors.message = 'Required';
  }

  return errors;
};

let SupportForm = ({ handleSubmit, submitting }) => (
  <form onSubmit={handleSubmit}>
    <Card>
      <Field component={renderField} name="name" label="Name" type="text" />
      <Field
        component={renderField}
        name="email"
        label="E-mail Address"
        type="text"
      />
      <Field
        component={renderField}
        name="message"
        label="Message"
        type="textarea"
      />
    </Card>
    <Button type="submit" disabled={submitting}>
      Submit Ticket
    </Button>
  </form>
);

SupportForm.propTypes = propTypes;

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSubmit(values) {
    dispatch(createSupportTicket(values));
    dispatch(
      addNotification({
        level: 'success',
        message: "Support ticket submitted. We'll be in touch soon!",
      })
    );
    dispatch(reset('support'));
  },
});

SupportForm = reduxForm({
  form: 'support',
  validate: submitFormValidations,
})(SupportForm);

export default connect(
  null,
  mapDispatchToProps
)(SupportForm);
