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
      className="flex flex-col flex-wrap items-start w-full shadow-sm"
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
        <div className="flex items-center px-4">
          <input
            checked={selectedSubmissionList.has(submission.id)}
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
        </div>
        <div
          className="grid grid-cols-3 auto-rows-min gap-1 content-between justify-between md:flex md:justify-between md:items-center md:content-normal md:gap-0 text-black cursor-pointer text-sm py-4 pr-2 select-none w-full"
          onClick={() => {
            setShowExpandedView(
              (prevShowExpandedView) => !prevShowExpandedView
            );
          }}
        >
          <div className="font-semibold col-start-1 col-span-2 row-start-1 md:w-1/5">
            {submission.sender && submission.sender.length > 25
              ? `${submission.sender.substring(0, 25)}...`
              : submission.sender}
          </div>
          <div className="row-start-2 col-span-full md:w-3/5">
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
          // Handle non-string field values such as file upload object
          if (typeof submission.data[key] !== 'string') {
            // Handle file upload object
            // - A file upload object should always have the following props: url, field_name, file_size
            if (
              Object.prototype.hasOwnProperty.call(
                submission.data[key],
                'url'
              ) &&
              Object.prototype.hasOwnProperty.call(
                submission.data[key],
                'field_name'
              ) &&
              Object.prototype.hasOwnProperty.call(
                submission.data[key],
                'file_size'
              )
            ) {
              return (
                <div className="mb-2" key={index}>
                  <div className="font-bold text-sm">
                    File Field: {submission.data[key].field_name}
                  </div>
                  <div>
                    <a href={submission.data[key].url}>
                      {submission.data[key].file_name}
                    </a>
                    <>({submission.data[key].file_size})</>
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
              <div>{submission.data[key]}</div>
            </div>
          );
        })}
    </div>
  );
}
