import { Heading, VStack } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import * as React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import * as Yup from 'yup';

import { createUser } from 'actions/users';
import getStripe from 'utils/getStripe';
import { isTokenCurrent } from 'utils';
import { loginUser } from 'actions/sessions';
import translations from 'translations';
import { useAppDispatch, useAppSelector } from 'hooks/useRedux';
import useUser from 'hooks/useUser';

import Button from 'components/Button';
import Field, { StyledFieldError } from 'components/Field/FormikField';
import Flash from 'components/Flash';

const StyledCaptchaWrapper = styled.div`
  margin-bottom: 0.725rem;
`;

const SignupPage = () => {
  // useUser({ redirectTo: '/dashboard', redirectIfFound: true });

  const CAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY;
  const captchaRef = React.useRef<HCaptcha>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const registrationError = useAppSelector((state) => state.users.error);

  const handleRegistrationAndLogin = (registrationFields, actions) => {
    dispatch(
      createUser({
        captchaToken: registrationFields.captcha,
        user: registrationFields.user,
      })
    )
      .then(() =>
        dispatch(
          loginUser({
            email: registrationFields.user.email,
            password: registrationFields.user.password,
          })
        )
      )
      .then(async () => {
        const checkoutSessionRequest = await fetch(
          '/api/v1/stripe/checkout-sessions',
          {
            method: 'POST',
            cache: 'no-cache',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              priceId: 'price_1JqNR8AZx7ESoF8IrQIAiTGr',
              customerEmail: registrationFields.user.email,
            }),
          }
        );
        const checkoutSession = await checkoutSessionRequest.json();

        if (checkoutSession.statusCode === 500) {
          console.error(checkoutSession.message);
          return;
        }

        const stripe = await getStripe();

        const { error } = await stripe.redirectToCheckout({
          sessionId: checkoutSession.id,
        });

        if (error) {
          console.warn(error.message);
        }
      })
      .catch((errorPayload) => {
        if (
          errorPayload.error_code === 'CHANGESET_ERROR' &&
          errorPayload.errors.length > 0
        ) {
          errorPayload.errors.forEach((changesetError) => {
            actions.setFieldError(changesetError.field, changesetError.message);
          });
        }

        actions.setFieldValue('captcha', '');
        captchaRef.current && captchaRef.current.resetCaptcha();
      })
      .finally(() => {
        actions.setSubmitting(false);
      });
  };

  return (
    <React.Fragment>
      {registrationError.type && (
        <Flash type="error">
          {translations[registrationError.type] ||
            translations['UNKNOWN_ERROR']}
        </Flash>
      )}

      <Heading mb={4} size="lg">
        Sign Up for Form Delegate
      </Heading>

      <Formik
        initialValues={{
          captcha: '',
          user: {
            email: '',
            name: '',
            password: '',
            password_confirmation: '',
          },
        }}
        onSubmit={async (values, actions) => {
          handleRegistrationAndLogin(values, actions);
        }}
        validationSchema={Yup.object({
          captcha: Yup.string().required('CAPTCHA validation is required'),
          user: Yup.object({
            email: Yup.string()
              .email('Invalid email address')
              .required('Email is required'),
            name: Yup.string().required('Name is required'),
            password: Yup.string()
              .min(8, 'Password must be at least 8 characters')
              .required('Password is required'),
            password_confirmation: Yup.string()
              .oneOf([Yup.ref('password'), null], 'Passwords must match')
              .required('Password confirmation is required'),
          }),
        })}
      >
        {(formProps) => (
          <Form>
            <VStack align="start" spacing={2}>
              <Field
                label="Email"
                name="user.email"
                placeholder="Email"
                type="email"
              />
              <Field
                label="Full Name"
                name="user.name"
                placeholder="Full Name"
                type="text"
              />
              <Field
                label="Password"
                name="user.password"
                placeholder="Password"
                type="password"
              />
              <Field
                label="Confirm password"
                name="user.password_confirmation"
                placeholder="Confirm password"
                type="password"
              />
              <StyledCaptchaWrapper>
                <HCaptcha
                  ref={captchaRef}
                  sitekey={CAPTCHA_SITE_KEY}
                  onVerify={(token) =>
                    formProps.setFieldValue('captcha', token)
                  }
                />
                {formProps.errors.captcha && formProps.touched.captcha && (
                  <StyledFieldError>
                    {formProps.errors.captcha}
                  </StyledFieldError>
                )}
              </StyledCaptchaWrapper>
              <Button disabled={formProps.isSubmitting} type="submit">
                Proceed to Checkout
              </Button>
            </VStack>
          </Form>
        )}
      </Formik>
    </React.Fragment>
  );
};

export async function getServerSideProps({ req }) {
  const accessToken = req.cookies?.access_token;
  const isTokenValid = isTokenCurrent(accessToken);

  if (isTokenValid) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

export default SignupPage;
