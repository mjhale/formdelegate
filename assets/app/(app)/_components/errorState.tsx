'use client';

import { CircleAlert, RefreshCw } from 'lucide-react';
import { useTransition } from 'react';

import { Button as ActionButton, ButtonLink } from './button';

export default function ErrorState({
  title = 'We couldn’t load this page',
  retry,
  compact = false,
}: {
  title?: string;
  retry: () => void;
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <section
      role="alert"
      className={`rounded-xl border border-[#ded8cb] bg-white ${compact ? 'p-5' : 'mx-auto w-full max-w-2xl px-6 py-10 sm:p-12'}`}
    >
      <div className="mb-5 inline-flex rounded-xl bg-[#fbefeb] p-3 text-brand-deep">
        <CircleAlert size={24} aria-hidden="true" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight text-[#303137]">
        {title}
      </h2>
      <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
        Try loading it again. If the problem continues, contact support for
        help.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <ActionButton
          type="button"
          variant={'primary'}
          disabled={pending}
          onClick={() => startTransition(() => retry())}
        >
          <RefreshCw size={16} aria-hidden="true" />
          {pending ? 'Trying again…' : 'Try again'}
        </ActionButton>
        {!compact && (
          <ButtonLink href="/dashboard">Back to dashboard</ButtonLink>
        )}
        <ButtonLink href="/support">Contact support</ButtonLink>
      </div>
    </section>
  );
}
