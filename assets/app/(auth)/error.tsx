'use client';

export default function Error({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="mx-4 rounded-lg border bg-white p-6 text-center text-slate-900 md:mx-0">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="mt-2 text-sm text-slate-600">
        We could not load this page. Please try again.
      </p>
      <button
        type="button"
        className="mt-5 rounded-md bg-carnation-400 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        onClick={() => retry()}
      >
        Try again
      </button>
    </div>
  );
}
