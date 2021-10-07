import { Heading } from '@chakra-ui/react';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchSubmissionActivity } from 'actions/submissions';
import { getSubmissionActivity } from 'selectors';
import { isTokenCurrent } from 'utils';
import useUser from 'hooks/useUser';

import Card from 'components/Card';
import SubmissionActivity from 'components/SubmissionActivity';

const DashboardPage = () => {
  const { user, isFetching } = useUser({ redirectTo: '/login' });

  const dispatch = useDispatch();
  const submissionActivity = useSelector((state) =>
    getSubmissionActivity(state)
  );

  React.useEffect(() => {
    dispatch(fetchSubmissionActivity());
  }, [dispatch]);

  if (isFetching || !user || !submissionActivity) {
    return 'Loading...';
  }

  return (
    <>
      <Heading as="h1" mb={4} size="lg">
        My Dashboard
      </Heading>

      <SubmissionActivity activity={submissionActivity} />

      <Card header="Recent Updates">Coming soon</Card>
      <Card header="Feedback">Coming soon</Card>
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

export default DashboardPage;
