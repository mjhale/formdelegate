'use client';

import type { ErrorInfo } from 'next/error';

import { catchError } from 'next/error';

import ErrorState from './errorState';

function AsyncPanelErrorFallback(
  { title }: { title: string },
  { retry }: ErrorInfo
) {
  return <ErrorState title={title} retry={retry} compact />;
}

export default catchError(AsyncPanelErrorFallback);
