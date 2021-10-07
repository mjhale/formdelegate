import { Box, Heading, Text } from '@chakra-ui/react';

const Faq = () => (
  <>
    <Heading mb={4} size="lg">
      Frequently Asked Questions
    </Heading>

    <Box mb={4}>
      <Heading as="h3" size="md">
        How does it work?
      </Heading>
      <Text>
        Code an HTML form into any page and let Form Delegate handle the rest.
        From data retention to file storage and email notifications, Form
        Delegate takes the complexities out of form handling. Just point your
        form's action attribute to our service.
      </Text>
    </Box>

    <Box mb={4}>
      <Heading as="h3" size="md">
        Is this project ready for production usage?
      </Heading>
      <Text>
        No. This project is still in early development. At this stage, Form
        Delegate does not guarantee data integrity nor can it make any
        guarantees regarding service uptime.
      </Text>
    </Box>

    <Box mb={4}>
      <Heading as="h3" size="md">
        What are the free tier limitations?
      </Heading>
      <Text>
        The free tier service is limited to a maximum of 100 submissions per
        month and 1 gigabyte of total file storage. There is no cap to the
        number of form endpoints that can be created.
      </Text>
    </Box>

    <Box mb={4}>
      <Heading as="h3" size="md">
        Are forms with file inputs allowed?
      </Heading>
      <Text>
        Yes, Form Delegate supports file uploads which are securely accessible
        through our service.
      </Text>
    </Box>

    <Box mb={4}>
      <Heading as="h3" size="md">
        How do integrations work?
      </Heading>
      <Text>
        Form Delegate supports integrations with a number of third-party
        services such as Zapier and Ifttt. To integrate with a service, click
        the "Add Integration" button on the form's settings page.
      </Text>
    </Box>

    <Box mb={4}>
      <Heading as="h3" size="md">
        What are domain allow lists?
      </Heading>
      <Text>
        If you wish to restrict form submissions to specific domains, you can do
        so by adding them to the form's allow list.
      </Text>
    </Box>

    <Box mb={4}>
      <Heading as="h3" size="md">
        Is there a white label service?
      </Heading>
      <Text>
        If you wish to create a custom service, you can do so by contacting us
        at support@formdelegate.com.
      </Text>
    </Box>
  </>
);

export default Faq;
