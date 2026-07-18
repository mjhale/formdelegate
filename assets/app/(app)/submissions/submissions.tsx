'use client';

import { useState } from 'react';

import SubmissionType from 'types/submission';

import Submission from './submission';
import SubmissionsToolbar from './toolbar';

export default function Submissions({
  submissions,
  pagination,
  formFilterSummary,
}: {
  submissions: SubmissionType[];
  pagination: {
    limit: number;
    total: number;
    offset: number;
  };
  formFilterSummary?: string;
}) {
  const [selectedSubmissionList, setSelectedSubmissionList] = useState<
    Set<string>
  >(new Set());

  return (
    <>
      <SubmissionsToolbar
        selectedSubmissionList={selectedSubmissionList}
        setSelectedSubmissionList={setSelectedSubmissionList}
        submissions={submissions}
        paginationMetadata={pagination}
        formFilterSummary={formFilterSummary}
      />
      <form id="submissions_management">
        <div className="flex flex-wrap md:flex-nowrap flex-col justify-center border border-slate-200 bg-white">
          {submissions.map((submission) => (
            <Submission
              selectedSubmissionList={selectedSubmissionList}
              setSelectedSubmissionList={setSelectedSubmissionList}
              submission={submission}
              key={submission.id}
            />
          ))}
        </div>
      </form>
    </>
  );
}
