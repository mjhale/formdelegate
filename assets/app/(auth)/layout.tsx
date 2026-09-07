import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-carnation-100 py-4 text-white">
      <div className="mx-auto box-border w-full max-w-lg">
        <section>{children}</section>
        <div className="my-4 flex justify-center space-x-4 pb-4 pt-8">
          <a
            href="https://github.com/mjhale/formdelegate"
            className="text-xs text-gray-800 underline"
            target="_blank"
            rel="noopener"
          >
            GitHub
          </a>
          <Link
            href="/privacy"
            className="text-xs text-gray-800 underline"
            prefetch={false}
          >
            Privacy Policy
          </Link>
          <Link
            href="/tos"
            className="text-xs text-gray-800 underline"
            prefetch={false}
          >
            Terms of Service
          </Link>
          <Link
            href="/contact"
            className="text-xs text-gray-800 underline"
            prefetch={false}
          >
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
