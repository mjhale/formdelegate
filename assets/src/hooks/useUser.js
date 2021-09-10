import * as React from 'react';
import { useRouter } from 'next/router';

import { getCurrentUser } from 'selectors';
import { fetchUser } from 'actions/users';
import { useAppDispatch, useAppSelector } from 'hooks/useRedux';

const useUser = ({ redirectTo = '', redirectIfFound = false } = {}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const error = useAppSelector((state) => state.authentication.error);
  const isFetching = useAppSelector((state) => state.authentication.isFetching);
  const user = useAppSelector(getCurrentUser);

  if (!user && !isFetching && Object.keys(error).length === 0) {
    dispatch(fetchUser());
  }

  React.useEffect(() => {
    if (!redirectTo || isFetching) return;

    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !user) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && user)
    ) {
      router.push(redirectTo);
    }
  }, [user, isFetching, redirectTo, redirectIfFound, dispatch, router]);

  return { user, isFetching };
};

export default useUser;
