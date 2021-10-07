import { Button, Heading } from '@chakra-ui/react';
import Link from 'next/link';
import * as React from 'react';

import { fetchForms, formDeletionRequest } from 'actions/forms';
import { getOrderedForms } from 'selectors';
import { isTokenCurrent } from 'utils';
import { useAppDispatch, useAppSelector } from 'hooks/useRedux';
import useUser from 'hooks/useUser';

import FormList from 'components/Forms/FormList';

const FormsPage = () => {
  useUser({ redirectTo: '/login' });

  const dispatch = useAppDispatch();
  const forms = useAppSelector((state) => getOrderedForms(state));
  const isFetching = useAppSelector((state) => state.forms.isFetching);

  const handleFormDeletion = (formId, evt) => {
    evt.preventDefault();
    const confirm = window.confirm(
      'Are you sure you want to delete this form?'
    );
    if (confirm) dispatch(formDeletionRequest(formId));
  };

  React.useEffect(() => {
    dispatch(fetchForms());
  }, [dispatch]);

  return (
    <>
      <Heading mb={2} size="lg">
        Forms
      </Heading>
      <Link href="/forms/new" passHref>
        <Button mb={2} variant="outline">
          Add Form
        </Button>
      </Link>
      <FormList
        forms={forms}
        isFetching={isFetching}
        onDeleteClick={handleFormDeletion}
      />
    </>
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

export default FormsPage;
