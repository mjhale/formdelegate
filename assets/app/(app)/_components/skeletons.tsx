import type { ReactNode } from 'react';

function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 ${className}`}
      aria-hidden="true"
    />
  );
}

function SkeletonPanel({
  titleWidth = 'w-44',
  children,
}: {
  titleWidth?: string;
  children: ReactNode;
}) {
  return (
    <div className="border border-grey-600 rounded-t overflow-hidden">
      <div className="bg-carnation-400 rounded-t border-stone-200 p-2">
        <SkeletonBlock className={`h-5 ${titleWidth} bg-carnation-200`} />
      </div>
      <div className="bg-white p-4">{children}</div>
    </div>
  );
}

export function NavBarSkeleton() {
  return (
    <div
      aria-label="Loading account navigation"
      className="fixed inset-0 z-10 h-12 w-full animate-pulse bg-red-900 px-4 lg:static lg:z-0 lg:my-4 lg:ml-4 lg:h-auto lg:w-1/4 lg:rounded-lg xl:w-1/5"
      role="status"
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div
      className="flex flex-col gap-y-4"
      role="status"
      aria-label="Loading dashboard"
    >
      <SkeletonPanel titleWidth="w-52">
        <div className="h-28 overflow-hidden">
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 84 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-3 rounded-sm" />
            ))}
          </div>
        </div>
      </SkeletonPanel>

      <SkeletonPanel titleWidth="w-36">
        <SkeletonBlock className="h-5 w-3/4" />
      </SkeletonPanel>
    </div>
  );
}

export function SubmissionsSkeleton() {
  return (
    <div role="status" aria-label="Loading submissions">
      <div className="flex flex-wrap-reverse justify-between mb-4 gap-y-3 md:flex-wrap">
        <div className="flex justify-between lg:inline-flex gap-x-1.5 w-full md:w-auto">
          <SkeletonBlock className="h-9 w-10 bg-white border border-gray-200" />
          <SkeletonBlock className="h-9 w-28 bg-white border border-gray-200" />
          <SkeletonBlock className="h-9 w-36 bg-white border border-gray-200" />
        </div>
        <div className="flex gap-x-3 justify-between w-full md:w-auto">
          <SkeletonBlock className="h-9 w-48 bg-white border border-gray-200" />
          <SkeletonBlock className="h-9 w-32 bg-white border border-gray-200" />
        </div>
      </div>

      <div className="flex flex-col border border-slate-200 bg-white">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[2.5rem_1fr] items-center border-b border-slate-200 px-4 py-4 last:border-b-0"
          >
            <SkeletonBlock className="h-4 w-4" />
            <div className="grid grid-cols-3 gap-4">
              <SkeletonBlock className="h-4 w-4/5" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-20 justify-self-end" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormsSkeleton() {
  return (
    <div
      className="flex flex-col gap-y-4"
      role="status"
      aria-label="Loading forms"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <SkeletonPanel key={index} titleWidth="w-32">
          <div className="flex flex-wrap gap-2 md:gap-4 justify-center content-between items-center text-center">
            <SkeletonBlock className="h-10 flex-1 min-w-64" />
            <SkeletonBlock className="h-9 w-24 bg-white border border-gray-200" />
          </div>
          <div className="flex gap-x-2 justify-between pt-3">
            <div className="flex gap-x-2">
              <SkeletonBlock className="h-9 w-20 bg-white border border-gray-200" />
              <SkeletonBlock className="h-9 w-32 bg-white border border-gray-200" />
            </div>
            <SkeletonBlock className="h-9 w-24 bg-white border border-gray-200" />
          </div>
        </SkeletonPanel>
      ))}
    </div>
  );
}

export function FormDetailsSkeleton() {
  return (
    <div
      aria-label="Loading form details"
      className="flex max-w-xl flex-col gap-y-4"
      role="status"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="flex h-10 items-center" key={index}>
          <SkeletonBlock className="h-5 w-1/4 max-w-32" />
          <SkeletonBlock className="h-10 flex-1 bg-white border border-gray-200" />
        </div>
      ))}
    </div>
  );
}

export function AccountProfileSkeleton() {
  return (
    <div role="status" aria-label="Loading account profile">
      <div className="flex items-center justify-between mb-4">
        <SkeletonBlock className="h-9 w-52" />
        <SkeletonBlock className="h-8 w-16 bg-white border border-gray-200" />
      </div>

      <hr className="bg-slate-100 mb-5" />

      <div className="rounded-lg bg-white border border-slate-200 p-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center h-14">
            <SkeletonBlock className="h-5 w-1/4 max-w-28" />
            <SkeletonBlock className="h-5 w-1/2 max-w-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BillingSkeleton() {
  return (
    <div role="status" aria-label="Loading billing">
      <SkeletonBlock className="h-9 w-48 mb-4" />

      <hr className="bg-slate-100 mb-5" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="rounded-lg bg-white border shadow-lg p-4" key={index}>
            <SkeletonBlock className="h-7 w-32 mb-6" />
            <div className="space-y-3 mb-6">
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="h-4 w-36" />
              <SkeletonBlock className="h-4 w-32" />
            </div>
            <SkeletonBlock className="h-9 w-28 mx-auto bg-white border border-gray-200" />
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <SkeletonBlock className="h-9 w-36 bg-white border border-gray-200" />
      </div>
    </div>
  );
}

export function TeamManagementSkeleton() {
  return (
    <div role="status" aria-label="Loading team">
      <div className="flex items-center justify-between mb-4">
        <SkeletonBlock className="h-9 w-32" />
        <SkeletonBlock className="h-8 w-24 bg-white border border-gray-200" />
      </div>

      <hr className="bg-slate-100 mb-5" />

      <div className="space-y-8">
        <div>
          <SkeletonBlock className="h-6 w-36 mb-3" />
          <SkeletonBlock className="h-10 w-full max-w-md bg-white border border-gray-200" />
        </div>

        <div>
          <SkeletonBlock className="h-6 w-28 mb-3" />
          <div className="bg-white border border-slate-200">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-4 px-4 py-4 border-b border-slate-200 last:border-b-0"
              >
                <SkeletonBlock className="h-5 w-28" />
                <SkeletonBlock className="h-5 w-44" />
                <SkeletonBlock className="h-5 w-24" />
                <SkeletonBlock className="h-8 w-32 justify-self-end bg-white border border-gray-200" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <SkeletonBlock className="h-6 w-40 mb-3" />
          <SkeletonBlock className="h-10 w-full max-w-md bg-white border border-gray-200" />
        </div>
      </div>
    </div>
  );
}
