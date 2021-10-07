import { Box, Button, Heading, Skeleton, Stack } from '@chakra-ui/react';
import { Formik, Form as FormikForm } from 'formik';
import * as Yup from 'yup';

import Card from 'components/Card';
import Field from 'components/Field/FormikField';
import FormIntegrations from 'components/Form/FormIntegrations';

const StyledCardHeader = ({ title, isVerified }) => {
  if (!title && isVerified == null) {
    return <>Form</>;
  }

  return (
    <>
      <Box float="right" textTransform="none">
        {isVerified ? 'Verified' : 'Unverified'}
      </Box>

      {title}
    </>
  );
};

const Form = (props) => {
  const { handleFormSubmit, initialValues, isFetching } = props;

  if (isFetching || initialValues == null) {
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
      <Formik
        initialValues={initialValues}
        onSubmit={(values) => {
          handleFormSubmit(values);
        }}
        validationSchema={Yup.object({
          name: Yup.string().required('Form name is required'),
          id: Yup.string(),
          email_integrations: Yup.array().of(
            Yup.object().shape({
              enabled: Yup.bool().required('Required'),
              email_integration_recipients: Yup.array().of(
                Yup.object().shape({
                  id: Yup.number(),
                  email: Yup.string().required('Recipient email is required'),
                  name: Yup.string().default('').nullable(),
                  type: Yup.string().required('Recipient type is required'),
                })
              ),
            })
          ),
        })}
      >
        {({ values }) => {
          return (
            <FormikForm>
              <Card
                header={
                  <StyledCardHeader
                    title={initialValues.name}
                    isVerified={initialValues.verified}
                  />
                }
              >
                <Box mb={2}>
                  <Field
                    label="Form Name"
                    name="name"
                    placeholder="Form Name"
                    type="text"
                  />
                </Box>
                {values.id != null ? (
                  <Box mb={2}>
                    <Field
                      disabled={true}
                      label="Endpoint ID"
                      name="id"
                      placeholder="Endpoint ID"
                      type="text"
                    />
                  </Box>
                ) : null}
                {initialValues.submission_count != null ? (
                  <Box mb={2}>
                    <Field
                      disabled={true}
                      label="Total Submissions"
                      name="submission_count"
                      placeholder="Total Submissions"
                      type="text"
                    />
                  </Box>
                ) : null}

                <Heading as="h3" mb={2} size="md">
                  Integrations
                </Heading>
                <FormIntegrations values={values} />
              </Card>
              <Button type="submit" variant="outline">
                Save Form
              </Button>
            </FormikForm>
          );
        }}
      </Formik>
    </>
  );
};

export default Form;
