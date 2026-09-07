import type { ComponentPropsWithoutRef } from 'react';

import clsx from 'clsx';

export function Card({
  className,
  ...props
}: ComponentPropsWithoutRef<'section'>) {
  return (
    <section
      className={clsx(
        'overflow-hidden rounded-lg border border-line bg-white',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={clsx(
        'flex min-h-16 items-center justify-between gap-5 border-b border-line-subtle bg-white/[0.52] px-[18px] py-[15px] max-[520px]:flex-col max-[520px]:items-start',
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<'h2'>) {
  return (
    <h2
      className={clsx('m-0 text-sm font-bold tracking-[-0.01em]', className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<'p'>) {
  return (
    <p
      className={clsx('m-0 mt-[3px] text-xs text-muted', className)}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return <div className={clsx('p-5', className)} {...props} />;
}
