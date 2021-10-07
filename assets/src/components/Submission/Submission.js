import { Badge, Box, Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import * as React from 'react';

import formatRelativeTime from 'utils/formatRelativeTime';
import { useInterval } from 'utils/useInterval';

import { Checkbox } from '@chakra-ui/react';
import Flash from 'components/Flash';
import Link from 'components/Link';

const Submission = ({
  form,
  handleSelectSubmissionChange,
  isSelected,
  submission: { body, data, flagged_at, id: submissionId, inserted_at, sender },
}) => {
  const [isPreviewExpanded, setIsPreviewExpanded] = React.useState(false);
  const [dateInsertedFromNow, setDateInsertedFromNow] = React.useState(
    formatRelativeTime(new Date(inserted_at))
  );

  useInterval(() => {
    setDateInsertedFromNow(formatRelativeTime(new Date(inserted_at)));
  }, 60000);

  const handleSubmissionPreviewToggle = () => {
    setIsPreviewExpanded((isPreviewExpanded) => !isPreviewExpanded);
  };

  return (
    <>
      <Flex
        align="start"
        boxShadow="sm"
        direction="column"
        wrap="wrap"
        width="100%"
      >
        <Flex
          _hover={{
            backgroundColor: !isPreviewExpanded ? '#fafafa' : 'gray.400',
          }}
          align="center"
          backgroundColor={!isPreviewExpanded ? 'inherit' : 'gray.300'}
          justify="start"
          width="100%"
        >
          <Flex align="center" px={3} py={2}>
            <Checkbox
              isChecked={isSelected}
              data-submission-id={submissionId}
              onChange={handleSelectSubmissionChange}
              size="md"
            />
          </Flex>
          <Flex
            align="center"
            color="black"
            cursor="pointer"
            fontSize="sm"
            height="100%"
            onClick={handleSubmissionPreviewToggle}
            justifyContent="space-between"
            py={4}
            textDecoration="none"
            userSelect="none"
            width="100%"
          >
            <Box fontWeight="semibold" width="20%">
              {sender && sender.length > 25
                ? `${sender.substring(0, 25)}...`
                : sender}
            </Box>
            <Box color={flagged_at ? 'blackAlpha.400' : 'inherit'} width="60%">
              {flagged_at && (
                <Badge colorScheme="red" mr={2}>
                  Spam
                </Badge>
              )}
              {body && body.length > 50 ? `${body.substring(0, 50)}...` : body}
            </Box>
            <Box align="end" mr={2} width="20%">
              {dateInsertedFromNow}
            </Box>
          </Flex>
        </Flex>
        {isPreviewExpanded === true ? (
          <Flex
            backgroundColor="gray.100"
            direction="column"
            py={4}
            px={6}
            width="100%"
            wrap="wrap"
          >
            <Box mb={2}>
              <Box fontWeight="bold" fontSize="sm">
                Form
              </Box>
              <Box>{form.name}</Box>
            </Box>
            <Box mb={2}>
              <Box fontWeight="bold" fontSize="sm">
                Submitted
              </Box>
              <Box>{new Date(inserted_at).toLocaleDateString()} at </Box>
            </Box>
            {data &&
              Object.keys(data).length > 0 &&
              Object.keys(data).map((key, index) => {
                // Handle non-string field values such as file upload object
                if (typeof data[key] !== 'string') {
                  // Handle file upload object
                  // - A file upload object should always have the following props: url, field_name, file_size
                  if (
                    Object.prototype.hasOwnProperty.call(data[key], 'url') &&
                    Object.prototype.hasOwnProperty.call(
                      data[key],
                      'field_name'
                    ) &&
                    Object.prototype.hasOwnProperty.call(data[key], 'file_size')
                  ) {
                    return (
                      <Box key={index} mb={2}>
                        <Box fontWeight="bold" fontSize="sm">
                          File Field: {data[key].field_name}
                        </Box>
                        <Box>
                          <Link href={data[key].url}>
                            {data[key].file_name}
                          </Link>
                          <>({data[key].file_size})</>
                        </Box>
                      </Box>
                    );
                  }

                  // Show an error when a non-string field is unhandled
                  return (
                    <Box key={index} mb={2}>
                      <Flash type="error">
                        Unable to load submission field.
                      </Flash>
                    </Box>
                  );
                }

                // Render string fields
                return (
                  <Box key={index} mb={2}>
                    <Box fontWeight="bold" fontSize="sm">
                      Field: {key}
                    </Box>
                    <Box>{data[key]}</Box>
                  </Box>
                );
              })}
          </Flex>
        ) : null}
      </Flex>
    </>
  );
};

Submission.propTypes = {
  form: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  handleSelectSubmissionChange: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
  submission: PropTypes.shape({
    content: PropTypes.string,
    flagged_at: PropTypes.string,
    id: PropTypes.string.isRequired,
    inserted_at: PropTypes.string.isRequired,
    sender: PropTypes.string.isRequired,
    unknown_fields: PropTypes.object,
  }).isRequired,
};

export default Submission;
