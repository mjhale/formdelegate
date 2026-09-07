import { FormsSkeleton, PageHeaderSkeleton } from '../_components/skeletons';
export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <FormsSkeleton />
    </>
  );
}
