import {
  PageHeaderSkeleton,
  SubmissionsSkeleton,
} from '../_components/skeletons';
export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <SubmissionsSkeleton />
    </>
  );
}
