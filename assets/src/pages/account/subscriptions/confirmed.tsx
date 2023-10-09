import { useRouter } from 'next/router';

import { Heading, Text } from '@chakra-ui/react';

const ConfirmedSubscription = () => {
  const router = useRouter();
  const { stripe_session_id: stripeSessionId } = router.query;

  return (
    <>
      <Heading as="h2" mb={4}>
        Subscription Confirmed
      </Heading>
      <Text>Thank you for your Form Delegate subscription.</Text>
      <Text>{stripeSessionId}</Text>
    </>
  );
};

export default ConfirmedSubscription;
