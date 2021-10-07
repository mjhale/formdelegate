import { markSubmissionAsHam, markSubmissionAsSpam } from 'actions/submissions';
import * as React from 'react';
import { useAppDispatch, useAppSelector } from 'hooks/useRedux';
import { useRouter } from 'next/router';

import { Box, Button, ButtonGroup, Checkbox, Flex } from '@chakra-ui/react';
import Search from 'components/Search';
import Paginator from 'components/Paginator';

const SubmissionsToolbar = ({
  loadSubmissions,
  selectedSubmissionList,
  setSelectedSubmissionList,
  submissions,
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const paginationMetaData = useAppSelector(
    (state) => state.submissions.pagination
  );
  const [hasSelectedAllSubmissions, setHasSelectedAllSubmissions] =
    React.useState(false);

  const handleMarkAsHam = () => {
    for (const submissionId of selectedSubmissionList) {
      dispatch(markSubmissionAsHam(submissionId));
    }

    setSelectedSubmissionList(new Set());
    setHasSelectedAllSubmissions(false);
  };

  const handleMarkAsSpam = () => {
    for (const submissionId of selectedSubmissionList) {
      dispatch(markSubmissionAsSpam(submissionId));
    }

    setSelectedSubmissionList(new Set());
    setHasSelectedAllSubmissions(false);
  };

  const handlePageChange = (requestedPage) => {
    const { search: searchParam } = router.query;
    loadSubmissions(requestedPage, searchParam);
    setSelectedSubmissionList(new Set());
    setHasSelectedAllSubmissions(false);
  };

  const handleSearch = (values) => {
    const { search: searchQuery } = values;

    if (searchQuery) {
      router.push('?search=' + searchQuery);
    } else {
      router.push('');
    }

    loadSubmissions(1, searchQuery);
    setSelectedSubmissionList(new Set());
    setHasSelectedAllSubmissions(false);
  };

  const handleSelectAllSubmissions = (
    setHasSelectedAllSubmissions: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setHasSelectedAllSubmissions((hasSelectedAllSubmissions) => {
      const updatedSelectedAllState = !hasSelectedAllSubmissions;

      if (updatedSelectedAllState) {
        setSelectedSubmissionList(new Set(submissions.map(({ id }) => id)));
      } else {
        setSelectedSubmissionList(new Set([]));
      }

      return updatedSelectedAllState;
    });
  };

  return (
    <Flex align="center" justify="space-between" wrap="wrap">
      <ButtonGroup mb={2} mr={4} variant="outline" size="sm" spacing={2}>
        <Flex
          lineHeight="1.2"
          transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
          border="1px"
          px={3}
          borderRadius={6}
          borderColor="gray.200"
        >
          <Checkbox
            defaultChecked={false}
            isChecked={hasSelectedAllSubmissions}
            onChange={() =>
              handleSelectAllSubmissions(setHasSelectedAllSubmissions)
            }
            size="md"
          />
        </Flex>
        <Button onClick={handleMarkAsSpam}>Mark as Junk</Button>
        <Button onClick={handleMarkAsHam}>Mark as Not Junk</Button>
      </ButtonGroup>
      <Flex mb={2}>
        <Box mr={4}>
          <Search handleSearch={handleSearch} />
        </Box>
        {paginationMetaData.total > 0 && (
          <Paginator
            handlePageChange={handlePageChange}
            paginationMetaData={paginationMetaData}
          />
        )}
      </Flex>
    </Flex>
  );
};

export default SubmissionsToolbar;
