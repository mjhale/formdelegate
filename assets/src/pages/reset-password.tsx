import * as React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import theme from 'constants/theme';

import Button from 'components/Button';
import Card from 'components/Card';
import ResetPasswordForm from 'components/User/ResetPasswordForm';
import ResetPasswordRequest from 'components/User/ResetPasswordRequest';
import Link from 'components/Link';

export const StyledContinueBotton = styled(Button)`
  font-size: 1.166em;
  line-height: 1em;
  min-width: 100px;
  padding: 10px 20px;
  text-align: center;
  width: 100%;
`;

export const StyledFormWrapper = styled.div`
  margin-top: 12px;
`;

export const StyledInstructionText = styled.div`
  color: ${theme.mineBlack};
  font-family: ${theme.systemFont};
  font-size: 0.9rem;
`;

export const StyledPrimaryLink = styled(Link)`
  color: ${theme.primaryColor};
`;

const StyledSignUpWrapper = styled.div`
  color: ${theme.mineBlack};
  font-size: 0.9rem;
  text-align: center;
`;

const StyledWrapper = styled.div`
  padding: 5% 15%;
`;

const SignUpLink = () => {
  return (
    <StyledSignUpWrapper>
      <span>Don't have an account? </span>
      <StyledPrimaryLink href="/register">Sign up</StyledPrimaryLink>
    </StyledSignUpWrapper>
  );
};

const ResetPasswordPage = () => {
  const router = useRouter();
  const { token } = router.query;

  if (token) {
    return (
      <Card>
        <StyledWrapper>
          <ResetPasswordForm token={token} />
        </StyledWrapper>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <StyledWrapper>
          <ResetPasswordRequest />
        </StyledWrapper>
      </Card>
      <SignUpLink />
    </>
  );
};

export default ResetPasswordPage;
