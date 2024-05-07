import '../globals.css';

import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-white bg-carnation-100">
        <div className="mx-auto my-4 w-full max-w-lg box-border">
          <section className="">{children}</section>
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
      </body>
    </html>
  );
}
