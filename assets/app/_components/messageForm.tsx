'use client';

import type { MessageFormField, MessageFormState } from './messageFormContract';
import type { ChangeEvent, FormEvent } from 'react';

import clsx from 'clsx';
import { useRef, useState } from 'react';

import {
  buildSubmissionBody,
  fieldErrorState,
  isSuccessfulSubmissionStatus,
  messageInputSchema,
  sentState,
  serviceErrorState,
  validateMessageEndpoint,
} from './messageFormContract';

import { buttonClasses } from '../(app)/_components/button';

type FormField = 'name' | MessageFormField;

interface MessageFormValues {
  email: string;
  message: string;
  name: string;
}

interface MessageFormProps {
  endpoint?: string;
  formLabel: string;
  layout?: 'inline' | 'stacked';
}

const initialValues: MessageFormValues = {
  email: '',
  message: '',
  name: '',
};

export default function MessageForm({
  endpoint,
  formLabel,
  layout = 'inline',
}: MessageFormProps) {
  const stacked = layout === 'stacked';
  const fieldRow = stacked ? 'flex flex-col gap-1.5' : 'flex h-10 items-center';
  const fieldLabel = stacked
    ? 'text-[11px] font-[650] leading-[1.4] text-[#45464c]'
    : 'w-1/4 shrink-0';
  const fieldControl = stacked
    ? 'w-full rounded-lg border border-line-strong bg-white px-[11px] py-[9px] text-[13px] leading-[1.4] text-[#303137] shadow-input transition duration-150 focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/[0.14]'
    : 'flex-1 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow-sm focus:outline-none focus:ring-2';
  const fieldErrors = stacked
    ? 'text-[11px] text-red-700'
    : 'ml-[25%] mt-1 text-sm text-red-700';
  const [values, setValues] = useState<MessageFormValues>(initialValues);
  const [state, setState] = useState<MessageFormState>({ status: 'idle' });
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const validatedEndpoint = validateMessageEndpoint(endpoint);

  function handleChange(
    field: FormField,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const value = event.target.value;

    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setState((currentState) => clearFeedback(currentState, field));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pendingRef.current) {
      return;
    }

    const parsedInput = messageInputSchema.safeParse(values);

    if (!parsedInput.success) {
      setState(fieldErrorState(parsedInput.error));
      return;
    }

    if (!validatedEndpoint) {
      setState(serviceErrorState());
      return;
    }

    const submittedValues = { ...values };
    pendingRef.current = true;
    setPending(true);
    setState({ status: 'idle' });

    try {
      const response = await fetch(validatedEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: buildSubmissionBody(parsedInput.data),
        credentials: 'omit',
        redirect: 'follow',
      });

      if (!isSuccessfulSubmissionStatus(response.status)) {
        setState(serviceErrorState());
        return;
      }

      setValues((currentValues) =>
        clearSubmittedValues(currentValues, submittedValues)
      );
      setState(sentState());
    } catch {
      setState(serviceErrorState());
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  const emailErrors = visibleFieldErrors(state, 'email');
  const messageErrors = visibleFieldErrors(state, 'message');

  return (
    <form
      action={validatedEndpoint || undefined}
      method="POST"
      noValidate
      aria-busy={pending}
      aria-label={formLabel}
      onSubmit={handleSubmit}
      className={stacked ? 'flex flex-col gap-3.5' : 'flex flex-col gap-4'}
    >
      <div className={clsx(fieldRow, !stacked && 'max-w-xl')}>
        <label className={fieldLabel} htmlFor="message-form-name">
          Name
        </label>
        <input
          id="message-form-name"
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(event) => handleChange('name', event)}
          className={clsx(fieldControl, stacked && 'min-h-10')}
        />
      </div>

      <div className={stacked ? 'w-full' : 'max-w-xl'}>
        <div className={fieldRow}>
          <label className={fieldLabel} htmlFor="message-form-email">
            Email address
          </label>
          <input
            id="message-form-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={values.email}
            onChange={(event) => handleChange('email', event)}
            aria-invalid={emailErrors.length > 0}
            aria-describedby={
              emailErrors.length > 0 ? 'message-form-email-error' : undefined
            }
            className={clsx(fieldControl, stacked && 'min-h-10')}
          />
        </div>
        {emailErrors.length > 0 && (
          <p id="message-form-email-error" className={fieldErrors}>
            {emailErrors.join(' ')}
          </p>
        )}
      </div>

      <div className={stacked ? 'w-full' : 'max-w-xl'}>
        <div className={stacked ? fieldRow : 'flex items-start'}>
          <label
            className={clsx(fieldLabel, 'self-start')}
            htmlFor="message-form-message"
          >
            Message
          </label>
          <textarea
            id="message-form-message"
            name="message"
            rows={5}
            required
            value={values.message}
            onChange={(event) => handleChange('message', event)}
            aria-invalid={messageErrors.length > 0}
            aria-describedby={
              messageErrors.length > 0
                ? 'message-form-message-error'
                : undefined
            }
            className={clsx(fieldControl, stacked && 'min-h-[132px] resize-y')}
          />
        </div>
        {messageErrors.length > 0 && (
          <p id="message-form-message-error" className={fieldErrors}>
            {messageErrors.join(' ')}
          </p>
        )}
      </div>

      {state.status === 'service_error' && (
        <p role="alert" className="max-w-xl text-sm text-red-700">
          {state.message}
        </p>
      )}

      {state.status === 'sent' && (
        <p
          role="status"
          aria-live="polite"
          className="max-w-xl text-sm text-green-800"
        >
          {state.message}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className={
            stacked
              ? buttonClasses({ variant: 'primary' })
              : 'whitespace-no-wrap inline-block rounded-md border border-gray-200 bg-white px-3 py-1 text-base font-medium leading-6 text-gray-600 shadow-sm hover:cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 active:shadow active:shadow-neutral-700 disabled:cursor-not-allowed disabled:opacity-60'
          }
        >
          {pending ? 'Sending…' : 'Send Message'}
        </button>
      </div>
    </form>
  );
}

function visibleFieldErrors(
  state: MessageFormState,
  field: MessageFormField
): string[] {
  return state.status === 'field_error' ? state.fieldErrors[field] || [] : [];
}

function clearFeedback(
  state: MessageFormState,
  field: FormField
): MessageFormState {
  if (state.status === 'sent' || state.status === 'service_error') {
    return { status: 'idle' };
  }

  if (state.status !== 'field_error' || field === 'name') {
    return state;
  }

  const fieldErrors = { ...state.fieldErrors };
  delete fieldErrors[field];

  return Object.keys(fieldErrors).length > 0
    ? { status: 'field_error', fieldErrors }
    : { status: 'idle' };
}

function clearSubmittedValues(
  currentValues: MessageFormValues,
  submittedValues: MessageFormValues
): MessageFormValues {
  return {
    name: currentValues.name === submittedValues.name ? '' : currentValues.name,
    email:
      currentValues.email === submittedValues.email ? '' : currentValues.email,
    message:
      currentValues.message === submittedValues.message
        ? ''
        : currentValues.message,
  };
}
