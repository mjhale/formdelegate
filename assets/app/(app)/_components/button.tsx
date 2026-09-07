import type { ComponentProps } from 'react';

import clsx from 'clsx';
import Link from 'next/link';

type ButtonAppearance = {
  size?: 'default' | 'small' | 'icon';
  variant?: 'default' | 'primary' | 'danger';
};

const variants = {
  default:
    'border-line-strong bg-surface text-[#3d3e45] shadow-button hover:border-[#c8bdae] hover:bg-white hover:shadow-button-hover',
  primary:
    'border-brand-deep bg-brand text-white shadow-button-primary hover:border-brand-dark hover:bg-brand-deep',
  danger:
    'border-[#ecc4be] bg-brand-soft text-brand-deep hover:border-[#c8bdae] hover:bg-white hover:shadow-button-hover',
};

const sizes = {
  default: 'min-h-10 px-[13px] py-2 text-[13px]',
  small: 'min-h-[34px] px-2.5 py-[7px] text-xs',
  icon: 'min-h-[34px] w-[34px] p-0 text-xs',
};

export function buttonClasses({
  className,
  size = 'default',
  variant = 'default',
}: ButtonAppearance & { className?: string } = {}) {
  return clsx(
    'inline-flex items-center justify-center gap-2 rounded-lg border font-[650] leading-none no-underline transition duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-[0.48] disabled:shadow-none aria-disabled:cursor-not-allowed aria-disabled:opacity-[0.48] aria-disabled:shadow-none [&>svg]:size-4',
    variants[variant],
    sizes[size],
    className
  );
}

export function Button({
  className,
  size,
  variant,
  ...props
}: ComponentProps<'button'> & ButtonAppearance) {
  return (
    <button
      className={buttonClasses({ className, size, variant })}
      {...props}
    />
  );
}

export function ButtonLink({
  className,
  size,
  variant,
  ...props
}: ComponentProps<typeof Link> & ButtonAppearance) {
  return (
    <Link className={buttonClasses({ className, size, variant })} {...props} />
  );
}

export function ButtonAnchor({
  className,
  size,
  variant,
  ...props
}: ComponentProps<'a'> & ButtonAppearance) {
  return (
    <a className={buttonClasses({ className, size, variant })} {...props} />
  );
}
