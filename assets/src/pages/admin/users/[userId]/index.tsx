import * as React from 'react';
import { useRouter } from 'next/router';

import { adminFetchUser } from 'actions/users';
import { getUser } from 'selectors';
import { isTokenCurrent } from 'utils';
import { useAppDispatch, useAppSelector } from 'hooks/useRedux';

import AdminLayout from 'components/Layouts/AdminLayout';
import Card from 'components/Card';
import Link from 'components/Link';

const AdminUserPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const userId =
    router.query.userId != null ? parseInt(router.query.userId, 10) : null;
  const isFetching = useAppSelector((state) => state.users.isFetching);
  const user = useAppSelector((state) => getUser(state, userId));

  React.useEffect(() => {
    if (userId != null) {
      dispatch(adminFetchUser(userId));
    }
  }, [userId, dispatch]);

  if (isFetching || !user) {
    return <p>Loading user...</p>;
  }

  return (
    <Card header="User Management">
      <div>E-Mail: {user.email}</div>
      <div>Name: {user.name}</div>
      <div>
        <Link href={`/admin/users/${user.id}/edit`}>Edit User</Link>
      </div>
    </Card>
  );
};

AdminUserPage.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
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

export default AdminUserPage;
