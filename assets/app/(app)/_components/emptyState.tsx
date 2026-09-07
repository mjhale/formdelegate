import { Inbox } from 'lucide-react';

import { ButtonLink } from './button';

export default function EmptyState({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center px-5 py-10 text-center">
      <span className="mb-4 rounded-xl bg-[#fbefeb] p-3 text-brand-deep">
        <Inbox size={22} aria-hidden="true" />
      </span>
      <h3 className="text-sm font-semibold text-[#303137]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
        {description}
      </p>
      {href && action && (
        <ButtonLink href={href} className="mt-5">
          {action}
        </ButtonLink>
      )}
    </div>
  );
}
