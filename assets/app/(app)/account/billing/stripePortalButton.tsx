'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { fetchStripePortalUrl } from '../actions';

import { Button as ActionButton } from '../../_components/button';

export default function StripePortalButton() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function handleManageBilling() {
    setIsRedirecting(true);
    const stripePortalUrl = await fetchStripePortalUrl();
    router.push(stripePortalUrl);
  }

  return (
    <ActionButton
      size="small"
      disabled={isRedirecting}
      onClick={handleManageBilling}
      type="button"
    >
      {isRedirecting ? 'Opening…' : 'Manage billing'}
    </ActionButton>
  );
}
