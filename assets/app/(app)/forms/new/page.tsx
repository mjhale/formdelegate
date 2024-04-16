import { createForm } from '../actions';

import Form from '../form';

export default async function NewFormPage() {
  return (
    <>
      <h1 className="text-2xl lowercase pb-4 tracking-wide font-semibold">
        Add New Form
      </h1>

      <Form form={null} saveFormAction={createForm} />
    </>
  );
}
