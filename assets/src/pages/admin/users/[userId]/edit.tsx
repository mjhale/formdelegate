import { Formik, Form } from 'formik';
import * as React from 'react';
import { useRouter } from 'next/router';
import * as Yup from 'yup';

import { adminFetchUser, adminUpdateUser } from 'actions/users';
import { getUser } from 'selectors';
import { isTokenCurrent } from 'utils';
import { useAppDispatch, useAppSelector } from 'hooks/useRedux';

import AdminLayout from 'components/Layouts/AdminLayout';
import Button from 'components/Button';
import Field from 'components/Field/FormikField';

const AdminUserEditPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const userId =
    router.query.userId != null ? parseInt(router.query.userId, 10) : null;
  const isFetching = useAppSelector((state) => state.users.isFetching);
  const user = useAppSelector((state) => getUser(state, userId));

  const handleUserEdit = (user) => {
    // @TODO: Use the userId from the params to update the user
    dispatch(adminUpdateUser(user)).then(() =>
      router.push(`/admin/users/${user.id}`)
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
        onSubmit={(values) => handleUserEdit(values)}
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

AdminUserEditPage.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
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

export default AdminUserEditPage;
