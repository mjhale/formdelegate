'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export default function LocalTime({
  dateTime,
  options,
  className,
}: {
  dateTime: string;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
}) {
  const hydrated = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot
  );

  // Locale data and time zones can differ between Node and the browser.
  // Keep the first render identical, then display the reader's local time.
  return (
    <time dateTime={dateTime} className={className}>
      {hydrated
        ? new Date(dateTime).toLocaleString('en-US', options)
        : `${dateTime.slice(0, 16).replace('T', ' ')} UTC`}
    </time>
  );
}
