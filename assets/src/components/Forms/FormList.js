import { Box, Button, Flex } from '@chakra-ui/react';
import CopyToClipboard from 'react-copy-to-clipboard';
import Link from 'next/link';

import theme from 'constants/theme';

import Card from 'components/Card';

const FormList = ({ forms, isFetching, onDeleteClick }) => {
  if (isFetching) {
    return null;
  }

  return (
    <>
      {forms.map((form) => (
        <FormSimpleView
          key={form.id}
          form={form}
          onDeleteClick={onDeleteClick}
        />
      ))}
    </>
  );
};

const FormSimpleView = ({ form, onDeleteClick }) => {
  return (
    <Card header={form.name}>
      <Box
        _active={{
          boxShadow: `0 0 10px #403c3c inset, 0 0.2rem ${theme.primaryColor};`,
        }}
        _hover={{
          cursor: 'pointer',
        }}
        bgColor="gray.600"
        border="1px"
        borderColor="gray.700"
        boxShadow="md"
        color="gray.100"
        fontFamily={theme.codeFont}
        p={2}
        textAlign="center"
        transition="all 5.25s linear"
        userSelect="none"
        wordBreak="break-all"
      >
        <CopyToClipboard text={`https://www.formdelegate.com/forms/${form.id}`}>
          <span>{`https://www.formdelegate.com/forms/${form.id}`}</span>
        </CopyToClipboard>
      </Box>
      <Flex justify="space-between" pt={2}>
        <Flex>
          <Link href={`/forms/${form.id}/edit`} passHref legacyBehavior>
            <Button mr={2} size="sm">
              Edit Form
            </Button>
          </Link>
          <Link href={`/forms/${form.id}/submissions`} passHref legacyBehavior>
            <Button size="sm">View Submissions</Button>
          </Link>
        </Flex>
        <Flex alignSelf="end">
          <Button
            onClick={(evt) => onDeleteClick(form.id, evt)}
            colorScheme="red"
            size="sm"
            variant="outline"
          >
            Delete Form
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};

export default FormList;
