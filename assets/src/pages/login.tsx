import styled from 'styled-components';
import { useRouter } from 'next/router';

import { isTokenCurrent } from 'utils';
import { loginUser } from 'actions/sessions';
import theme from 'constants/theme';
import translations from 'translations';
import { useAppDispatch, useAppSelector } from 'hooks/useRedux';
import useUser from 'hooks/useUser';

import AuthLayout from 'components/Layouts/AuthLayout';
import Card from 'components/Card';
import Flash from 'components/Flash';
import Link from 'components/Link';
import LoginForm from 'components/Auth/LoginForm';

const LogInContainer = styled.div`
  padding: 5% 15%;
`;

const LogInHeader = styled.h2`
  font-size: 1.75rem;
  font-weight: 300;
  margin: 0 0 2rem 0;
  text-align: center;
`;

const StyledSignUpWrapper = styled.div`
  color: ${theme.mineBlack};
  font-size: 0.9rem;
  text-align: center;
`;

const LoginPage = () => {
  useUser({
    redirectTo: '/dashboard',
    redirectIfFound: true,
  });

  const dispatch = useAppDispatch();
  const router = useRouter();
  const authError = useAppSelector((state) => state.authentication.error);
  const isAuthenticated = useAppSelector(
    (state) => state.authentication.isAuthenticated
  );

  const handleLogin = (credentials, actions) => {
    dispatch(loginUser(credentials))
      .then(() => {
        actions.setSubmitting(false);
        router.push('/dashboard');
      })
      .catch(() => {
        actions.setSubmitting(false);
        return;
      });
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      <Card>
        <LogInContainer>
          <LogInHeader>Sign In</LogInHeader>
          {authError?.type != null &&
            // Do not show INVALID_TOKEN errors on login page it is currently generated whenever a user isn't logged in
            authError.type !== 'INVALID_TOKEN' && (
              <Flash type="error">
                {translations[authError.type] || translations['UNKNOWN_ERROR']}
              </Flash>
            )}
          <LoginForm handleLogin={handleLogin} />
        </LogInContainer>
      </Card>
      <StyledSignUpWrapper>
        <span>Don't have an account? </span>
        <Link href="/signup">Sign up</Link>
      </StyledSignUpWrapper>
    </>
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

LoginPage.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default LoginPage;
