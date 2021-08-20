import * as React from 'react';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';
import { useDispatch, useSelector } from 'react-redux';

import { getCurrentUser } from 'selectors';
import { updateUser } from 'actions/users';

import Button from 'components/Button';
import Card from 'components/Card';
import Field from 'components/Field/FormikField';

const UserSettings = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => getCurrentUser(state));

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <React.Fragment>
      <h1>User Settings</h1>
      <Card>
        <Formik
          initialValues={{
            id: '',
            name: '',
            email: '',
          }}
          onSubmit={(values, actions) => {
            // @TODO: Add user feedback on update action
            dispatch(updateUser(currentUser));
          }}
          validationSchema={Yup.object({
            id: Yup.string(),
            name: Yup.string().required('Name is required'),
            email: Yup.string()
              .email('Invalid email address')
              .required('Email is required'),
          })}
        >
          {({ isSubmitting }) => (
            <Form>
              <Field
                label="Email"
                name="email"
                placeholder="Email"
                type="text"
              />
              <Field
                label="Full Name"
                name="name"
                placeholder="Full Name"
                type="text"
              />
              <Button disabled={isSubmitting} type="submit">
                Update User
              </Button>
            </Form>
          )}
        </Formik>
      </Card>
    </React.Fragment>
  );
};

export default UserSettings;
