import { Heading, Text, Skeleton, Stack } from '@chakra-ui/react';
import { useRouter } from 'next/router';

import getStripe from 'utils/getStripe';
import { isTokenCurrent } from 'utils';
import useUser from 'hooks/useUser';

import { useEffect } from 'react';

const SubscriptionManagement = () => {
  const { user, isFetching } = useUser({ redirectTo: '/login' });

  if (isFetching) {
    return (
      <Stack spacing={4}>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  return (
    <>
      <Heading as="h2" mb={4}>
        Billing
      </Heading>
      <Text>
        Update your payment information or switch plans according to your needs.
      </Text>
      <Heading as="h3" mb={4}>
        Current Plan
      </Heading>
      <Text>Plan Name</Text>
      Manage Plan
      <Text></Text>
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

export default SubscriptionManagement;
