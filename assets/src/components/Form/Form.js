import * as React from 'react';
import styled from 'styled-components';
import { Formik, Form as FormikForm } from 'formik';
import * as Yup from 'yup';

import Button from 'components/Button';
import Card from 'components/Card';
import Field from 'components/Field/FormikField';
import FormIntegrations from 'components/Form/FormIntegrations';

const StyledVerifiedStatus = styled.div`
  float: right;
  text-transform: none;
`;

const StyledCardHeader = ({ title, isVerified }) => {
  if (!title && isVerified == null) {
    return <React.Fragment>Form</React.Fragment>;
  }

  return (
    <React.Fragment>
      <StyledVerifiedStatus>
        {isVerified ? 'Verified' : 'Unverified'}
      </StyledVerifiedStatus>

      {title}
    </React.Fragment>
  );
};

const Form = (props) => {
  const { handleFormSubmit, initialValues, isFetching } = props;

  if (isFetching || initialValues == null) {
    return <div>Loading form...</div>;
  }

  return (
    <React.Fragment>
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
                <h2>Form Details</h2>
                <Field
                  label="Form Name"
                  name="name"
                  placeholder="Form Name"
                  type="text"
                />
                {values.id != null ? (
                  <Field
                    disabled={true}
                    label="Endpoint ID"
                    name="id"
                    placeholder="Endpoint ID"
                    type="text"
                  />
                ) : null}
                {initialValues.submission_count != null ? (
                  <Field
                    disabled={true}
                    label="Total Submissions"
                    name="submission_count"
                    placeholder="Total Submissions"
                    type="text"
                  />
                ) : null}

                <h2>Integrations</h2>
                <FormIntegrations values={values} />
              </Card>
              <Button type="submit">Save Form</Button>
            </FormikForm>
          );
        }}
      </Formik>
    </React.Fragment>
  );
};

export default Form;
