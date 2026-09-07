import {
  DashboardSkeleton,
  PageHeaderSkeleton,
} from '../_components/skeletons';
export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <DashboardSkeleton />
    </>
  );
}
