import { SubmissionsSkeleton } from '../_components/skeletons';

export default function Loading() {
  return (
    <>
      <h1 className="text-2xl lowercase pb-4 tracking-wide font-semibold">
        Submissions
      </h1>
      <SubmissionsSkeleton />
    </>
  );
}
