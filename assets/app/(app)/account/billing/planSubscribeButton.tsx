'use client';

import { useState } from 'react';

import { fetchCheckoutSession } from '../actions';

import { Button as ActionButton } from '../../_components/button';

export default function PlanSubscribeButton({
  plan,
  user,
  currentSubscriptionPlanId,
}) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function handleSubscribe(userEmail, stripePriceId) {
    setIsRedirecting(true);
    const checkoutSession = await fetchCheckoutSession(
      userEmail,
      stripePriceId
    );

    if (checkoutSession.statusCode === 500 || !checkoutSession.url) {
      setIsRedirecting(false);
      console.error(
        checkoutSession.message ||
          'Stripe did not return a Checkout Session URL.'
      );
      return;
    }

    window.location.href = checkoutSession.url;
  }

  if (!plan.stripe_price_id) {
    return plan.id === currentSubscriptionPlanId ? (
      <ActionButton size="small" disabled type="button">
        Current plan
      </ActionButton>
    ) : null;
  }

  return (
    <ActionButton
      size="small"
      variant={plan.id === currentSubscriptionPlanId ? 'default' : 'primary'}
      disabled={isRedirecting || plan.id === currentSubscriptionPlanId}
      onClick={() => handleSubscribe(user.email, plan.stripe_price_id)}
      type="button"
    >
      {isRedirecting
        ? 'Redirecting…'
        : plan.id === currentSubscriptionPlanId
          ? 'Current plan'
          : 'Choose plan'}
    </ActionButton>
  );
}
