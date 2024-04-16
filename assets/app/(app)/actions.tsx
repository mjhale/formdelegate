'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logoutUser() {
  cookies().delete('access_token');
  cookies().delete('user_id');

  redirect('/');
}
