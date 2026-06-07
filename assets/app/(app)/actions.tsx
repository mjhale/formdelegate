'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logoutUser() {
  (await cookies()).delete('access_token');
  (await cookies()).delete('user_id');

  redirect('/');
}
