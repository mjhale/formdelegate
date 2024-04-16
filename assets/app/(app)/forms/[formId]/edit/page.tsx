import { cookies } from 'next/headers';

import { updateForm } from '../../actions';

import Form from '../../form';

export default async function EditFormPage({
  params,
}: {
  params: { formId: string };
}) {
  async function fetchForm() {
    const accessToken = cookies().get('access_token')?.value;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/v1/forms/${params.formId}`,
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
