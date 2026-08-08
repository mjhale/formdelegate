'use client';

import { catchError, type ErrorInfo } from 'next/error';

function AsyncPanelErrorFallback(
  { title }: { title: string },
  { retry }: ErrorInfo
) {
  return (
    <div
      className="rounded-md border border-red-200 bg-red-50 p-4 text-red-900"
      role="alert"
    >
      <p>{title}</p>
      <button
        className="mt-2 font-medium underline"
        onClick={() => retry()}
        type="button"
      >
        Try again
      </button>
    </div>
  );
}

export default catchError(AsyncPanelErrorFallback);
