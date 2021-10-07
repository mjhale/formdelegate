import { Badge, Heading, Link, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';

const SubmissionSuccessPage = () => {
  const router = useRouter();

  return (
    <>
      <Heading mb={2} size="lg">
        Form Submission
        <Badge colorScheme="green" ml={2} p={1}>
          Success
        </Badge>
      </Heading>
      <Text>
        Thank you, your form submission has been received. You can either close
        this page or{' '}
        <Link textDecoration="underline" onClick={() => router.back()}>
          return to the previous page
        </Link>
        .
      </Text>
    </>
  );
};

export default SubmissionSuccessPage;
