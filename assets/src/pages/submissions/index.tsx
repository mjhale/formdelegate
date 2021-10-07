import { Heading } from '@chakra-ui/react';
import * as React from 'react';
import { useRouter } from 'next/router';

import { fetchSubmissions, submissionSearchFetch } from 'actions/submissions';
import { getVisibleSubmissions, getVisibleSubmissionForms } from 'selectors';
import { isTokenCurrent } from 'utils';
import { useAppDispatch, useAppSelector } from 'hooks/useRedux';
import useUser from 'hooks/useUser';

import ErrorBoundary from 'components/ErrorBoundary';
import Submissions from 'components/Submissions/Submissions';
import SubmissionsToolbar from 'components/Submissions/SubmissionsToolbar';

const SubmissionsPage = () => {
  useUser({ redirectTo: '/login' });

  const dispatch = useAppDispatch();
  const router = useRouter();
  const [selectedSubmissionList, setSelectedSubmissionList] = React.useState<
    Set<number>
  >(new Set());

  const forms = useAppSelector((state) => getVisibleSubmissionForms(state));
  const isFetching = useAppSelector((state) => state.submissions.isFetching);
  const submissions = useAppSelector((state) => getVisibleSubmissions(state));

  const loadSubmissions = React.useCallback(
    (requestedPage, searchQuery) => {
      if (searchQuery) {
        dispatch(submissionSearchFetch(searchQuery, requestedPage));
      } else {
        dispatch(fetchSubmissions(requestedPage));
      }
    },
    [dispatch]
  );

  React.useEffect(() => {
    const { search: searchQuery } = router.query;

    loadSubmissions(1, searchQuery);

    // @TODO: Re-enable submission socket listener once refresh tokens are implemented and the socket
    // authentication flow is improved.
    // submissionListener(addSubmission);
  }, [router.query, loadSubmissions]);

  return (
    <React.Fragment>
      <Heading mb={2} size="lg">
        Submissions
      </Heading>
      <SubmissionsToolbar
        loadSubmissions={loadSubmissions}
        selectedSubmissionList={selectedSubmissionList}
        setSelectedSubmissionList={setSelectedSubmissionList}
        submissions={submissions}
      />
      <ErrorBoundary>
        <Submissions
          forms={forms}
          isFetching={isFetching}
          submissions={submissions}
          selectedSubmissionList={selectedSubmissionList}
          setSelectedSubmissionList={setSelectedSubmissionList}
        />
      </ErrorBoundary>
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

export default SubmissionsPage;
