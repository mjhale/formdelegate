import { denormalize } from 'normalizr';
import { Heading } from '@chakra-ui/react';
import * as React from 'react';
import { useAppDispatch, useAppSelector } from 'hooks/useRedux';
import { useRouter } from 'next/router';

import { fetchForm, updateForm } from 'actions/forms';
import { formSchema } from 'schema';
import { isTokenCurrent } from 'utils';
import useUser from 'hooks/useUser';

import Form from 'components/Form';

const FormEdit = () => {
  useUser({ redirectTo: '/login' });

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { formId } = router.query;

  const entities = useAppSelector((state) => state.entities);
  const isFetching = useAppSelector((state) => state.forms.isFetching);
  const denormalizedForm = entities.forms
    ? denormalize(formId, formSchema, entities)
    : null;

  const handleFormSubmit = (values) => {
    dispatch(updateForm(values)).then(() => router.push('/forms'));
  };

  React.useEffect(() => {
    if (formId) {
      dispatch(fetchForm(formId));
    }
  }, [dispatch, formId]);

  return (
    <React.Fragment>
      <Heading mb={4} size="lg">
        Modify Form Settings
      </Heading>

      <Form
        initialValues={denormalizedForm}
        isFetching={isFetching}
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

export default FormEdit;
