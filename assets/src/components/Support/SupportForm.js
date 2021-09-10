import * as React from 'react';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';

import { addNotification } from 'actions/notifications';
import { createSupportTicket } from 'actions/supportTickets';
import { useAppDispatch } from 'hooks/useRedux';

import Button from 'components/Button';
import Card from 'components/Card';
import Field from 'components/Field/FormikField';

const SupportForm = () => {
  const dispatch = useAppDispatch();

  return (
    <Formik
      initialValues={{
        name: '',
        email: '',
        message: '',
      }}
      onSubmit={(values, actions) => {
        dispatch(createSupportTicket(values));
        dispatch(
          addNotification({
            level: 'success',
            message: "Support ticket submitted. We'll be in touch soon!",
          })
        );
        actions.resetForm();
      }}
      validationSchema={Yup.object({
        email: Yup.string()
          .email('Invalid email address')
          .required('Email is required'),
        name: Yup.string().required('Name is required'),
        message: Yup.string().required('Message is required'),
      })}
    >
      {({ isSubmitting }) => (
        <Form>
          <Card>
            <Field label="Name" name="name" placeholder="Name" type="text" />
            <Field label="Email" name="email" placeholder="Email" type="text" />
            <Field
              label="Message"
              name="message"
              placeholder="Message"
              type="textarea"
            />
          </Card>
          <Button disabled={isSubmitting} type="submit">
            Submit Ticket
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default SupportForm;
