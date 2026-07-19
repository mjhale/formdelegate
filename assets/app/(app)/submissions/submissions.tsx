'use client';

import { useState } from 'react';

import SubmissionType from 'types/submission';

import Submission from './submission';
import SubmissionsToolbar from './toolbar';
import type { FormFilterMetadata } from './formFilterSummary';

export default function Submissions({
  submissions,
  pagination,
  formFilterSummary,
  forms,
}: {
  submissions: SubmissionType[];
  pagination: {
    limit: number;
    total: number;
    offset: number;
  };
  formFilterSummary?: string;
  forms?: FormFilterMetadata[];
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
        forms={forms}
      />
      <form id="submissions_management">
        <div className="flex flex-col justify-center gap-3 md:gap-0 md:border md:border-slate-200 md:bg-white">
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
