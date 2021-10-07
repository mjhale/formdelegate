import { Button, Heading, Skeleton, Stack, VStack } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import * as React from 'react';
import * as Yup from 'yup';

import { isTokenCurrent } from 'utils';
import { updateUser } from 'actions/users';
import { useAppDispatch } from 'hooks/useRedux';
import useUser from 'hooks/useUser';

import Card from 'components/Card';
import Field from 'components/Field/FormikField';

const UserSettings = () => {
  const { user, isFetching } = useUser({ redirectTo: '/login' });

  const dispatch = useAppDispatch();

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
      <Heading mb={2} size="lg">
        My Settings
      </Heading>
      <Formik
        initialValues={{
          id: user.id,
          name: user.name,
          email: user.email,
        }}
        onSubmit={(values, actions) => {
          // @TODO: Add user feedback on update action
          dispatch(updateUser(user));
        }}
        validationSchema={Yup.object({
          id: Yup.string(),
          name: Yup.string().required('Name is required'),
          email: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),
        })}
      >
        {({ isSubmitting }) => (
          <Form>
            <Card>
              <VStack spacing={2}>
                <Field
                  label="Email"
                  name="email"
                  placeholder="Email"
                  type="text"
                />
                <Field
                  label="Full Name"
                  name="name"
                  placeholder="Full Name"
                  type="text"
                />
              </VStack>
            </Card>

            <Button disabled={isSubmitting} type="submit" variant="outline">
              Update User
            </Button>
          </Form>
        )}
      </Formik>
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
