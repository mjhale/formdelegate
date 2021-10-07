import { Heading } from '@chakra-ui/react';

import SupportForm from 'components/Support/SupportForm';

const SupportPage = () => {
  return (
    <>
      <Heading mb={2} size="lg">
        Support Hub
      </Heading>
      <SupportForm />
    </>
  );
};

export default SupportPage;
