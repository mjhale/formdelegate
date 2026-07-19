'use client';

import clsx from 'clsx';
import { useState } from 'react';

import SubmissionType from 'types/submission';

import formatRelativeTime from 'utils/formatRelativeTime';
import { useInterval } from 'utils/useInterval';

export default function Submission({
  submission,
  selectedSubmissionList,
  setSelectedSubmissionList,
}) {
  const [showExpandedView, setShowExpandedView] = useState<boolean>(false);
  const [dateInsertedFromNow, setDateInsertedFromNow] = useState<string>(
    formatRelativeTime(new Date(submission.inserted_at))
  );

  useInterval(() => {
    setDateInsertedFromNow(
      formatRelativeTime(new Date(submission.inserted_at))
    );
  }, 60_000);

  return (
    <div
      className="flex w-full flex-col flex-wrap items-start overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm md:rounded-none md:border-0 md:border-b md:last:border-b-0"
      key={submission.id}
    >
      <div
        className={clsx(
          'flex justify-start items-center w-full border-b-slate-200',
          {
            'bg-gray-200 hover:bg-gray-300': showExpandedView,
            'hover:bg-gray-100': !showExpandedView,
          }
        )}
      >
        <label className="flex min-h-11 min-w-11 items-center justify-center px-3 md:px-4">
          <span className="sr-only">
            Select submission from {submission.sender}
          </span>
          <input
            checked={selectedSubmissionList.has(submission.id)}
            className="h-5 w-5"
            name="submissionSelect"
            onChange={() => {
              setSelectedSubmissionList((prevSelectedSubmissionList) => {
                const nextSelectedSubmissionList = new Set(
                  prevSelectedSubmissionList
                );

                if (prevSelectedSubmissionList.has(submission.id)) {
                  nextSelectedSubmissionList.delete(submission.id);
                } else {
                  nextSelectedSubmissionList.add(submission.id);
                }

                return nextSelectedSubmissionList;
              });
            }}
            type="checkbox"
            value={submission.id}
          />
        </label>
        <div
          className="grid w-full cursor-pointer auto-rows-min grid-cols-3 content-between justify-between gap-x-2 gap-y-1 py-4 pr-4 text-sm text-black select-none md:flex md:content-normal md:items-center md:justify-between md:gap-0 md:pr-2"
          onClick={() => {
            setShowExpandedView(
              (prevShowExpandedView) => !prevShowExpandedView
            );
          }}
        >
          <div className="col-start-1 col-span-2 row-start-1 font-semibold md:w-1/5">
            {submission.sender && submission.sender.length > 25
              ? `${submission.sender.substring(0, 25)}...`
              : submission.sender}
          </div>
          <div className="row-start-2 col-span-full text-gray-800 md:w-3/5 md:text-black">
            {submission.flagged_at && (
              <div className="inline-block mr-0.5">
                <span className="bg-carnation-400 text-white text-xs font-medium me-2 px-2.5 py-0.5 rounded">
                  Spam
                </span>
              </div>
            )}
            {submission.body && submission.body.length > 50
              ? `${submission.body.substring(0, 50)}...`
              : submission.body}
          </div>
          <div
            className="col-start-3 col-span-1 row-start-1 justify-self-end md:items-end md:mr-2 md:w-1/5 md:text-end"
            suppressHydrationWarning={true}
          >
            {dateInsertedFromNow}
          </div>
        </div>
      </div>
      {showExpandedView && <ExpandedSubmissionView submission={submission} />}
    </div>
  );
}

function ExpandedSubmissionView({
  submission,
}: {
  submission: SubmissionType;
}) {
  return (
    <div className="flex flex-col flex-wrap py-4 px-6 w-full bg-gray-100">
      <div className="mb-2">
        <div className="font-bold text-sm">Form</div>
        <div>{submission.form.name}</div>
      </div>
      <div className="mb-2">
        <div className="font-bold text-sm">Submission Date</div>
        <div suppressHydrationWarning={true}>
          {new Date(submission.inserted_at).toLocaleDateString()}
        </div>
      </div>
      {submission.data &&
        Object.keys(submission.data).length > 0 &&
        Object.keys(submission.data).map((key, index) => {
          const fieldValue = submission.data[key];

          // Handle non-string field values such as file upload object
          if (typeof fieldValue !== 'string') {
            // Handle file upload object
            // - A file upload object should always have the following props: url, field_name, file_size
            if (
              Object.prototype.hasOwnProperty.call(fieldValue, 'url') &&
              Object.prototype.hasOwnProperty.call(fieldValue, 'field_name') &&
              Object.prototype.hasOwnProperty.call(fieldValue, 'file_size')
            ) {
              return (
                <div className="mb-2" key={index}>
                  <div className="font-bold text-sm">
                    File Field: {fieldValue.field_name}
                  </div>
                  <div>
                    <a href={fieldValue.url}>{fieldValue.file_name}</a>
                    <>({fieldValue.file_size})</>
                  </div>
                </div>
              );
            }

            // Show an error when a non-string field is unhandled
            return (
              <div className="mb-2" key={submission.id}>
                <div>Unable to load submission field.</div>
              </div>
            );
          }

          // Render string fields
          return (
            <div className="mb-2" key={index}>
              <div className="font-bold text-sm">Field: {key}</div>
              <div>{fieldValue}</div>
            </div>
          );
        })}
    </div>
  );
}
