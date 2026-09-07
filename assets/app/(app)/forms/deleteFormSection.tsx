'use client';

import { useFormStatus } from 'react-dom';

import { deleteForm } from './actions';

import { Button as ActionButton } from '../_components/button';

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <ActionButton
      type="submit"
      disabled={pending}
      size="small"
      variant={'danger'}
    >
      {pending ? 'Deleting…' : 'Delete form'}
    </ActionButton>
  );
}

export default function DeleteFormSection({
  formId,
  formName,
}: {
  formId: string;
  formName: string;
}) {
  return (
    <section
      className="mt-8 max-w-5xl rounded-xl border border-[#edccc7] bg-white p-5 sm:p-6"
      aria-labelledby="delete-form-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2
            id="delete-form-heading"
            className="text-sm font-semibold text-brand-deep"
          >
            Delete form
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Permanently remove this form. Your website will no longer be able to
            submit to this endpoint.
          </p>
        </div>
        <form
          action={deleteForm.bind(null, formId)}
          onSubmit={(event) => {
            if (
              !window.confirm(
                `Permanently delete “${formName}”? This cannot be undone.`
              )
            )
              event.preventDefault();
          }}
        >
          <DeleteButton />
        </form>
      </div>
    </section>
  );
}
