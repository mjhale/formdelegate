'use client';

import type { EmailIntegrationStatusUpdate } from './reverifyPolicy';
import type { ReactNode } from 'react';
import type {
  EmailIntegration,
  EmailIntegrationInput,
  SubmissionSourcePolicy,
} from 'types/form';

import {
  Fragment,
  useActionState,
  useEffect,
  useState,
  useTransition,
} from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';

import {
  canReverifyEmailIntegration,
  getEmailIntegrationIndexById,
  isReverifyStatusUpdateForIntegration,
} from './reverifyPolicy';

interface IFormInput {
  id: string;
  name: string;
  email_integrations: Array<EmailIntegrationInput>;
  host_rules: Array<{ value: string }>;
  submission_source_policy: SubmissionSourcePolicy;
}

interface IFormActionPayload {
  id: string;
  name: string;
  email_integrations: Array<EmailIntegrationInput>;
  hosts: Array<string>;
  submission_source_policy: SubmissionSourcePolicy;
}

interface IReverifyInput {
  formId: string;
  integrationId: string;
  integrationIndex: number;
  reverifyRequestId: string;
}

interface FormActionState {
  message: ReactNode | null;
  errors: {
    _errors?: Array<string>;
    name?: {
      _errors: Array<string>;
    };
    hosts?: {
      _errors?: Array<string>;
      [index: number]: { _errors?: Array<string> };
    };
    submission_source_policy?: {
      _errors: Array<string>;
    };
    email_integrations?: any;
  };
  emailIntegrationStatusUpdates?: Array<EmailIntegrationStatusUpdate>;
  reverifyIntegrationId?: string;
  reverifyRequestId?: string;
}

const initialState: FormActionState = {
  message: null,
  errors: {},
};

async function unavailableReverifyAction(
  _currentState: FormActionState,
  _payload: IReverifyInput
): Promise<FormActionState> {
  return {
    message: 'Email provider reverify is unavailable.',
    errors: {
      _errors: ['Persisted email integration is required to reverify.'],
    },
  };
}

const integrationErrorFields = [
  ['email_provider', 'Email provider'],
  ['email_provider_config', 'Provider settings'],
  ['email_provider_secrets', 'Provider secrets'],
  ['email_provider_status', 'Verification status'],
  ['email_integration_recipients', 'Recipients'],
  ['verify_provider', 'Verification request'],
] as const;

const providerErrorFields = [
  ['email_provider_config', 'from_address', 'From Address'],
  ['email_provider_config', 'host', 'SMTP Host'],
  ['email_provider_config', 'port', 'SMTP Port'],
  ['email_provider_config', 'username', 'SMTP Username'],
  ['email_provider_config', 'message_stream', 'Message Stream'],
  ['email_provider_secrets', 'password', 'SMTP Password'],
  ['email_provider_secrets', 'server_token', 'Server Token'],
  ['email_provider_secrets', 'api_key', 'API Key'],
] as const;

const providerLabels = {
  smtp: 'SMTP',
  postmark: 'Postmark',
  sendgrid: 'SendGrid',
} as const;

const statusLabels = {
  unconfigured: 'Unconfigured',
  pending_verification: 'Pending verification',
  verified: 'Verified',
  invalid: 'Invalid',
} as const;

export default function Form({
  form,
  saveFormAction,
  reverifyEmailIntegrationAction = unavailableReverifyAction,
}) {
  const [state, formAction] = useActionState<
    FormActionState,
    IFormActionPayload
  >(saveFormAction, initialState);
  const [reverifyState, reverifyFormAction] = useActionState<
    FormActionState,
    IReverifyInput
  >(reverifyEmailIntegrationAction, initialState);
  const [activeReverifyRequestId, setActiveReverifyRequestId] = useState<
    string | null
  >(null);
  const [isPending, startSaveTransition] = useTransition();
  const [isReverifyPending, startReverifyTransition] = useTransition();
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    unregister,
    watch,
    formState: { isDirty },
  } = useForm<IFormInput>({
    defaultValues: {
      id: form?.id ?? '',
      name: form?.name ?? '',
      host_rules:
        (form?.hosts?.length ?? 0) > 0
          ? form.hosts.map((host) => ({ value: host }))
          : [{ value: '' }],
      submission_source_policy:
        form?.submission_source_policy ?? 'unrestricted',
      email_integrations: sanitizeEmailIntegrationDefaults(
        form?.email_integrations
      ),
    },
  });
  const {
    fields: hostRuleFields,
    append: appendHostRule,
    remove: removeHostRule,
  } = useFieldArray({ control, name: 'host_rules' });
  const submissionSourcePolicy = useWatch({
    control,
    name: 'submission_source_policy',
  });

  const onSubmit = handleSubmit((data) => {
    startSaveTransition(() => {
      formAction({
        id: data.id,
        name: data.name,
        email_integrations: data.email_integrations,
        hosts: data.host_rules.map((hostRule) => hostRule.value),
        submission_source_policy: data.submission_source_policy,
      });
    });
  });

  const requestReverify = (
    payload: Omit<IReverifyInput, 'reverifyRequestId'>
  ) => {
    const reverifyRequestId = `${payload.integrationId}:${Date.now()}`;

    setActiveReverifyRequestId(reverifyRequestId);
    startReverifyTransition(() => {
      reverifyFormAction({ ...payload, reverifyRequestId });
    });
  };
  const clearReverifyState = () => setActiveReverifyRequestId(null);

  const activeReverifyState =
    reverifyState.reverifyRequestId === activeReverifyRequestId
      ? reverifyState
      : initialState;
  const reverifyStatusUpdates =
    activeReverifyState.emailIntegrationStatusUpdates;

  useEffect(() => {
    if (!reverifyStatusUpdates) {
      return;
    }

    reverifyStatusUpdates.forEach((statusUpdate) => {
      const integrationIndex = getEmailIntegrationIndexById(
        getValues('email_integrations'),
        statusUpdate.integrationId
      );

      if (integrationIndex === -1) {
        return;
      }

      setValue(
        `email_integrations.${integrationIndex}._email_provider_status`,
        statusUpdate.emailProviderStatus,
        { shouldDirty: false }
      );
      setValue(
        `email_integrations.${integrationIndex}._email_provider_last_verified_at`,
        statusUpdate.emailProviderLastVerifiedAt,
        { shouldDirty: false }
      );

      if (statusUpdate.emailProviderStatus !== 'verified') {
        setValue(
          `email_integrations.${integrationIndex}.email_provider_status`,
          'pending_verification',
          {
            shouldDirty: false,
          }
        );
        setValue(
          `email_integrations.${integrationIndex}.verify_provider`,
          true,
          {
            shouldDirty: false,
          }
        );
      }
    });
  }, [getValues, reverifyStatusUpdates, setValue]);

  return (
    <form
      className="max-w-5xl"
      aria-busy={isReverifyPending || isPending}
      onSubmit={onSubmit}
    >
      <fieldset
        className="m-0 flex min-w-0 flex-col gap-y-6 border-0 p-0"
        disabled={isReverifyPending}
      >
        <section
          className="min-w-0 rounded-xl border border-line bg-white p-5 sm:p-7"
          aria-labelledby="general-settings-heading"
        >
          <div className="mb-6 flex items-start gap-3 border-b border-[#e7e1d6] pb-5 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-[#303137] [&_p]:mt-1 [&_p]:text-sm [&_p]:leading-6 [&_p]:text-muted">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fbefeb] text-xs font-semibold text-brand-deep">
              01
            </span>
            <div>
              <h2 id="general-settings-heading">General settings</h2>
              <p>Give this endpoint a recognizable name for your team.</p>
            </div>
          </div>
          <div className="grid min-w-0 items-start gap-2 py-1 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-5">
            {/* Form id */}
            <input
              {...register(`id`)}
              type="hidden"
              defaultValue={form?.id ?? ''}
            />

            {/* Form name */}
            <label
              className="text-xs font-medium leading-5 text-[#53545c]"
              htmlFor="name"
            >
              Form Name
            </label>
            <input
              {...register(`name`)}
              id="name"
              type="text"
              autoComplete="off"
              className={`${textControl} flex-1 appearance-none`}
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
          {state?.errors?._errors &&
            state.errors._errors.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
          {reverifyState?.errors?._errors &&
            reverifyState.errors._errors.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </section>
        <section
          className="min-w-0 rounded-xl border border-line bg-white p-5 sm:p-7"
          aria-labelledby="allowed-websites-heading"
        >
          <div className="mb-6 flex items-start gap-3 border-b border-[#e7e1d6] pb-5 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-[#303137] [&_p]:mt-1 [&_p]:text-sm [&_p]:leading-6 [&_p]:text-muted">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fbefeb] text-xs font-semibold text-brand-deep">
              02
            </span>
            <div>
              <h2 id="allowed-websites-heading">Allowed websites</h2>
              <p>
                Choose which websites can send submissions to this endpoint.
              </p>
            </div>
          </div>
          <SubmissionSourcesFields
            appendHostRule={appendHostRule}
            hostRuleFields={hostRuleFields}
            policy={submissionSourcePolicy}
            register={register}
            removeHostRule={removeHostRule}
            state={state}
          />
        </section>
        <section
          className="min-w-0 rounded-xl border border-line bg-white p-5 sm:p-7"
          aria-labelledby="email-integrations-heading"
        >
          <div className="mb-6 flex items-start gap-3 border-b border-[#e7e1d6] pb-5 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-[#303137] [&_p]:mt-1 [&_p]:text-sm [&_p]:leading-6 [&_p]:text-muted">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fbefeb] text-xs font-semibold text-brand-deep">
              03
            </span>
            <div>
              <h2 id="email-integrations-heading">Email integrations</h2>
              <p>
                Connect your email provider and choose who receives submission
                notifications.
              </p>
            </div>
          </div>
          <EmailIntegrationsFieldArray
            {...{
              state,
              reverifyState: activeReverifyState,
              control,
              register,
              getValues,
              setValue,
              unregister,
              watch,
              formId: form?.id ?? '',
              clearReverifyState,
              isFormDirty: isDirty,
              isReverifyPending,
              requestReverify,
              reverifyStatusUpdates: reverifyStatusUpdates ?? [],
            }}
          />
        </section>
        <p aria-live="polite" className="sr-only">
          {state?.message && state.message}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-white px-5 py-4">
          <p className="text-xs text-muted">
            Changes take effect when you save this form.
          </p>
          <SubmitButton isPending={isPending} />
        </div>
      </fieldset>
    </form>
  );
}

function SubmissionSourcesFields({
  appendHostRule,
  hostRuleFields,
  policy,
  register,
  removeHostRule,
  state,
}) {
  const hostErrors = submissionSourceHostErrors(state);
  const policyErrors = state?.errors?.submission_source_policy?._errors ?? [];
  const descriptionIds = [
    policyErrors.length > 0 ? 'submission-source-policy-errors' : null,
    hostErrors.length > 0 ? 'host-rules-errors' : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <fieldset
      aria-describedby={descriptionIds || undefined}
      aria-invalid={policyErrors.length > 0 || hostErrors.length > 0}
      className="m-0 flex min-w-0 flex-col gap-y-4 border-0 p-0"
    >
      <legend className="sr-only">Submission sources</legend>

      <label className="flex items-start gap-x-3 rounded-lg border border-[#e7e1d6] bg-[#faf7f1] p-4 has-[:checked]:border-brand has-[:checked]:bg-[#fff5f2]">
        <input
          {...register('submission_source_policy')}
          type="radio"
          value="unrestricted"
          className={`${choiceControl} mt-1`}
        />
        <span>
          <span className="block font-medium">
            Allow submissions from any website
          </span>
          <span className="block text-sm text-gray-600">
            Host rules can be saved below, but they are ignored until
            restrictions are enabled.
          </span>
        </span>
      </label>

      <label className="flex items-start gap-x-3 rounded-lg border border-[#e7e1d6] bg-[#faf7f1] p-4 has-[:checked]:border-brand has-[:checked]:bg-[#fff5f2]">
        <input
          {...register('submission_source_policy')}
          type="radio"
          value="restricted"
          className={`${choiceControl} mt-1`}
        />
        <span>
          <span className="block font-medium">
            Only allow submissions from these websites
          </span>
          <span className="block text-sm text-gray-600">
            Requests without usable browser source information will be denied.
          </span>
        </span>
      </label>

      {policyErrors.length > 0 && (
        <div id="submission-source-policy-errors" role="alert">
          {policyErrors.map((error: string) => (
            <p className="text-sm text-red-700" key={error}>
              {error}
            </p>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-y-3 border-l-2 border-slate-200 pl-4">
        <p id="host-rules-hint" className="text-sm text-gray-600">
          <code>example.com</code> matches only that host.{' '}
          <code>*.example.com</code> matches subdomains, but not the apex
          domain.
        </p>

        {policy === 'unrestricted' && (
          <p className="text-sm text-gray-600">
            These saved rules are inactive while submissions are allowed from
            any website.
          </p>
        )}

        {hostRuleFields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-y-1">
            <div className="flex items-center gap-x-2">
              <label className="sr-only" htmlFor={`host-rule-${index}`}>
                Allowed host {index + 1}
              </label>
              <input
                {...register(`host_rules.${index}.value`)}
                id={`host-rule-${index}`}
                type="text"
                autoComplete="off"
                maxLength={253}
                aria-describedby="host-rules-hint"
                placeholder="example.com"
                className={`${textControl} flex-1 appearance-none`}
              />
              <button
                type="button"
                onClick={() => removeHostRule(index)}
                aria-label={`Remove allowed host ${index + 1}`}
                className={`${editorButton} border bg-white text-gray-600 hover:bg-gray-50`}
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        {hostErrors.length > 0 && (
          <div id="host-rules-errors" role="alert">
            {hostErrors.map((error: string) => (
              <p className="text-sm text-red-700" key={error}>
                {error}
              </p>
            ))}
          </div>
        )}

        <div>
          <button
            type="button"
            disabled={hostRuleFields.length >= 50}
            onClick={() => appendHostRule({ value: '' })}
            className={`${editorButton} border bg-white text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60`}
          >
            Add allowed host
          </button>
        </div>
      </div>
    </fieldset>
  );
}

function submissionSourceHostErrors(state: FormActionState): Array<string> {
  const hosts = state?.errors?.hosts;

  if (!hosts) {
    return [];
  }

  const errors = [
    ...(hosts._errors ?? []),
    ...Object.entries(hosts).flatMap(([key, value]) => {
      if (key === '_errors' || !value || Array.isArray(value)) {
        return [];
      }

      return value._errors ?? [];
    }),
  ];

  return Array.from(new Set(errors));
}

function SubmitButton({ isPending }) {
  return (
    <input
      aria-disabled={isPending}
      disabled={isPending}
      type="submit"
      value={isPending ? 'Saving…' : 'Save form'}
      className={`${submitControl} hover:bg-gray-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer`}
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
            <div className="flex min-w-0 flex-col gap-y-3 rounded-lg border border-[#e7e1d6] bg-[#faf7f1] p-4">
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
              <div className="grid min-w-0 items-start gap-2 py-1 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-5">
                <label
                  className="text-xs font-medium leading-5 text-[#53545c]"
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
                  className={`${textControl} flex-1 appearance-none`}
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
              <div className="grid min-w-0 items-start gap-2 py-1 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-5">
                <label
                  className="text-xs font-medium leading-5 text-[#53545c]"
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
                  className={`${textControl} flex-1 appearance-none`}
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
              <div className="grid min-w-0 items-start gap-2 py-1 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-5">
                <label
                  className="text-xs font-medium leading-5 text-[#53545c]"
                  htmlFor={`email_integrations.${i}.email_integration_recipients.${j}.type`}
                >
                  Recipient Type
                </label>
                <div className="flex-1">
                  <div className="relative inline-block w-full">
                    <select
                      {...register(
                        `email_integrations.${i}.email_integration_recipients.${j}.type`
                      )}
                      id={`email_integrations.${i}.email_integration_recipients.${j}.type`}
                      aria-describedby={`email_integrations.${i}.email_integration_recipients.${j}.type.error`}
                      className={`${textControl} appearance-none`}
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
                        className="h-4 w-4 fill-current"
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
              <div className="flex max-w-xl justify-end">
                <button
                  className={`${editorButton} inline-block font-medium leading-tight text-red-600 whitespace-no-wrap bg-white border hover:bg-gray-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer`}
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
          className={`${editorButton} inline-block font-medium leading-tight text-gray-600 whitespace-no-wrap bg-white border hover:bg-gray-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer`}
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

function EmailIntegrationsFieldArray({
  state,
  reverifyState,
  control,
  register,
  getValues,
  setValue,
  unregister,
  watch,
  formId,
  clearReverifyState,
  isFormDirty,
  isReverifyPending,
  requestReverify,
  reverifyStatusUpdates,
}) {
  const {
    fields: emailIntegrationFields,
    append,
    remove,
  } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'email_integrations', // unique name for your Field Array
  });

  const appendEmailIntegration = () => {
    clearReverifyState();
    append({
      _email_provider_last_verified_at: null,
      _email_provider_status: 'unconfigured',
      id: null,
      enabled: false,
      email_provider: null,
      email_provider_status: 'pending_verification',
      email_integration_recipients: [],
      verify_provider: true,
    });
  };

  const removeEmailIntegration = (index: number) => {
    clearReverifyState();
    remove(index);
  };

  return (
    <>
      {emailIntegrationFields.map((emailIntegration, i) => (
        <Fragment key={emailIntegration.id}>
          <div className="mb-4 flex min-w-0 flex-col gap-3 rounded-lg border border-line bg-surface p-4 sm:p-5">
            <input
              {...register(`email_integrations.${i}.id`)}
              type="hidden"
              name={`email_integrations.${i}.id`}
              defaultValue={getValues(`email_integrations.${i}.id`)}
            />
            <input
              {...register(`email_integrations.${i}._email_provider_status`)}
              type="hidden"
              defaultValue={getValues(
                `email_integrations.${i}._email_provider_status`
              )}
            />
            <input
              {...register(
                `email_integrations.${i}._email_provider_last_verified_at`
              )}
              type="hidden"
              defaultValue={
                getValues(
                  `email_integrations.${i}._email_provider_last_verified_at`
                ) ?? ''
              }
            />
            {getValues(`email_integrations.${i}.email_provider_status`) && (
              <input
                {...register(`email_integrations.${i}.email_provider_status`)}
                type="hidden"
                defaultValue={getValues(
                  `email_integrations.${i}.email_provider_status`
                )}
              />
            )}
            {getValues(`email_integrations.${i}.verify_provider`) === true && (
              <input
                {...register(`email_integrations.${i}.verify_provider`)}
                type="hidden"
                defaultValue="true"
              />
            )}
            <div className="grid min-w-0 items-start gap-2 py-1 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-5">
              <label
                className="text-xs font-medium leading-5 text-[#53545c]"
                htmlFor={`email_integrations.${i}.enabled`}
              >
                Enabled
              </label>
              <div className="flex-1">
                <input
                  {...register(`email_integrations.${i}.enabled`)}
                  id={`email_integrations.${i}.enabled`}
                  className={choiceControl}
                  type="checkbox"
                  defaultChecked={getValues(`email_integrations.${i}.enabled`)}
                />
              </div>
            </div>
            <EmailProviderSetupFields
              index={i}
              register={register}
              getValues={getValues}
              setValue={setValue}
              unregister={unregister}
              provider={watch(`email_integrations.${i}.email_provider`)}
              formId={formId}
              isFormDirty={isFormDirty}
              isReverifyPending={isReverifyPending}
              requestReverify={requestReverify}
              reverifyStatusUpdate={reverifyStatusUpdates.find((statusUpdate) =>
                isReverifyStatusUpdateForIntegration(
                  statusUpdate,
                  getValues(`email_integrations.${i}.id`)
                )
              )}
            />
            <IntegrationErrors
              errors={[state?.errors, reverifyState?.errors]}
              index={i}
              integrationId={getValues(`email_integrations.${i}.id`)}
            />
            <div className="flex max-w-xl py-2">
              <button
                className={`${editorButton} inline-block font-medium leading-tight text-red-600 whitespace-no-wrap bg-white border hover:bg-gray-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer`}
                type="button"
                onClick={() => removeEmailIntegration(i)}
              >
                Remove Integration
              </button>
            </div>
            <h3 className="border-t border-[#e7e1d6] pt-4 text-sm font-semibold">
              Recipients
            </h3>
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
          className={`${editorButton} inline-block font-medium leading-tight text-gray-600 whitespace-no-wrap bg-white border hover:bg-gray-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer`}
          onClick={appendEmailIntegration}
        >
          Add Email Integration
        </button>
      </div>
    </>
  );
}

function EmailProviderSetupFields({
  index: i,
  register,
  getValues,
  setValue,
  unregister,
  provider,
  formId,
  isFormDirty,
  isReverifyPending,
  requestReverify,
  reverifyStatusUpdate,
}) {
  const currentStatus =
    reverifyStatusUpdate?.emailProviderStatus ??
    getValues(`email_integrations.${i}._email_provider_status`) ??
    'unconfigured';
  const lastVerifiedAt = reverifyStatusUpdate
    ? reverifyStatusUpdate.emailProviderLastVerifiedAt
    : getValues(`email_integrations.${i}._email_provider_last_verified_at`);
  const integrationId = getValues(`email_integrations.${i}.id`);
  const isVerified = currentStatus === 'verified';
  const canReverify = canReverifyEmailIntegration({
    currentStatus,
    formId,
    integrationId,
    isDirty: isFormDirty,
    provider,
  });

  const resetProviderFields = (nextProvider) => {
    if (isVerified) {
      return;
    }

    unregister(`email_integrations.${i}.email_provider_config`);
    unregister(`email_integrations.${i}.email_provider_secrets`);
    setValue(`email_integrations.${i}.email_provider_config`, {});
    setValue(`email_integrations.${i}.email_provider_secrets`, {});

    if (nextProvider) {
      setValue(
        `email_integrations.${i}.email_provider_status`,
        'pending_verification'
      );
      setValue(`email_integrations.${i}.verify_provider`, true);
    } else {
      unregister(`email_integrations.${i}.email_provider_status`);
      unregister(`email_integrations.${i}.verify_provider`);
    }
  };

  return (
    <>
      <div className="grid min-w-0 items-start gap-2 py-1 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-5">
        {isVerified ? (
          <>
            <input
              {...register(`email_integrations.${i}.email_provider`)}
              type="hidden"
              defaultValue={getValues(`email_integrations.${i}.email_provider`)}
            />
            <div className="text-xs font-medium leading-5 text-[#53545c]">
              Provider
            </div>
            <div className="flex-1 rounded border px-3 py-2 leading-tight text-gray-700 shadow-sm">
              {formatProviderLabel(provider)}
            </div>
          </>
        ) : (
          <>
            <label
              className="text-xs font-medium leading-5 text-[#53545c]"
              htmlFor={`email_integrations.${i}.email_provider`}
            >
              Provider
            </label>
            <div className="flex-1">
              <select
                {...register(`email_integrations.${i}.email_provider`, {
                  onChange: (event) => resetProviderFields(event.target.value),
                })}
                id={`email_integrations.${i}.email_provider`}
                className={`${textControl} appearance-none`}
                defaultValue={
                  getValues(`email_integrations.${i}.email_provider`) ?? ''
                }
              >
                <option value="">Select provider</option>
                <option value="smtp">{providerLabels.smtp}</option>
                <option value="postmark">{providerLabels.postmark}</option>
                <option value="sendgrid">{providerLabels.sendgrid}</option>
              </select>
            </div>
          </>
        )}
      </div>
      <div className="grid min-w-0 items-start gap-2 py-1 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-5">
        <div className="text-xs font-medium leading-5 text-[#53545c]">
          Status
        </div>
        <div className="flex-1 rounded border px-3 py-2 leading-tight text-gray-700 shadow-sm">
          {formatProviderStatus(currentStatus)}
        </div>
      </div>
      <div className="grid min-w-0 items-start gap-2 py-1 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-5">
        <div className="text-xs font-medium leading-5 text-[#53545c]">
          Last Verified
        </div>
        <div className="flex-1 rounded border px-3 py-2 leading-tight text-gray-700 shadow-sm">
          {formatLastVerifiedAt(lastVerifiedAt)}
        </div>
      </div>
      {canReverify && (
        <div className="flex max-w-xl">
          <div className="text-xs font-medium leading-5 text-[#53545c]" />
          <button
            type="button"
            disabled={isReverifyPending}
            onClick={() =>
              requestReverify({
                formId,
                integrationId,
                integrationIndex: i,
              })
            }
            className={`${editorButton} inline-block font-medium leading-tight text-gray-600 whitespace-no-wrap bg-white border hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer`}
          >
            Reverify Provider
          </button>
        </div>
      )}
      <ProviderConfigFields
        key={provider ?? 'none'}
        index={i}
        register={register}
        getValues={getValues}
        provider={provider}
        readOnly={isVerified}
      />
    </>
  );
}

function ProviderConfigFields({
  index,
  register,
  getValues,
  provider,
  readOnly,
}) {
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(
    () =>
      provider === 'postmark' &&
      Boolean(
        getStringFieldValue(
          getValues(
            `email_integrations.${index}.email_provider_config.message_stream`
          )
        )
      )
  );

  switch (provider) {
    case 'smtp':
      return (
        <>
          <ProviderTextInput
            index={index}
            register={register}
            getValues={getValues}
            path="email_provider_config.from_address"
            label="From Address"
            type="email"
            readOnly={readOnly}
          />
          <ProviderTextInput
            index={index}
            register={register}
            getValues={getValues}
            path="email_provider_config.host"
            label="SMTP Host"
            readOnly={readOnly}
          />
          <ProviderTextInput
            index={index}
            register={register}
            getValues={getValues}
            path="email_provider_config.port"
            label="SMTP Port"
            type="number"
            readOnly={readOnly}
          />
          <ProviderTextInput
            index={index}
            register={register}
            getValues={getValues}
            path="email_provider_config.username"
            label="SMTP Username"
            readOnly={readOnly}
          />
          <ProviderCheckboxInput
            index={index}
            register={register}
            getValues={getValues}
            path="email_provider_config.use_ssl"
            label="Use SSL"
            readOnly={readOnly}
          />
          <ProviderTextInput
            index={index}
            register={register}
            getValues={getValues}
            path="email_provider_secrets.password"
            label="SMTP Password"
            type="password"
            readOnly={readOnly}
          />
        </>
      );

    case 'postmark':
      return (
        <>
          <ProviderTextInput
            index={index}
            register={register}
            getValues={getValues}
            path="email_provider_config.from_address"
            label="From Address"
            type="email"
            readOnly={readOnly}
          />
          <ProviderTextInput
            index={index}
            register={register}
            getValues={getValues}
            path="email_provider_secrets.server_token"
            label="Server Token"
            type="password"
            readOnly={readOnly}
          />
          <details
            className="max-w-xl"
            open={advancedSettingsOpen}
            onToggle={(event) =>
              setAdvancedSettingsOpen(event.currentTarget.open)
            }
          >
            <summary className="py-2 text-sm font-medium text-gray-600 hover:cursor-pointer">
              Advanced settings
            </summary>
            <ProviderTextInput
              index={index}
              register={register}
              getValues={getValues}
              path="email_provider_config.message_stream"
              label="Message Stream"
              readOnly={readOnly}
            />
            <p className="ml-0 mt-1 text-xs text-gray-500">
              Optional. Defaults to Postmark&apos;s outbound transactional
              stream.
            </p>
          </details>
        </>
      );

    case 'sendgrid':
      return (
        <>
          <ProviderTextInput
            index={index}
            register={register}
            getValues={getValues}
            path="email_provider_config.from_address"
            label="From Address"
            type="email"
            readOnly={readOnly}
          />
          <ProviderTextInput
            index={index}
            register={register}
            getValues={getValues}
            path="email_provider_secrets.api_key"
            label="API Key"
            type="password"
            readOnly={readOnly}
          />
        </>
      );

    default:
      return null;
  }
}

function ProviderTextInput({
  index,
  register,
  getValues,
  path,
  label,
  type = 'text',
  readOnly = false,
}) {
  const name = `email_integrations.${index}.${path}`;
  const isSecretField = path.startsWith('email_provider_secrets.');

  if (readOnly && isSecretField) {
    return (
      <div className="grid min-w-0 items-start gap-2 py-1 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-5">
        <label
          className="text-xs font-medium leading-5 text-[#53545c]"
          htmlFor={name}
        >
          {label}
        </label>
        <input
          id={name}
          type={type}
          autoComplete="new-password"
          className={`${textControl} flex-1 appearance-none`}
          defaultValue=""
          disabled
        />
      </div>
    );
  }

  return (
    <div className="grid min-w-0 items-start gap-2 py-1 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-5">
      <label
        className="text-xs font-medium leading-5 text-[#53545c]"
        htmlFor={name}
      >
        {label}
      </label>
      <input
        {...register(name)}
        id={name}
        type={type}
        autoComplete={type === 'password' ? 'new-password' : 'off'}
        className={`${textControl} flex-1 appearance-none`}
        readOnly={readOnly}
        defaultValue={
          type === 'password' ? '' : getStringFieldValue(getValues(name))
        }
      />
    </div>
  );
}

function ProviderCheckboxInput({
  index,
  register,
  getValues,
  path,
  label,
  readOnly = false,
}) {
  const name = `email_integrations.${index}.${path}`;
  const checked = getBooleanFieldValue(getValues(name));

  if (readOnly) {
    return (
      <div className="grid min-w-0 items-start gap-2 py-1 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-5">
        {checked && (
          <input
            {...register(name)}
            type="hidden"
            defaultValue={checked ? 'true' : ''}
          />
        )}
        <div className="text-xs font-medium leading-5 text-[#53545c]">
          {label}
        </div>
        <div className="flex-1">
          <input
            id={name}
            className={choiceControl}
            type="checkbox"
            checked={checked}
            disabled
            readOnly
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 items-start gap-2 py-1 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-5">
      <label
        className="text-xs font-medium leading-5 text-[#53545c]"
        htmlFor={name}
      >
        {label}
      </label>
      <div className="flex-1">
        <input
          {...register(name)}
          id={name}
          className={choiceControl}
          type="checkbox"
          defaultChecked={checked}
        />
      </div>
    </div>
  );
}

function IntegrationErrors({ errors, index, integrationId }) {
  const messages = getIntegrationErrorMessages(errors, index, integrationId);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div aria-live="polite" aria-atomic="true">
      {messages.map((message) => (
        <p className="mt-2 text-sm text-red-500" key={message}>
          {message}
        </p>
      ))}
    </div>
  );
}

function sanitizeEmailIntegrationDefaults(
  emailIntegrations?: Array<EmailIntegration>
): Array<EmailIntegrationInput> {
  return (emailIntegrations ?? []).map((emailIntegration) => {
    const needsVerification =
      emailIntegration.email_provider_status !== 'verified';

    return {
      _email_provider_status: emailIntegration.email_provider_status,
      _email_provider_last_verified_at:
        emailIntegration.email_provider_last_verified_at,
      id: emailIntegration.id,
      enabled: emailIntegration.enabled,
      email_provider: emailIntegration.email_provider,
      email_provider_config: emailIntegration.email_provider_config,
      ...(needsVerification
        ? {
            email_provider_status: 'pending_verification' as const,
            verify_provider: true,
          }
        : { verify_provider: false }),
      email_integration_recipients:
        emailIntegration.email_integration_recipients.map((recipient) => ({
          id: recipient.id,
          name: recipient.name,
          email: recipient.email,
          type: recipient.type,
        })),
    };
  });
}

export function getIntegrationErrorMessages(
  errors,
  index: number,
  integrationId?: unknown
): Array<string> {
  const errorsList = Array.isArray(errors) ? errors : [errors];
  const messages = errorsList.flatMap((errorState) => {
    const integrationErrors = errorState?.email_integrations?.[index];

    if (!integrationErrors) {
      return [];
    }

    if (
      integrationErrors._email_integration_id !== undefined &&
      integrationErrors._email_integration_id !== integrationId
    ) {
      return [];
    }

    const integrationMessages = [...(integrationErrors._errors ?? [])];

    integrationErrorFields.forEach(([field, label]) => {
      integrationErrors[field]?._errors?.forEach((error: string) => {
        integrationMessages.push(`${label}: ${error}`);
      });
    });

    providerErrorFields.forEach(([group, field, label]) => {
      integrationErrors[group]?.[field]?._errors?.forEach((error: string) => {
        integrationMessages.push(`${label}: ${error}`);
      });
    });

    return integrationMessages;
  });

  return messages;
}

function getStringFieldValue(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value);
}

function getBooleanFieldValue(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function formatProviderStatus(status: unknown): string {
  if (typeof status === 'string' && status in statusLabels) {
    return statusLabels[status];
  }

  return statusLabels.unconfigured;
}

function formatProviderLabel(provider: unknown): string {
  if (typeof provider === 'string' && provider in providerLabels) {
    return providerLabels[provider];
  }

  return 'None';
}

function formatLastVerifiedAt(value: unknown): string {
  if (typeof value !== 'string' || value === '') {
    return 'Never';
  }

  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return 'Never';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

// Shared Tailwind recipes for the editor controls.
const textControl =
  'min-h-10 w-full min-w-0 rounded-lg border border-line-strong bg-white px-3 py-2 text-sm leading-5 text-[#303137] shadow-none focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bf453d]/20 disabled:cursor-not-allowed disabled:bg-[#f8f5ef] disabled:text-muted';
const choiceControl =
  'h-4 w-4 shrink-0 accent-brand focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bf453d]/20 disabled:cursor-not-allowed disabled:bg-[#f8f5ef] disabled:text-muted';
const editorButton =
  'min-h-9 rounded-lg border-line-strong px-3 py-2 text-xs shadow-none';
const submitControl =
  'min-h-10 cursor-pointer rounded-lg border border-brand-deep bg-brand px-5 py-2 text-sm font-semibold text-white shadow-none hover:bg-brand-deep disabled:cursor-wait disabled:opacity-60';
