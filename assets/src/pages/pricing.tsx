import {
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';

const Pricing = () => {
  const router = useRouter();

  return (
    <>
      <Heading mb={4} size="lg">
        Pricing
      </Heading>
      <Text mb={4}>Choose a plan that works best for you.</Text>
      <Grid templateColumns="repeat(3, 1fr)" gap={4}>
        <Flex
          border="1px"
          borderColor="gray.300"
          direction="column"
          p={4}
          rounded={12}
          shadow="lg"
        >
          <Flex align="center" direction="column">
            <Box fontWeight="semibold" mb={2}>
              Basic
            </Box>
            <Box fontWeight="extrabold" fontSize="3xl" mb={4}>
              Free
            </Box>
          </Flex>
          <Divider mb={4} />
          <VStack align="start" fontSize="sm" mb={4} sspacing={2}>
            <Box>Good for personal websites</Box>
            <Box>100 Submissions</Box>
            <Box>1GB Storage</Box>
            <Box>Unlimited Forms</Box>
          </VStack>
          <Button colorScheme="red" onClick={() => router.push('/signup')}>
            Sign up
          </Button>
        </Flex>
        <Flex
          border="1px"
          borderColor="gray.300"
          direction="column"
          p={4}
          rounded={12}
          shadow="lg"
        >
          <Flex align="center" direction="column">
            <Box fontWeight="semibold" mb={2}>
              Professional
            </Box>
            <Box fontWeight="extrabold" fontSize="3xl" mb={4}>
              $25/mo
            </Box>
          </Flex>
          <Divider mb={4} />
          <VStack align="start" fontSize="sm" mb={4} spacing={2}>
            <Box>Good for businesses</Box>
            <Box>5K Submissions</Box>
            <Box>20GB Storage</Box>
            <Box>Unlimited Forms</Box>
          </VStack>
          <Button disabled>Unavailable</Button>
        </Flex>
        <Flex
          border="1px"
          borderColor="gray.300"
          direction="column"
          p={4}
          rounded={12}
          shadow="lg"
        >
          <Flex align="center" direction="column">
            <Box fontWeight="semibold" mb={2}>
              Enterprise
            </Box>
            <Box fontWeight="extrabold" fontSize="3xl" mb={4}>
              $300/mo
            </Box>
          </Flex>
          <Divider mb={4} />
          <VStack align="start" fontSize="sm" mb={4} spacing={2}>
            <Box>Good for large organizations</Box>
            <Box>100K Submissions</Box>
            <Box>1TB storage</Box>
            <Box>Unlimited Forms</Box>
          </VStack>
          <Button disabled>Unavailable</Button>
        </Flex>
      </Grid>
    </>
  );
};

export default Pricing;
