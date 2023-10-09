import { Heading, Text } from '@chakra-ui/react';
import Link from 'components/Link';

const AbandonedCheckout = () => {
  return (
    <>
      <Heading as="h2" mb={4}>
        Checkout Failure
      </Heading>
      <Text>
        We appreciate your interest in Form Delegate, and if you ran into any
        trouble or have any questions regarding your checkout process please{' '}
        <Link href="/support">contact us</Link>.
      </Text>
    </>
  );
};

export default AbandonedCheckout;
