'use server';

import { revalidatePath } from 'next/cache';

import { getProfileContext } from 'utils/profile';

export async function markSelectedAsSpam(formData: FormData) {
  const selectedSubmissionIds = formData.getAll('submissionSelect');
  const { accessToken, selectedTeam } = await getProfileContext();

  for (const submissionId of selectedSubmissionIds) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/v1/teams/${selectedTeam.id}/submissions/${submissionId}/spam`,
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

  revalidatePath('/submissions');
}

export async function markSelectedAsHam(formData: FormData) {
  const selectedSubmissionIds = formData.getAll('submissionSelect');
  const { accessToken, selectedTeam } = await getProfileContext();

  for (const submissionId of selectedSubmissionIds) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/v1/teams/${selectedTeam.id}/submissions/${submissionId}/ham`,
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

  revalidatePath('/submissions');
}
