'use client';

import { Copy } from 'lucide-react';
import { useState } from 'react';

import { publicFormEndpoint } from 'utils/publicFormEndpoint';

import { Button as ActionButton } from '../_components/button';

export default function CopyToClipboardButton({ form }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  return (
    <ActionButton
      aria-label={`Copy endpoint for ${form.name}`}
      size="small"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(publicFormEndpoint(form.id));
          setStatus('copied');
        } catch {
          setStatus('failed');
        }
      }}
      type="button"
    >
      <Copy aria-hidden="true" />
      <span aria-live="polite">
        {status === 'copied'
          ? 'Copied'
          : status === 'failed'
            ? 'Try copy again'
            : 'Copy'}
      </span>
    </ActionButton>
  );
}
