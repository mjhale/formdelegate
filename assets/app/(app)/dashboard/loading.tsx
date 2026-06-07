import { DashboardSkeleton } from '../_components/skeletons';

export default function Loading() {
  return (
    <>
      <h1 className="text-2xl lowercase pb-4 tracking-wide font-semibold">
        my Dashboard
      </h1>
      <DashboardSkeleton />
    </>
  );
}
