import * as React from 'react';

import { adminFetchUsers } from 'actions/users';
import { getOrderedUsers } from 'selectors';
import { isTokenCurrent } from 'utils';
import translations from 'translations';
import { useAppDispatch, useAppSelector } from 'hooks/useRedux';

import AdminLayout from 'components/Layouts/AdminLayout';
import Button from 'components/Button';
import Link from 'components/Link';
import Table from 'components/Table';

const userListColumns = [
  {
    field: 'email',
    displayName: translations['userlist_th_email'],
  },
  {
    field: 'name',
    displayName: translations['userlist_th_name'],
  },
  {
    field: 'form_count',
    displayName: translations['userlist_th_form_count'],
  },
  {
    field: 'verified',
    displayFn: (row, col, field) => (
      <div>{row[field] ? 'Verified' : 'Unverified'}</div>
    ),
    displayName: translations['userlist_th_verified'],
  },
  {
    field: 'edit',
    displayFn: (row, col, field) => (
      <Button as={Link} href={`/admin/users/${row['id']}`}>
        Edit
      </Button>
    ),
    displayName: translations['userlist_th_edit'],
  },
];

const AdminUsersPage = () => {
  const dispatch = useAppDispatch();
  const isFetching = useAppSelector((state) => state.users.isFetching);
  const users = useAppSelector((state) => getOrderedUsers(state));

  React.useEffect(() => {
    dispatch(adminFetchUsers());
  }, [dispatch]);

  return (
    <Table columns={userListColumns} data={users} isFetching={isFetching} />
  );
};

AdminUsersPage.getLayout = function getLayout(page) {
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

export default AdminUsersPage;
