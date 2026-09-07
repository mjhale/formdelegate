import type { ReactNode } from 'react';

function Block({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`max-w-full animate-pulse rounded-md bg-[#e9e3d9] motion-reduce:animate-none ${className}`}
    />
  );
}
function Loading({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="status" aria-label={label} className="min-w-0 space-y-5">
      <span className="sr-only">{label}…</span>
      <div aria-hidden="true" className="space-y-5">
        {children}
      </div>
    </div>
  );
}
function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-line bg-white">
      <div className="border-b border-[#e7e1d6] p-5">
        <Block className="h-4 w-40" />
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </div>
  );
}
function Fields({ rows = 3 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)]">
          <Block className="h-4 w-24 self-center" />
          <Block className="h-10 w-full" />
        </div>
      ))}
    </>
  );
}
export function PageHeaderSkeleton() {
  return (
    <div aria-hidden="true" className="mb-6 space-y-3">
      <Block className="h-3 w-32" />
      <Block className="h-8 w-56" />
      <Block className="h-4 w-80" />
    </div>
  );
}
export function NavBarSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading navigation"
      className="fixed inset-x-0 top-0 z-10 h-[62px] bg-brand lg:bottom-0 lg:right-auto lg:h-auto lg:w-64"
    >
      <span className="sr-only">Loading navigation…</span>
    </div>
  );
}
export function DashboardSkeleton() {
  return (
    <Loading label="Loading dashboard">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="space-y-4 rounded-xl border border-line bg-white p-5"
          >
            <Block className="h-3 w-24" />
            <Block className="h-8 w-16" />
            <Block className="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Panel>
          <Block className="h-48 w-full" />
        </Panel>
        <Panel>
          <Block className="h-48 w-full" />
        </Panel>
      </div>
    </Loading>
  );
}
export function SubmissionsSkeleton() {
  return (
    <Loading label="Loading submissions">
      <Panel>
        <Block className="h-10 w-full" />
        <Block className="h-8 w-48" />
      </Panel>
      <div className="grid overflow-hidden rounded-xl border border-line bg-white lg:grid-cols-[0.85fr_1.65fr]">
        <div className="divide-y divide-[#e7e1d6] lg:border-r lg:border-line">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="space-y-3 p-5">
              <div className="flex justify-between gap-4">
                <Block className="h-4 w-32" />
                <Block className="h-3 w-10" />
              </div>
              <Block className="h-3 w-24" />
              <Block className="h-3 w-full" />
              <Block className="h-3 w-3/4" />
            </div>
          ))}
        </div>
        <div className="hidden space-y-6 p-7 lg:block">
          <Block className="h-5 w-48" />
          <Block className="h-3 w-36" />
          <Block className="h-40 w-full" />
          <Block className="h-44 w-full" />
        </div>
      </div>
    </Loading>
  );
}
export function FormsSkeleton() {
  return (
    <Loading label="Loading forms">
      <Panel>
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="grid gap-4 border-b border-[#e7e1d6] pb-4 last:border-0 sm:grid-cols-[1fr_1.4fr]"
          >
            <div className="space-y-3">
              <Block className="h-4 w-32" />
              <Block className="h-3 w-24" />
            </div>
            <Block className="h-9 w-full" />
          </div>
        ))}
      </Panel>
      <Panel>
        <Fields rows={2} />
      </Panel>
    </Loading>
  );
}
export function FormDetailsSkeleton() {
  return (
    <Loading label="Loading form details">
      <PageHeaderSkeleton />
      <Panel>
        <Block className="h-12 w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Block className="h-12 w-full" />
          <Block className="h-12 w-full" />
          <Block className="h-12 w-full" />
        </div>
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <Block className="h-24 w-full" />
        </Panel>
        <Panel>
          <Block className="h-24 w-full" />
        </Panel>
      </div>
    </Loading>
  );
}
export function FormEditorSkeleton() {
  return (
    <Loading label="Loading form settings">
      {Array.from({ length: 3 }, (_, i) => (
        <Panel key={i}>
          <Fields rows={i === 0 ? 1 : 3} />
        </Panel>
      ))}
    </Loading>
  );
}
export function AccountProfileSkeleton() {
  return (
    <Loading label="Loading profile">
      <Panel>
        <Fields />
      </Panel>
      <Panel>
        <Fields rows={2} />
      </Panel>
    </Loading>
  );
}
export function BillingSkeleton() {
  return (
    <Loading label="Loading billing">
      <Panel>
        <Fields rows={2} />
      </Panel>
      <div className="grid gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Panel key={i}>
            <Block className="h-8 w-24" />
            <Block className="h-24 w-full" />
            <Block className="h-10 w-full" />
          </Panel>
        ))}
      </div>
    </Loading>
  );
}
export function TeamManagementSkeleton() {
  return (
    <Loading label="Loading team">
      <Panel>
        <Fields rows={1} />
      </Panel>
      <Panel>
        <Fields />
      </Panel>
      <Panel>
        <Fields rows={2} />
      </Panel>
    </Loading>
  );
}
