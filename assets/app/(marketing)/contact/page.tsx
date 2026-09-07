import type { Metadata } from 'next';

import MessageForm from '_components/messageForm';

export default async function ContactPage() {
  const CONTACT_FORM_ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT;

  return (
    <div className="flex flex-col items-center py-8">
      <div className="flex w-full max-w-4xl flex-col gap-y-4">
        <h1 className="text-3xl font-semibold lowercase tracking-wide">
          Contact Us
        </h1>
        <MessageForm
          endpoint={CONTACT_FORM_ENDPOINT}
          formLabel="Contact form"
        />
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Contact Us - Form Delegate',
  description: 'Need to contact Form Delegate? Send us a message at any time.',
};
