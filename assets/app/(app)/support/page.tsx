import type { Metadata } from 'next';

export default async function SupportPage() {
  const SUPPORT_TICKET_ENDPOINT =
    process.env.NEXT_PUBLIC_SUPPORT_TICKET_ENDPOINT;

  return (
    <div className="py-8 flex flex-col items-center">
      <div className="flex flex-col gap-y-4 w-full max-w-4xl">
        <h1 className="text-3xl lowercase tracking-wide font-semibold">
          Support
        </h1>
        <form
          action={SUPPORT_TICKET_ENDPOINT}
          method="POST"
          className="flex flex-col gap-y-4"
        >
          <div className="flex items-center h-10 max-w-xl">
            {/* Name */}
            <label className="flex-0 w-1/4" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="flex-1 appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
            />
          </div>

          <div className="flex items-center h-10 max-w-xl">
            {/* Email */}
            <label className="flex-0 w-1/4" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="text"
              className="flex-1 appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
            />
          </div>

          <div className="flex items-center max-w-xl">
            {/* Message */}
            <label className="flex-0 w-1/4 self-start" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              className="flex-1 appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
            />
          </div>

          <div>
            <input
              type="submit"
              value="Send Message"
              className="inline-block px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Support - Form Delegate',
  description:
    'Need help? We are available through our contact form to help with any issues.',
};
