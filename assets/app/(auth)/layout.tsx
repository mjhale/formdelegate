import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-carnation-100 py-4 text-white">
      <div className="mx-auto w-full max-w-lg box-border">
        <section>{children}</section>
        <div className="flex justify-center pt-8 pb-4 my-4 space-x-4">
          <a
            href="https://github.com/mjhale/formdelegate"
            className="text-xs underline text-gray-800"
            target="_blank"
            rel="noopener"
          >
            GitHub
          </a>
          <Link
            href="/privacy"
            className="text-xs underline text-gray-800"
            prefetch={false}
          >
            Privacy Policy
          </Link>
          <Link
            href="/tos"
            className="text-xs underline text-gray-800"
            prefetch={false}
          >
            Terms of Service
          </Link>
          <Link
            href="/contact"
            className="text-xs underline text-gray-800"
            prefetch={false}
          >
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
