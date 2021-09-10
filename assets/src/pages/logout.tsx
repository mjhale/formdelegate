import * as React from 'react';
import { useRouter } from 'next/router';

import { isTokenCurrent } from 'utils';
import { logoutUser } from 'actions/sessions';
import { useAppDispatch } from 'hooks/useRedux';
import useUser from 'hooks/useUser';

const LogoutPage = () => {
  useUser({
    redirectTo: '/login',
    redirectIfFound: true,
  });

  const dispatch = useAppDispatch();
  const router = useRouter();

  React.useEffect(() => {
    // @TODO: Add error handling if logout action fails
    dispatch(logoutUser()).then(() => router.push('/'));
  }, [dispatch, router]);

  return null;
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

export default LogoutPage;
