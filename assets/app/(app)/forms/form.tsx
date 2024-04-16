'use client';

import { Fragment, useTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useFormState } from 'react-dom';

interface IFormInput {
  id: string;
  name: string;
  email_integrations: Array<{
    id: string;
    enabled: boolean;
    email_integration_recipients: Array<{
      id: number;
      name: string;
      email: string;
      type: 'to' | 'cc' | 'bcc';
    }>;
  }>;
}

const initialState = {
  message: null,
  errors: {},
};

export default function Form({ form, saveFormAction }) {
  const [state, formAction] = useFormState(saveFormAction, initialState);
  const [isPending, startTransition] = useTransition();
  const { register, control, handleSubmit, getValues } = useForm<IFormInput>({
    defaultValues: {
      id: form?.id ?? null,
      name: form?.name ?? '',
      email_integrations: form?.email_integrations ?? [],
    },
  });

  const onSubmit = handleSubmit((data) => {
    startTransition(() => {
      formAction(data);
    });
  });

  return (
    <form className="flex flex-col gap-y-4" onSubmit={onSubmit}>
      <div className="flex items-center h-10 max-w-xl">
        {/* Form id */}
        <input
          {...register(`id`)}
          type="hidden"
          defaultValue={form?.id ?? null}
        />

        {/* Form name */}
        <label className="flex-0 w-1/4" htmlFor="name">
          Form Name
        </label>
        <input
          {...register(`name`)}
          id="name"
          type="text"
          autoComplete="off"
          className="flex-1 appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
          aria-describedby="name.error"
          defaultValue={form?.name ?? ''}
        />
      </div>
      {state?.errors?.name &&
        state?.errors.name._errors.map((error: string) => (
          <p className="mt-2 text-sm text-red-500" key={error}>
            {error}
          </p>
        ))}

      {/* Email integrations */}
      <div className="text-lg font-semibold">Email Integrations</div>
      <EmailIntegrationsFieldArray
        {...{
          state,
          control,
          register,
          getValues,
        }}
      />

      <p aria-live="polite" className="sr-only">
        {state?.message && state.message}
      </p>

      <div>
        <SubmitButton isPending={isPending} />
      </div>
    </form>
  );
}

function SubmitButton({ isPending }) {
  return (
    <input
      aria-disabled={isPending}
      type="submit"
      value="Save Form"
      className="inline-block px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
    />
  );
}

function EmailRecipientsFieldArray({
  nestIndex: i,
  state,
  control,
  getValues,
  register,
}) {
  const {
    fields: emailRecipientFields,
    remove,
    append,
  } = useFieldArray({
    control,
    name: `email_integrations.${i}.email_integration_recipients`,
  });

  return (
    <>
      {emailRecipientFields.map((recipient, j) => {
        return (
          <Fragment key={recipient.id}>
            <div className="flex flex-col gap-y-2 max-w-xl bg-zinc-50 border border-slate-200 rounded-lg p-4">
              {/* Recipient id */}
              <input
                {...register(
                  `email_integrations.${i}.email_integration_recipients.${j}.id`
                )}
                type="hidden"
                defaultValue={getValues(
                  `email_integrations.${i}.email_integration_recipients.${j}.id`
                )}
              />

              {/* Recipient name */}
              <div className="flex items-center h-10 max-w-xl">
                <label
                  className="flex-0 w-1/4"
                  htmlFor={`email_integrations.${i}.email_integration_recipients.${j}.name`}
                >
                  Recipient Name
                </label>
                <input
                  {...register(
                    `email_integrations.${i}.email_integration_recipients.${j}.name`
                  )}
                  id={`email_integrations.${i}.email_integration_recipients.${j}.name`}
                  aria-describedby={`email_integrations.${i}.email_integration_recipients.${j}.name.error`}
                  type="text"
                  className="flex-1 appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
                  defaultValue={getValues(
                    `email_integrations.${i}.email_integration_recipients.${j}.name`
                  )}
                />
              </div>
              <div
                id={`email_integrations.${i}.email_integration_recipients.${j}.email.name`}
                aria-live="polite"
                aria-atomic="true"
              >
                {state?.errors?.email_integrations?.[i]
                  ?.email_integration_recipients?.[j]?.name &&
                  state?.errors.email_integrations[
                    i
                  ].email_integration_recipients[j].name._errors.map(
                    (error: string) => (
                      <p className="mt-2 text-sm text-red-500" key={error}>
                        {error}
                      </p>
                    )
                  )}
              </div>

              {/* Recipient email */}
              <div className="flex items-center h-10 max-w-xl">
                <label
                  className="flex-0 w-1/4"
                  htmlFor={`email_integrations.${i}.email_integration_recipients.${j}.email`}
                >
                  Recipient Email
                </label>
                <input
                  {...register(
                    `email_integrations.${i}.email_integration_recipients.${j}.email`
                  )}
                  id={`email_integrations.${i}.email_integration_recipients.${j}.email`}
                  aria-describedby={`email_integrations.${i}.email_integration_recipients.${j}.email.error`}
                  type="text"
                  className="flex-1 appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
                  defaultValue={getValues(
                    `email_integrations.${i}.email_integration_recipients.${j}.email`
                  )}
                />
              </div>
              <div
                id={`email_integrations.${i}.email_integration_recipients.${j}.email.error`}
                aria-live="polite"
                aria-atomic="true"
              >
                {state?.errors?.email_integrations?.[i]
                  ?.email_integration_recipients?.[j]?.email &&
                  state?.errors.email_integrations[
                    i
                  ].email_integration_recipients[j].email._errors.map(
                    (error: string) => (
                      <p className="mt-2 text-sm text-red-500" key={error}>
                        {error}
                      </p>
                    )
                  )}
              </div>

              {/* Recipient type */}
              <div className="flex items-center h-10 max-w-xl">
                <label
                  className="flex-0 w-1/4"
                  htmlFor={`email_integrations.${i}.email_integration_recipients.${j}.type`}
                >
                  Recipient Type
                </label>
                <div className="flex-1">
                  <div className="inline-block relative w-full">
                    <select
                      {...register(
                        `email_integrations.${i}.email_integration_recipients.${j}.type`
                      )}
                      id={`email_integrations.${i}.email_integration_recipients.${j}.type`}
                      aria-describedby={`email_integrations.${i}.email_integration_recipients.${j}.type.error`}
                      className="w-full appearance-none shadow-sm border rounded py-2 px-3 pr-8 text-gray-700 leading-tight focus:outline-none focus:ring-2"
                      defaultValue={getValues(
                        `email_integrations.${i}.email_integration_recipients.${j}.type`
                      )}
                    >
                      <option value="to">To</option>
                      <option value="cc">CC</option>
                      <option value="bcc">BCC</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div
                id={`email_integrations.${i}.email_integration_recipients.${j}.type.error`}
                aria-live="polite"
                aria-atomic="true"
              >
                {state?.errors?.email_integrations?.[i]
                  ?.email_integration_recipients?.[j]?.type &&
                  state?.errors.email_integrations[
                    i
                  ].email_integration_recipients[j].type._errors.map(
                    (error: string) => (
                      <p className="mt-2 text-sm text-red-500" key={error}>
                        {error}
                      </p>
                    )
                  )}
              </div>
              <div className="flex justify-end max-w-xl">
                <button
                  className="inline-block px-2 py-1 text-sm font-medium leading-tight text-red-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
                  type="button"
                  onClick={() => remove(j)}
                >
                  Remove Recipient
                </button>
              </div>
            </div>
          </Fragment>
        );
      })}

      <div className="flex max-w-xl pt-2">
        <button
          type="button"
          className="inline-block px-2 py-1 text-sm font-medium leading-tight text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
          onClick={() =>
            append({
              id: null,
              name: '',
              email: '',
              type: 'to',
            })
          }
        >
          Add Recipient
        </button>
      </div>
    </>
  );
}

function EmailIntegrationsFieldArray({ state, control, register, getValues }) {
  const {
    fields: emailIntegrationFields,
    append,
    remove,
  } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'email_integrations', // unique name for your Field Array
  });

  return (
    <>
      {emailIntegrationFields.map((emailIntegration, i) => (
        <Fragment key={emailIntegration.id}>
          <div className="bg-white p-4 flex flex-col gap-y-2 max-w-xl rounded border">
            <input
              {...register(`email_integrations.${i}.id`)}
              type="hidden"
              name={`email_integrations.${i}.id`}
              defaultValue={getValues(`email_integrations.${i}.id`)}
            />
            <div className="flex items-center h-10 max-w-xl">
              <label
                className="flex-0 w-1/4"
                htmlFor={`email_integrations.${i}.enabled`}
              >
                Enabled
              </label>
              <div className="flex-1">
                <input
                  {...register(`email_integrations.${i}.enabled`)}
                  id={`email_integrations.${i}.enabled`}
                  className="w-4 h-4 focus:outline-none focus:ring-2"
                  type="checkbox"
                  defaultChecked={getValues(`email_integrations.${i}.enabled`)}
                />
              </div>
            </div>
            <div className="flex max-w-xl py-2">
              <button
                className="inline-block px-2 py-1 text-sm font-medium leading-tight text-red-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
                type="button"
                onClick={() => remove(i)}
              >
                Remove Integration
              </button>
            </div>
            <div className="text-lg font-semibold">Recipients</div>
            <EmailRecipientsFieldArray
              nestIndex={i}
              {...{ state, control, getValues, register }}
            />
          </div>
        </Fragment>
      ))}

      <div className="flex max-w-xl pt-2">
        <button
          type="button"
          className="inline-block px-2 py-1 text-sm font-medium leading-tight text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
          onClick={() =>
            append({
              id: null,
              enabled: true,
              email_integration_recipients: [
                { id: null, name: '', email: '', type: 'to' },
              ],
            })
          }
        >
          Add Email Integration
        </button>
      </div>
    </>
  );
}
