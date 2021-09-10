import * as React from 'react';
import { useRouter } from 'next/router';

import { createForm } from 'actions/forms';
import { isTokenCurrent } from 'utils';
import { useAppDispatch } from 'hooks/useRedux';
import useUser from 'hooks/useUser';

import Form from 'components/Form';

const FormNew = () => {
  useUser({ redirectTo: '/login' });

  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleFormSubmit = (values) => {
    dispatch(createForm(values)).then(() => router.push('/forms/'));
  };

  return (
    <React.Fragment>
      <h1>Add New Form</h1>
      <Form
        initialValues={{
          name: '',
          email_integrations: [],
        }}
        handleFormSubmit={handleFormSubmit}
      />
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

export default FormNew;
