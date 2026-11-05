import type Submission from 'types/submission';
import LocalTime from './localTime';

const reasons: Record<string, string> = {
  commercial_solicitation: 'Promotional or prize solicitation language',
  credential_request: 'Requests for sensitive credentials',
  many_links: 'Four or more links in the submitted text',
  repeated_content: 'Repeated content on this form within ten minutes',
  submission_burst:
    'Many submissions from this IP on this form within a minute',
  inspection_limit: 'Content exceeds the automatic inspection limit',
  empty_content: 'No readable text was provided',
  review_all: 'This form requires approval for every submission',
  filter_disabled: 'Spam filtering was disabled for this form',
};

export function moderationLabel(submission: Submission): string {
  if (submission.flagged_at) return 'Spam';
  switch (submission.moderation_status) {
    case 'spam':
      return 'Spam';
    case 'review':
      return 'Needs review';
    case 'pending':
      return 'Awaiting classification';
    case 'approved':
      return 'Approved';
    case 'accepted':
      return 'Accepted';
    default:
      return 'Not assessed';
  }
}

export function isHeld(submission: Submission): boolean {
  return (
    Boolean(submission.flagged_at) ||
    ['pending', 'review', 'spam'].includes(submission.moderation_status ?? '')
  );
}

export default function ModerationDetails({
  submission,
}: {
  submission: Submission;
}) {
  const assessment = submission.spam_assessment;
  return (
    <section
      aria-label="Spam review"
      className="rounded-lg border border-line bg-[#faf7f1] p-4 text-xs leading-5"
    >
      <h3 className="font-semibold">{moderationLabel(submission)}</h3>
      {isHeld(submission) && (
        <p className="mt-1">
          Email delivery is on hold. Select this submission and choose Approve
          to release it. Its original content is preserved.
        </p>
      )}
      {submission.moderation_status === 'approved' && (
        <p className="mt-1">
          Approved for delivery. Approving again will not resend completed
          deliveries.
        </p>
      )}
      {assessment && (
        <>
          <p className="mt-2 text-muted">
            Original assessment: {assessment.decision}. Rule score:{' '}
            {assessment.score} (not a probability).
          </p>
          {assessment.reasons.length > 0 ? (
            <ul className="mt-1 list-disc pl-4">
              {assessment.reasons.map((reason) => (
                <li key={reason}>
                  {reasons[reason] ?? reason.replaceAll('_', ' ')}
                </li>
              ))}
            </ul>
          ) : (
            <p>No configured spam signals were found.</p>
          )}
        </>
      )}
      {!assessment && (
        <p className="mt-1 text-muted">
          No automatic assessment is available. For submissions created before
          built-in filtering, approval does not replay historical notifications.
        </p>
      )}
      {submission.reviewed_at && (
        <p className="mt-2 text-muted">
          Last reviewed: <LocalTime dateTime={submission.reviewed_at} />
        </p>
      )}
    </section>
  );
}
