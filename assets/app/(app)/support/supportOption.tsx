import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export default function SupportOption({
  children,
  description,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <article className="min-w-0 rounded-[10px] border border-[#e3ddd2] bg-surface p-[17px]">
      <span className="mb-3.5 grid size-[34px] place-items-center rounded-[9px] border border-[#f0d8d4] bg-brand-soft text-brand-deep">
        <Icon aria-hidden="true" className="size-[17px]" />
      </span>
      <h3 className="mb-[5px] text-[13px] font-[650] text-[#303137]">
        {title}
      </h3>
      <p className="mb-[13px] min-h-[34px] text-[11px] leading-[1.55] text-muted max-[520px]:min-h-0">
        {description}
      </p>
      {children}
    </article>
  );
}
