import { cookies } from 'next/headers';

import Profile from './profile';

async function fetchUser() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const userId = cookieStore.get('user_id')?.value;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/v1/users/${userId}`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const { data } = await res.json();

  return data;
}

export default async function AccountProfilePage() {
  const user = await fetchUser();

  return (
    <>
      <Profile user={user} />
    </>
  );
}
