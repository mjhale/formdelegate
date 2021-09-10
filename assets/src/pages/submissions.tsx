import * as React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { parse } from 'query-string';

import {
  addSubmission,
  fetchSubmissions,
  markSubmissionAsHam,
  markSubmissionAsSpam,
  submissionSearchFetch,
} from 'actions/submissions';
import { getVisibleSubmissions, getVisibleSubmissionForms } from 'selectors';
import { isTokenCurrent } from 'utils';
import { submissionListener } from 'components/Submissions/submissionListener';
import { useAppDispatch, useAppSelector } from 'hooks/useRedux';
import useUser from 'hooks/useUser';

import ErrorBoundary from 'components/ErrorBoundary';
import Submissions from 'components/Submissions/Submissions';
import SubmissionsToolbar from 'components/Submissions/SubmissionsToolbar';

const Header = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const Heading = styled.h1`
  flex: 0 1 auto;
  margin: 0 1rem 0.5rem 0;
`;

const SubmissionsPage = (props) => {
  useUser({ redirectTo: '/login' });

  const dispatch = useAppDispatch();
  const router = useRouter();
  const [selectedSubmissionList, setSelectedSubmissionList] = React.useState<
    Set<number>
  >(new Set());

  const forms = useAppSelector((state) => getVisibleSubmissionForms(state));
  const isFetching = useAppSelector((state) => state.submissions.isFetching);
  const paginationMetaData = useAppSelector(
    (state) => state.submissions.pagination
  );
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

  const handleDeselectSubmission = (submissionId) => {
    setSelectedSubmissionList((prevSelectedSubmissionList) => {
      prevSelectedSubmissionList.delete(submissionId);

      return new Set(prevSelectedSubmissionList);
    });
  };

  const handleMarkAsHam = () => {
    for (const submissionId of selectedSubmissionList) {
      dispatch(markSubmissionAsHam(submissionId));
    }

    setSelectedSubmissionList(new Set());
  };

  const handleMarkAsSpam = () => {
    for (const submissionId of selectedSubmissionList) {
      dispatch(markSubmissionAsSpam(submissionId));
    }

    setSelectedSubmissionList(new Set());
  };

  const handleSelectSubmission = (submissionId) => {
    setSelectedSubmissionList((prevSelectedSubmissionList) => {
      prevSelectedSubmissionList.add(submissionId);
      return new Set(prevSelectedSubmissionList);
    });
  };

  const handleSelectSubmissionChange = (evt) => {
    const {
      checked: isChecked,
      dataset: { submissionId },
    } = evt.target;

    if (isChecked) {
      handleSelectSubmission(submissionId);
    } else {
      handleDeselectSubmission(submissionId);
    }
  };

  const handlePageChange = (requestedPage, evt) => {
    const searchParam = parse(location.search);

    evt.preventDefault();
    loadSubmissions(requestedPage, searchParam && searchParam.search);
  };

  const handleSearch = () => {
    const { search: searchQuery } = router.query;

    if (searchQuery) {
      router.push('?search=' + searchQuery);
    } else {
      router.push('');
    }

    loadSubmissions(1, searchQuery);
  };

  React.useEffect(() => {
    const { search: searchQuery } = router.query;

    loadSubmissions(1, searchQuery);

    // @TODO: Reenable submission socket listener when access tokens are implemented
    // submissionListener(addSubmission);
  }, [router.query, loadSubmissions]);

  return (
    <React.Fragment>
      <Header>
        <Heading>My Submissions</Heading>
        <SubmissionsToolbar
          handleMarkAsHam={handleMarkAsHam}
          handleMarkAsSpam={handleMarkAsSpam}
          handlePageChange={handlePageChange}
          handleSearch={handleSearch}
          paginationMetaData={paginationMetaData}
        />
      </Header>
      <ErrorBoundary>
        <Submissions
          forms={forms}
          handleSelectSubmissionChange={handleSelectSubmissionChange}
          isFetching={isFetching}
          submissions={submissions}
          selectedSubmissionList={selectedSubmissionList}
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
