'use client';

import type { ChangeEvent, FormEvent } from 'react';

import { useRef, useState } from 'react';

import {
  type MessageFormField,
  type MessageFormState,
  buildSubmissionBody,
  fieldErrorState,
  isSuccessfulSubmissionStatus,
  messageInputSchema,
  sentState,
  serviceErrorState,
  validateMessageEndpoint,
} from './messageFormContract';

type FormField = 'name' | MessageFormField;

interface MessageFormValues {
  email: string;
  message: string;
  name: string;
}

interface MessageFormProps {
  endpoint?: string;
  formLabel: string;
}

const initialValues: MessageFormValues = {
  email: '',
  message: '',
  name: '',
};

export default function MessageForm({ endpoint, formLabel }: MessageFormProps) {
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
      className="flex flex-col gap-y-4"
    >
      <div className="flex items-center h-10 max-w-xl">
        <label className="flex-0 w-1/4" htmlFor="message-form-name">
          Name
        </label>
        <input
          id="message-form-name"
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(event) => handleChange('name', event)}
          className="flex-1 appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
        />
      </div>

      <div className="max-w-xl">
        <div className="flex items-center h-10">
          <label className="flex-0 w-1/4" htmlFor="message-form-email">
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
            className="flex-1 appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
          />
        </div>
        {emailErrors.length > 0 && (
          <p
            id="message-form-email-error"
            className="ml-[25%] mt-1 text-sm text-red-700"
          >
            {emailErrors.join(' ')}
          </p>
        )}
      </div>

      <div className="max-w-xl">
        <div className="flex items-start">
          <label
            className="flex-0 w-1/4 self-start"
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
            className="flex-1 appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
          />
        </div>
        {messageErrors.length > 0 && (
          <p
            id="message-form-message-error"
            className="ml-[25%] mt-1 text-sm text-red-700"
          >
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
          className="inline-block px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
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
