import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-amber-50 px-6 text-slate-900">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-carnation-400">404</p>
        <h1 className="mt-2 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm text-slate-600">
          The page you requested does not exist or may have moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-carnation-400 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
