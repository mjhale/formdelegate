import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';

import { Formik, Form, FormikProps } from 'formik';
import * as React from 'react';
import * as Yup from 'yup';

import { isTokenCurrent } from 'utils';
import { updateUser } from 'actions/users';
import { useAppDispatch } from 'hooks/useRedux';
import { useDisclosure } from '@chakra-ui/react';
import useUser from 'hooks/useUser';

import Field from 'components/Field/FormikField';

const UserSettings = () => {
  const { user, isFetching } = useUser({ redirectTo: '/login' });
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);

  const dispatch = useAppDispatch();

  const formRef =
    React.useRef<FormikProps<{ id: number; name: string; email: string }>>(
      null
    );

  const {
    isOpen: isPasswordChangeOpen,
    onOpen: onPasswordChangeOpen,
    onClose: onPasswordChangeClose,
  } = useDisclosure();

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
    <React.Fragment>
      <Flex mb={4}>
        <Button size="sm" mr={2}>
          Billing
        </Button>
        <Button size="sm">Team</Button>
      </Flex>

      <Flex justifyContent="space-between" mb={4}>
        <Heading size="lg">Account Profile</Heading>
        <Box alignSelf="center">
          {!isEditingProfile ? (
            <Button size="xs" onClick={() => setIsEditingProfile(true)}>
              Edit
            </Button>
          ) : (
            <>
              <Button
                mr={2}
                size="xs"
                onClick={() => {
                  formRef?.current.handleReset();
                  setIsEditingProfile(false);
                }}
              >
                Cancel
              </Button>
              <Button
                size="xs"
                onClick={() => {
                  formRef?.current.handleSubmit();
                  setIsEditingProfile(false);
                }}
              >
                Save
              </Button>
            </>
          )}
        </Box>
      </Flex>

      <Divider my={2} />

      <Formik
        innerRef={formRef}
        initialValues={{
          id: user.id,
          name: user.name,
          email: user.email,
        }}
        onSubmit={(values) => {
          // @TODO: Add user feedback on update action
          dispatch(updateUser(values));
        }}
        validateOnMount={true}
        validationSchema={Yup.object({
          id: Yup.string(),
          name: Yup.string().required('Name is required'),
          email: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),
        })}
      >
        {() => (
          <Form>
            <Flex alignItems="center" height="14" ml={2}>
              <Box flex="0 1 25%">
                <Text fontWeight="semibold">Email</Text>
              </Box>
              <Box flex="1 1 75%">
                {!isEditingProfile ? (
                  user.email
                ) : (
                  <Field name="email" placeholder="Email" type="text" />
                )}
              </Box>
            </Flex>

            <Flex alignItems="center" height="14" ml={2}>
              <Box flex="0 1 25%">
                <Text fontWeight="semibold">Name</Text>
              </Box>
              <Box flex="1 1 75%">
                {!isEditingProfile ? (
                  user.name
                ) : (
                  <Field name="name" placeholder="" type="text" />
                )}
              </Box>
            </Flex>

            <Flex alignItems="center" height="14" ml={2}>
              <Box flex="0 1 25%">
                <Text fontWeight="semibold">Password</Text>
              </Box>
              <Box flex="1 1 75%">
                {!isEditingProfile ? (
                  '••••••'
                ) : (
                  <Button size="xs" onClick={onPasswordChangeOpen}>
                    Change Password
                  </Button>
                )}
              </Box>
            </Flex>
          </Form>
        )}
      </Formik>

      <Modal
        size="lg"
        isOpen={isPasswordChangeOpen}
        onClose={onPasswordChangeClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change password</ModalHeader>
          <ModalBody>
            <Formik
              onSubmit={(values) => {
                dispatch(updateUser(values));
              }}
              initialValues={{
                id: user.id,
                oldPassword: '',
                newPassword: '',
              }}
              validationSchema={Yup.object({
                id: Yup.string(),
                oldPassword: Yup.string().required('Old password is required'),
                newPassword: Yup.string().required('New password is required'),
              })}
            >
              <Form>
                <Flex alignItems="center" height="14" ml={2}>
                  <Box flex="0 1 25%">
                    <Text fontWeight="semibold" fontSize="sm">
                      Old password
                    </Text>
                  </Box>
                  <Box flex="1 1 75%">
                    <Field name="old_password" type="text" />
                  </Box>
                </Flex>
                <Flex alignItems="center" height="14" ml={2}>
                  <Box flex="0 1 25%">
                    <Text fontWeight="semibold" fontSize="sm">
                      New password
                    </Text>
                  </Box>
                  <Box flex="1 1 75%">
                    <Field name="new_password" type="text" />
                  </Box>
                </Flex>
              </Form>
            </Formik>
          </ModalBody>

          <ModalFooter>
            <Button size="sm" mr={3} onClick={onPasswordChangeClose}>
              Cancel
            </Button>
            <Button size="sm">Change password</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
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

export default UserSettings;
