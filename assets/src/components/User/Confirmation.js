import React, { useEffect } from 'react';
import styled from 'styled-components/macro';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import theme from 'constants/theme';
import translations from 'translations';
import useQuery from 'hooks/useQuery';
import { getCurrentUser } from 'selectors';
import { addNotification, hideNotification } from 'actions/notifications';
import {
  resendUserConfirmation,
  verifyUserConfirmationToken,
} from 'actions/userConfirmation';

import Link from 'components/Link';

const StyledPrimaryLink = styled(Link)`
  color: ${theme.primaryColor};
`;

const ErrorResponseActions = ({
  currentUser,
  errorMessage,
  handleUserConfirmationRequest,
}) => {
  if (!currentUser) {
    return (
      <>
        Please <StyledPrimaryLink href="/login">log in</StyledPrimaryLink> to
        generate a new confirmation link or{' '}
        <StyledPrimaryLink href="/support">contact us</StyledPrimaryLink> for
        assistance.
      </>
    );
  }

  return (
    <>
      {(errorMessage && translations[errorMessage]) ||
        'Sorry, there was an issue with the request.'}{' '}
      <StyledPrimaryLink
        href="/user-confirmation"
        onPress={evt => handleUserConfirmationRequest(evt)}
      >
        Request a new confirmation link
      </StyledPrimaryLink>
    </>
  );
};

const SuccessMessage = () => {
  return (
    <>
      Thank you for confirming your account! All limitations have been lifted
      from your account.
    </>
  );
};

// @TODO: Add error handling for already confirmed users
const UserConfirmation = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const query = useQuery();

  const confirmationToken = query.get('token');
  const currentUser = useSelector(state => getCurrentUser(state));
  const errorMessage = useSelector(
    state => state.userConfirmation.errorMessage
  );
  const isFetchingCurrentUser = useSelector(
    state => state.authentication.isFetching
  );
  const isFetchingUserConfirmation = useSelector(
    state => state.userConfirmation.isFetching
  );

  useEffect(() => {
    if (confirmationToken) {
      dispatch(verifyUserConfirmationToken(confirmationToken));
    }
  }, [confirmationToken, dispatch]);

  useEffect(() => {
    // Hide <App />-level unconfirmed user notification
    dispatch(hideNotification({ key: 'UNCONFIRMED_USER' }));
  }, [currentUser, dispatch]);

  const handleUserConfirmationRequest = evt => {
    evt.preventDefault();

    dispatch(resendUserConfirmation(currentUser));

    dispatch(
      addNotification({
        dismissable: true,
        level: 'success',
        message: 'The confirmation email should appear in your inbox shortly.',
      })
    );

    history.push('/dashboard');
  };

  if (isFetchingUserConfirmation || isFetchingCurrentUser) {
    return <>Loading...</>;
  }

  if (errorMessage || !confirmationToken) {
    return (
      <ErrorResponseActions
        currentUser={currentUser}
        errorMessage={errorMessage}
        handleUserConfirmationRequest={handleUserConfirmationRequest}
      />
    );
  }

  return <SuccessMessage />;
};

export default UserConfirmation;
