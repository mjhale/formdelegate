import { useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';

import { MAX_WEBHOOK_INTEGRATIONS } from './webhookPayload';

export default function WebhookIntegrations({
  control,
  register,
  getValues,
  setValue,
  errors,
  textControl,
  choiceControl,
  editorButton,
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'webhook_integrations',
  });
  const [notice, setNotice] = useState('');
  const integrations = useWatch({ control, name: 'webhook_integrations' });
  const buttonClass = `${editorButton} border bg-white font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60`;

  function generateSecret(index: number) {
    try {
      const bytes = crypto.getRandomValues(new Uint8Array(32));
      const secret = Array.from(bytes, (byte) =>
        byte.toString(16).padStart(2, '0')
      ).join('');
      setValue(`webhook_integrations.${index}.signing_secret`, secret, {
        shouldDirty: true,
      });
      setNotice(
        `Webhook ${index + 1}: signing secret generated. Copy it to your receiver before saving.`
      );
    } catch {
      setNotice(
        'Secret generation is unavailable. Enter a securely generated signing secret.'
      );
    }
  }

  async function copySecret(index: number) {
    try {
      await navigator.clipboard.writeText(
        getValues(`webhook_integrations.${index}.signing_secret`)
      );
      setNotice(`Webhook ${index + 1}: signing secret copied.`);
    } catch {
      setNotice(
        'Could not copy the secret. Check clipboard permissions and try again.'
      );
    }
  }

  return (
    <section
      className="min-w-0 rounded-xl border border-line bg-white p-5 sm:p-7"
      aria-labelledby="outbound-webhooks-heading"
    >
      <div className="mb-6 flex items-start gap-3 border-b border-[#e7e1d6] pb-5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fbefeb] text-xs font-semibold text-brand-deep">
          04
        </span>
        <div>
          <h2
            id="outbound-webhooks-heading"
            className="text-base font-semibold text-[#303137]"
          >
            Outbound webhooks
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Send a signed JSON POST to your server after a submission is
            accepted or approved. Held submissions and spam are not delivered.
            Retries may produce duplicates; deduplicate using the stable event
            ID.
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Use a public HTTPS endpoint. Enabled destinations are checked when
            saved and before delivery. These settings are separate from the
            browser success redirect.
          </p>
        </div>
      </div>
      {fields.map((field, index) => {
        const prefix = `webhook_integrations.${index}`;
        const existing = Boolean(getValues(`${prefix}.id`));
        const fieldErrors = errors?.[index];
        return (
          <fieldset
            key={field.id}
            className="mb-4 flex min-w-0 flex-col gap-3 rounded-lg border border-line bg-surface p-4 sm:p-5"
          >
            <legend className="px-1 text-sm font-semibold">
              Webhook {index + 1}
            </legend>
            <input
              type="hidden"
              defaultValue={getValues(`${prefix}.id`) ?? ''}
              {...register(`${prefix}.id`)}
            />
            <label
              className="flex items-center gap-3 text-sm"
              htmlFor={`${prefix}.enabled`}
            >
              <input
                type="checkbox"
                id={`${prefix}.enabled`}
                defaultChecked={getValues(`${prefix}.enabled`)}
                className={choiceControl}
                {...register(`${prefix}.enabled`)}
              />
              Enabled
            </label>
            <label className="text-xs font-medium" htmlFor={`${prefix}.url`}>
              Destination URL
            </label>
            <input
              id={`${prefix}.url`}
              type="url"
              defaultValue={getValues(`${prefix}.url`)}
              autoComplete="off"
              className={textControl}
              placeholder="https://hooks.your-domain.com/submissions"
              {...register(`${prefix}.url`)}
              aria-invalid={Boolean(fieldErrors?.url)}
              aria-describedby={`${prefix}.url.errors`}
            />
            <div id={`${prefix}.url.errors`} role="alert">
              {fieldErrors?.url?._errors?.map((message: string) => (
                <p className="text-sm text-red-500" key={message}>
                  {message}
                </p>
              ))}
            </div>
            <label
              className="text-xs font-medium"
              htmlFor={`${prefix}.signing_secret`}
            >
              {existing
                ? 'Replace signing secret (optional)'
                : 'Signing secret'}
            </label>
            <input
              id={`${prefix}.signing_secret`}
              type="password"
              defaultValue=""
              autoComplete="new-password"
              className={textControl}
              {...register(`${prefix}.signing_secret`)}
              aria-invalid={Boolean(fieldErrors?.signing_secret)}
              aria-describedby={`${prefix}.secret.help ${prefix}.secret.errors`}
            />
            <p
              id={`${prefix}.secret.help`}
              className="text-xs leading-5 text-muted"
            >
              {existing
                ? 'Leave blank to keep the existing signing secret. '
                : ''}
              Use 32 to 1024 characters. Copy a new secret to your receiver
              before saving; saved secrets cannot be retrieved.
            </p>
            <div id={`${prefix}.secret.errors`} role="alert">
              {fieldErrors?.signing_secret?._errors?.map((message: string) => (
                <p className="text-sm text-red-500" key={message}>
                  {message}
                </p>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={buttonClass}
                onClick={() => generateSecret(index)}
              >
                Generate signing secret
              </button>
              <button
                type="button"
                className={buttonClass}
                disabled={!integrations?.[index]?.signing_secret}
                onClick={() => copySecret(index)}
              >
                Copy new secret
              </button>
              <button
                type="button"
                className={`${buttonClass} text-red-600`}
                onClick={() => {
                  remove(index);
                  setNotice('');
                }}
              >
                Remove webhook
              </button>
            </div>
            <div role="alert">
              {fieldErrors?._errors?.map((message: string) => (
                <p className="text-sm text-red-500" key={message}>
                  {message}
                </p>
              ))}
              {fieldErrors?.id?._errors?.map((message: string) => (
                <p className="text-sm text-red-500" key={message}>
                  {message}
                </p>
              ))}
            </div>
          </fieldset>
        );
      })}
      <div role="alert">
        {errors?._errors?.map((message: string) => (
          <p className="mb-3 text-sm text-red-500" key={message}>
            {message}
          </p>
        ))}
      </div>
      <p className="mb-3 text-xs leading-5 text-muted">
        Up to 3 webhooks. Each saved webhook needs a valid URL and signing
        secret, even when disabled. Remove an unfinished webhook before saving.
      </p>
      <button
        type="button"
        className={buttonClass}
        disabled={fields.length >= MAX_WEBHOOK_INTEGRATIONS}
        onClick={() => {
          append({ id: null, enabled: true, url: '', signing_secret: '' });
          setNotice('');
        }}
      >
        Add webhook
      </button>
      <p role="status" className="mt-3 text-sm text-muted">
        {notice}
      </p>
    </section>
  );
}
