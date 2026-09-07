'use client';

import type { FormFilterMetadata } from './formFilterSummary';
import type SubmissionType from 'types/submission';

import { useState } from 'react';

import InboxReader from './inboxReader';
import SubmissionsToolbar from './toolbar';

export default function Submissions({
  submissions,
  pagination,
  formFilterSummary,
  forms,
}: {
  submissions: SubmissionType[];
  pagination: { limit: number; total: number; offset: number };
  formFilterSummary?: string;
  forms?: FormFilterMetadata[];
}) {
  const [selectedSubmissionList, setSelectedSubmissionList] = useState<
    Set<string>
  >(new Set());
  const allSelected =
    submissions.length > 0 &&
    selectedSubmissionList.size === submissions.length;

  const toggleAll = () => {
    setSelectedSubmissionList(
      allSelected
        ? new Set<string>()
        : new Set(submissions.map((submission) => submission.id))
    );
  };

  return (
    <>
      <SubmissionsToolbar
        selectedSubmissionList={selectedSubmissionList}
        setSelectedSubmissionList={setSelectedSubmissionList}
        paginationMetadata={pagination}
        formFilterSummary={formFilterSummary}
        forms={forms}
      />
      <InboxReader
        submissions={submissions}
        selected={selectedSubmissionList}
        onSelection={setSelectedSubmissionList}
        allSelected={allSelected}
        toggleAll={toggleAll}
      />
    </>
  );
}
