'use client';

import ErrorState from './_components/errorState';

export default function Error({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <ErrorState retry={retry} />;
}
