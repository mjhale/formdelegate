import type { Metadata } from 'next';
import { connection } from 'next/server';

import { createForm } from '../actions';

import EditorHeader from '../editorHeader';
import Form from '../form';

export default async function NewFormPage() {
  // Prerendering otherwise leaves this action-backed editor empty.
  await connection();

  return (
    <>
      <EditorHeader />

      <Form form={null} saveFormAction={createForm} />
    </>
  );
}

export const metadata: Metadata = {
  title: 'Create Form - Form Delegate',
  description: 'Manage your Form Delegate account details.',
};
