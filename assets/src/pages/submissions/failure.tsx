import { Badge, Heading, Link, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';

const SubmissionFailurePage = () => {
  const router = useRouter();

  return (
    <>
      <Heading mb={2} size="lg">
        Form Submission
        <Badge colorScheme="red" ml={2} p={1}>
          Error
        </Badge>
      </Heading>
      <Text>
        We're sorry, there was an issue delivering your submission. Please{' '}
        <Link textDecoration="underline" onClick={() => router.back()}>
          return to the previous page
        </Link>{' '}
        and resubmit your form submission.
      </Text>
    </>
  );
};

export default SubmissionFailurePage;
