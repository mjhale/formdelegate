import { Formik, Form } from 'formik';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router';
import * as Yup from 'yup';

import { adminFetchUser, adminUpdateUser } from 'actions/users';
import { getUser } from 'selectors';

import Button from 'components/Button';
import Field from 'components/Field/FormikField';

const AdminUserForm = props => {
  const history = useHistory();
  const dispatch = useDispatch();

  const { userId } = useParams();
  const user = useSelector(state => getUser(state, props));
  const isFetching = useSelector(state => state.users.isFetching);

  const handleUserEdit = user => {
    // @TODO: Use the userId from the params to update the user
    dispatch(adminUpdateUser(user)).then(() =>
      history.push(`/admin/users/${user.id}`)
    );
  };

  React.useEffect(() => {
    if (userId != null) {
      dispatch(adminFetchUser(userId));
    }
  }, [dispatch, userId]);

  if (isFetching) {
    return 'Loading user details...';
  }

  return (
    <React.Fragment>
      <Formik
        initialValues={{
          id: user?.id,
          email: user?.email,
          name: user?.name,
        }}
        onSubmit={values => handleUserEdit(values)}
        validationSchema={Yup.object({
          email: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),
          name: Yup.string().required('Name is required'),
        })}
      >
        {({ dirty, handleReset, isSubmitting }) => (
          <Form>
            <h2>Edit User</h2>
            <Field label="Email" name="email" type="text" placeholder="Email" />
            <Field
              label="Full Name"
              name="name"
              type="text"
              placeholder="Full Name"
            />

            <Button disabled={isSubmitting} type="submit">
              Save Changes
            </Button>
            <Button
              disabled={isSubmitting || !dirty}
              onClick={handleReset}
              type="reset"
            >
              Reset Changes
            </Button>
          </Form>
        )}
      </Formik>
    </React.Fragment>
  );
};

export default AdminUserForm;
