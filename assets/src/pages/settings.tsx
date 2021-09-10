import * as React from 'react';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';

import { getCurrentUser } from 'selectors';
import { isTokenCurrent } from 'utils';
import { updateUser } from 'actions/users';
import { useAppDispatch, useAppSelector } from 'hooks/useRedux';
import useUser from 'hooks/useUser';

import Button from 'components/Button';
import Card from 'components/Card';
import Field from 'components/Field/FormikField';

const UserSettings = () => {
  const { user, isFetching } = useUser({ redirectTo: '/login' });

  const dispatch = useAppDispatch();

  if (isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <React.Fragment>
      <h1>User Settings</h1>
      <Card>
        <Formik
          initialValues={{
            id: user.id,
            name: user.name,
            email: user.email,
          }}
          onSubmit={(values, actions) => {
            // @TODO: Add user feedback on update action
            dispatch(updateUser(user));
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

export async function getServerSideProps({ req }) {
  const accessToken = req.cookies?.access_token;
  const isTokenValid = isTokenCurrent(accessToken);

  if (!isTokenValid) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

export default UserSettings;
