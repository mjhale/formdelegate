import type { ComponentProps } from 'react';

import clsx from 'clsx';

export function Input({
  className,
  compact = false,
  search = false,
  ...props
}: ComponentProps<'input'> & { compact?: boolean; search?: boolean }) {
  return (
    <input
      className={clsx(
        'w-full rounded-lg border border-line-strong bg-white py-2 text-[13px] text-[#34353a] shadow-input outline-none transition duration-150 placeholder:text-[#a0a1a5] focus:border-[#d35a51] focus:shadow-input-focus',
        compact ? 'min-h-9' : 'min-h-10',
        search ? 'pl-[38px] pr-3' : 'px-3',
        className
      )}
      {...props}
    />
  );
}
