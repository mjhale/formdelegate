'use client';

import type SubmissionType from 'types/submission';

import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

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
  const selected = selectedSubmissionList.has(submission.id);
  const detailsId = `submission-${submission.id}-details`;

  useInterval(
    () =>
      setDateInsertedFromNow(
        formatRelativeTime(new Date(submission.inserted_at))
      ),
    60_000
  );

  return (
    <article
      className={clsx(
        'border-b border-line-subtle last:border-b-0',
        selected ? 'bg-[#fff7f5]' : 'bg-white/[0.65]'
      )}
    >
      <div
        className={clsx(
          'duration-fast grid grid-cols-[44px_minmax(0,_1fr)] items-stretch px-[13px] py-0 transition-colors hover:bg-[rgba(247,_240,_226,_0.45)] max-lg:grid-cols-[40px_minmax(0,_1fr)] max-[820px]:grid-cols-[34px_minmax(0,_1fr)] max-[820px]:px-[13px] max-[820px]:py-0',
          showExpandedView && 'bg-[#f7f0e2]/[0.45]'
        )}
      >
        <span className="grid place-items-center [&_input]:h-4 [&_input]:w-4 [&_input]:cursor-pointer [&_input]:accent-[#bf453d]">
          <input
            aria-label={`Select submission from ${submission.sender}`}
            checked={selected}
            name="submissionSelect"
            onChange={() =>
              setSelectedSubmissionList((prevSelectedSubmissionList) => {
                const nextSelectedSubmissionList = new Set(
                  prevSelectedSubmissionList
                );
                if (prevSelectedSubmissionList.has(submission.id))
                  nextSelectedSubmissionList.delete(submission.id);
                else nextSelectedSubmissionList.add(submission.id);
                return nextSelectedSubmissionList;
              })
            }
            type="checkbox"
            value={submission.id}
          />
        </span>

        <button
          aria-controls={detailsId}
          aria-expanded={showExpandedView}
          aria-label={`${showExpandedView ? 'Collapse' : 'Expand'} submission from ${submission.sender || 'Unknown sender'}`}
          className="group/trigger grid min-h-[60px] min-w-0 cursor-pointer grid-cols-[minmax(155px,_0.9fr)_minmax(260px,_2.15fr)_100px_28px] items-center gap-x-2.5 border-0 bg-transparent p-0 text-left text-inherit outline-none focus-visible:shadow-[inset_0_0_0_2px_rgba(191,_69,_61,_0.45)] max-lg:grid-cols-[minmax(135px,_0.8fr)_minmax(220px,_1.8fr)_85px_26px] max-lg:gap-x-[7px] max-[820px]:min-h-[78px] max-[820px]:grid-cols-[minmax(0,_1fr)_28px] max-[820px]:grid-rows-[auto_auto] max-[820px]:gap-[5px_9px] max-[820px]:px-0 max-[820px]:py-3"
          onClick={() => setShowExpandedView((previous) => !previous)}
          type="button"
        >
          <span className="min-w-0 max-[820px]:col-start-1 max-[820px]:row-start-1 [&_small]:mt-0.5 [&_small]:block [&_small]:overflow-hidden [&_small]:text-ellipsis [&_small]:whitespace-nowrap [&_small]:text-[10px] [&_small]:text-[#888990] [&_strong]:block [&_strong]:overflow-hidden [&_strong]:text-ellipsis [&_strong]:whitespace-nowrap [&_strong]:text-xs [&_strong]:font-[680] [&_strong]:text-[#2f3035]">
            <strong title={submission.sender}>
              {submission.sender || 'Unknown sender'}
            </strong>
            <small>{submission.form?.name || 'Unknown form'}</small>
          </span>
          <span
            className="flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap text-xs text-[#4c4d53] max-[820px]:col-[1_/_3] max-[820px]:row-start-2 [&_>_span:last-child]:overflow-hidden [&_>_span:last-child]:text-ellipsis"
            title={messagePreview(submission)}
          >
            {submission.flagged_at && (
              <span className="inline-flex min-h-[22px] flex-[0_0_auto] items-center rounded-[4px_7px_7px_4px] border border-l-[3px] border-[#efc2bc] border-l-[#bf453d] bg-[#fff1ef] px-2 py-[3px] text-[9px] font-extrabold uppercase leading-none tracking-[0.045em] text-brand-deep">
                Spam
              </span>
            )}
            <span>{messagePreview(submission)}</span>
          </span>
          <time
            className="whitespace-nowrap text-right text-[11px] text-muted max-[820px]:hidden"
            dateTime={submission.inserted_at}
            suppressHydrationWarning={true}
          >
            {dateInsertedFromNow}
          </time>
          <span
            className="grid h-7 w-7 place-items-center rounded-md text-[#888990] group-hover/trigger:bg-brand-soft group-hover/trigger:text-brand-deep max-[820px]:col-start-2 max-[820px]:row-start-1"
            aria-hidden="true"
          >
            <ChevronDown
              className={clsx(
                'size-3.5 transition-transform duration-150',
                showExpandedView && 'rotate-180'
              )}
            />
          </span>
        </button>
      </div>
      {showExpandedView && (
        <ExpandedSubmissionView id={detailsId} submission={submission} />
      )}
    </article>
  );
}

function ExpandedSubmissionView({
  id,
  submission,
}: {
  id: string;
  submission: SubmissionType;
}) {
  const stringFields = Object.entries(submission.data || {}).filter(
    ([, value]) => typeof value === 'string'
  ) as Array<[string, string]>;
  const fileFields = Object.entries(submission.data || {}).filter(
    ([, value]) => typeof value !== 'string'
  );

  return (
    <dl
      className="grid grid-cols-3 gap-3.5 border-t border-t-[#e5ded3] bg-[rgba(247,_240,_226,_0.5)] pb-[18px] pl-[70px] pr-[19px] pt-4 max-[820px]:grid-cols-1 max-[820px]:pb-4 max-[820px]:pl-[60px] max-[820px]:pr-4 max-[820px]:pt-3.5"
      id={id}
    >
      <Detail label="Form" value={submission.form.name} />
      <Detail
        label="Submission date"
        value={new Date(submission.inserted_at).toLocaleString()}
      />
      <Detail
        label="Sender IP"
        value={submission.sender_ip || 'Not recorded'}
      />
      <Detail
        label="Referrer"
        value={submission.sender_referrer || 'Not recorded'}
      />
      <Detail
        label="User agent"
        value={submission.sender_user_agent || 'Not recorded'}
      />
      {stringFields.map(([key, value]) => (
        <Detail key={key} label={key} value={value} />
      ))}
      {fileFields.map(([key, value]) => {
        if (
          value &&
          typeof value === 'object' &&
          'url' in value &&
          'file_name' in value
        ) {
          return (
            <div
              className="min-w-0 [&_dd]:m-0 [&_dd]:text-[11px] [&_dd]:text-[#424349] [&_dd]:[overflow-wrap:anywhere] [&_dt]:mb-1 [&_dt]:text-[9px] [&_dt]:font-[760] [&_dt]:uppercase [&_dt]:tracking-[0.06em] [&_dt]:text-[#888990]"
              key={key}
            >
              <dt>{key}</dt>
              <dd>
                <a className="underline" href={value.url}>
                  {value.file_name}
                </a>
              </dd>
            </div>
          );
        }

        return (
          <Detail key={key} label={key} value="Unable to load this field." />
        );
      })}
    </dl>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 [&_dd]:m-0 [&_dd]:text-[11px] [&_dd]:text-[#424349] [&_dd]:[overflow-wrap:anywhere] [&_dt]:mb-1 [&_dt]:text-[9px] [&_dt]:font-[760] [&_dt]:uppercase [&_dt]:tracking-[0.06em] [&_dt]:text-[#888990]">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function messagePreview(submission: SubmissionType) {
  if (submission.body?.trim()) return submission.body;

  const firstStringValue = Object.values(submission.data || {}).find(
    (value) => typeof value === 'string' && value.trim().length > 0
  );

  return typeof firstStringValue === 'string'
    ? firstStringValue
    : 'No message preview available.';
}
