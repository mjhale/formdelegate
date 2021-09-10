import * as React from 'react';
import { useRouter } from 'next/router';

import { fetchSubmission } from 'actions/submissions';
import { getSubmission } from 'selectors';
import { isTokenCurrent } from 'utils';
import { useAppDispatch, useAppSelector } from 'hooks/useRedux';
import useUser from 'hooks/useUser';

import Submission from 'components/Submission/Submission';

const SubmissionPage = () => {
  useUser({ redirectTo: '/login' });

  const router = useRouter();
  const dispatch = useAppDispatch();

  const { submissionId } = router.query;
  const submission = useAppSelector((state) =>
    getSubmission(state, submissionId)
  );
  const isFetching = useAppSelector((state) => state.submissions.isFetching);

  React.useEffect(() => {
    if (submissionId) {
      dispatch(fetchSubmission(submissionId));
    }
  }, [submissionId, dispatch]);

  if (isFetching || !submission) {
    return <p>Loading submission...</p>;
  }

  return <Submission submission={submission} />;
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

export default SubmissionPage;
