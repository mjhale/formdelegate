'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function markSelectedAsSpam(formData: FormData) {
  const selectedSubmissionIds = formData.getAll('submissionSelect');

  for (const submissionId of selectedSubmissionIds) {
    const accessToken = cookies().get('access_token')?.value;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/v1/submissions/${submissionId}/spam`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(
          `Network response failure while marking submission as spam for ${submissionId}`
        );
      }
    } catch (error) {
      throw new Error(
        `Fetch Error: Failed to mark submission as spam for ${submissionId}`
      );
    }
  }

  revalidatePath('/dashboard/submissions');
}

export async function markSelectedAsHam(formData: FormData) {
  const selectedSubmissionIds = formData.getAll('submissionSelect');

  for (const submissionId of selectedSubmissionIds) {
    const accessToken = cookies().get('access_token')?.value;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/v1/submissions/${submissionId}/ham`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error(
          `Network response failure while marking submission as ham for ${submissionId}`
        );
      }
    } catch (error) {
      throw new Error(
        `Fetch Error: Failed to mark submission as ham for ${submissionId}`
      );
    }
  }

  revalidatePath('/dashboard/submissions');
}
