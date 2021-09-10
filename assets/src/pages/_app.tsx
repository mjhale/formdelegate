import type { AppProps } from 'next/app';
import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';

import { CookiesProvider } from 'react-cookie';
import { createGlobalStyle } from 'styled-components';
import { normalize } from 'polished';
import * as React from 'react';

import { addNotification, hideNotification } from 'actions/notifications';
import { resendUserConfirmation } from 'actions/userConfirmation';
import theme from 'constants/theme';
import { useAppDispatch } from 'hooks/useRedux';
import { useStore } from 'store';
import useUser from 'hooks/useUser';

import FluidLayout from 'components/Layouts/FluidLayout';
import Head from 'next/head';
import Link from 'components/Link';
import NextLink from 'next/link';
import { Provider } from 'react-redux';

const GlobalStyle = createGlobalStyle`
  ${normalize()}

  body {
    background-color: ${theme.backgroundColor};
    font-family: ${theme.systemFont};
    overflow-x: hidden;
    padding: 0;
  }
`;

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const UserNotificationDispatcher = ({ children }) => {
  const { user } = useUser();
  const dispatch = useAppDispatch();

  const showUserUnconfirmedNotification = () => {
    dispatch(
      addNotification({
        dismissable: false,
        key: 'UNCONFIRMED_USER',
        level: 'notice',
        message: (
          <>
            Please verify your e-mail address.{' '}
            <NextLink href="/user-confirmation" passHref>
              <Link onPress={handleResendUserConfirmation}>Resend email</Link>
            </NextLink>
          </>
        ),
      })
    );
  };

  const handleResendUserConfirmation = (evt) => {
    evt.preventDefault();

    dispatch(
      hideNotification({
        key: 'UNCONFIRMED_USER',
      })
    );

    dispatch(
      addNotification({
        dismissable: true,
        level: 'success',
        message: 'The confirmation email should appear in your inbox shortly.',
      })
    );

    resendUserConfirmation(user);
  };

  // Display alpha build warning
  React.useEffect(() => {
    dispatch(
      addNotification({
        dismissable: false,
        level: 'notice',
        message:
          'Form Delegate is currently in alpha and should be considered unstable.',
      })
    );
  }, [dispatch]);

  return children;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const DEPLOYMENT_ENV = process.env.NEXT_PUBLIC_DEPLOYMENT_ENV;
  const store = useStore(pageProps.initialReduxState);

  // Default to the fluid layout if one is not provided by the component
  const getLayout =
    Component.getLayout ?? ((page) => <FluidLayout>{page}</FluidLayout>);

  return (
    <>
      <Head>
        {DEPLOYMENT_ENV !== 'production' ? (
          <meta name="robots" content="noindex" />
        ) : null}
      </Head>
      <>
        <GlobalStyle />
        <CookiesProvider>
          <Provider store={store}>
            <UserNotificationDispatcher>
              {getLayout(<Component {...pageProps} />)}
            </UserNotificationDispatcher>
          </Provider>
        </CookiesProvider>
      </>
    </>
  );
}
