import type { Metadata } from 'next';

import { getProfileContext } from 'utils/profile';
import { updateForm } from '../../actions';

import Form from '../../form';

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;

  async function fetchForm() {
    const { accessToken, selectedTeam } = await getProfileContext();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/v1/teams/${selectedTeam.id}/forms/${formId}`,
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

  const form = await fetchForm();

  return (
    <>
      <h1 className="text-3xl lowercase pb-4 tracking-wide font-semibold">
        Edit Form
      </h1>

      <Form form={form} saveFormAction={updateForm} />
    </>
  );
}

export const metadata: Metadata = {
  title: 'Edit Form Details - Form Delegate',
  description: 'Manage your form as well as any integrations.',
};
