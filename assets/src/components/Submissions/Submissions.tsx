import type Form from 'types/form';
import type * as React from 'react';
import type SubmissionType from 'types/submission';

import { Flex, Skeleton, Stack } from '@chakra-ui/react';
import { map } from 'lodash';

import theme from 'constants/theme';

import Submission from 'components/Submission/Submission';

type Props = {
  forms: Array<Form>;
  isFetching: boolean;
  submissions: Array<SubmissionType>;
  selectedSubmissionList: Set<number>;
  setSelectedSubmissionList: React.Dispatch<React.SetStateAction<Set<number>>>;
};

const Submissions = ({
  forms,
  isFetching,
  submissions,
  selectedSubmissionList,
  setSelectedSubmissionList,
}: Props) => {
  const handleSelectSubmission = (submissionId: number) => {
    setSelectedSubmissionList((prevSelectedSubmissionList) => {
      prevSelectedSubmissionList.add(submissionId);
      return new Set(prevSelectedSubmissionList);
    });
  };

  const handleDeselectSubmission = (submissionId: number) => {
    setSelectedSubmissionList((prevSelectedSubmissionList) => {
      prevSelectedSubmissionList.delete(submissionId);

      return new Set(prevSelectedSubmissionList);
    });
  };

  const handleSelectSubmissionChange = (
    evt: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { checked: isChecked } = evt.target;
    const {
      dataset: { submissionId },
    } = evt.target.parentElement;

    if (isChecked) {
      handleSelectSubmission(Number(submissionId));
    } else {
      handleDeselectSubmission(Number(submissionId));
    }
  };

  if (isFetching) {
    return (
      <Stack spacing={4}>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  if (!isFetching && (submissions.length === 0 || forms.length === 0)) {
    return <p>No submissions found.</p>;
  }

  return (
    <Flex
      backgroundColor={theme.solidWhite}
      border="1px"
      borderColor="gray.200"
      direction="column"
      justify="space-between"
      wrap={{ base: 'wrap', md: 'nowrap' }}
    >
      {map(Object.keys(submissions), (index) => (
        <Submission
          form={forms.find((form) => form.id === submissions[index].form)}
          handleSelectSubmissionChange={handleSelectSubmissionChange}
          isSelected={selectedSubmissionList.has(submissions[index].id)}
          key={submissions[index].id}
          submission={submissions[index]}
        />
      ))}
    </Flex>
  );
};

export default Submissions;
