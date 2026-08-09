import type { Metadata } from 'next';

import MessageForm from '_components/messageForm';

export default async function SupportPage() {
  const SUPPORT_TICKET_ENDPOINT =
    process.env.NEXT_PUBLIC_SUPPORT_TICKET_ENDPOINT;

  return (
    <div className="py-8 flex flex-col items-center">
      <div className="flex flex-col gap-y-4 w-full max-w-4xl">
        <h1 className="text-3xl lowercase tracking-wide font-semibold">
          Support
        </h1>
        <MessageForm
          endpoint={SUPPORT_TICKET_ENDPOINT}
          formLabel="Support form"
        />
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Support - Form Delegate',
  description:
    'Need help? We are available through our contact form to help with any issues.',
};
