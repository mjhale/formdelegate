import * as React from 'react';

import { isTokenCurrent } from 'utils';

import AdminLayout from 'components/Layouts/AdminLayout';
import Card from 'components/Card';

const AdminDashboardPage = () => {
  return (
    <React.Fragment>
      <Card header="Metric Graphs">Coming soon</Card>
      <Card header="Newest Users">Coming soon</Card>
    </React.Fragment>
  );
};

AdminDashboardPage.getLayout = function getLayout(page) {
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

export default AdminDashboardPage;
