import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../_components/card';

export interface SpamActivityDay {
  day: string;
  submission_count: number;
  spam_count?: number;
}

export function summarizeSpam(activity: SpamActivityDay[]) {
  const days = activity.slice(-30);
  if (
    !days.length ||
    days.some(
      (day) =>
        !Number.isInteger(day.spam_count) ||
        day.spam_count! < 0 ||
        !Number.isInteger(day.submission_count) ||
        day.submission_count < day.spam_count!
    )
  ) {
    return null;
  }

  const spam = days.reduce((total, day) => total + day.spam_count!, 0);
  const submissions = days.reduce(
    (total, day) => total + day.submission_count,
    0
  );
  return {
    days,
    spam,
    submissions,
    rate: submissions ? (spam / submissions) * 100 : 0,
  };
}

export default function SpamAnalysis({
  activity,
}: {
  activity: SpamActivityDay[];
}) {
  const summary = summarizeSpam(activity);
  const daily = summary?.days.slice(-14) ?? [];
  const maxCount = Math.max(1, ...daily.map((day) => day.spam_count!));

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Spam analysis</CardTitle>
          <CardDescription>
            Submissions flagged as spam · last 30 days
          </CardDescription>
        </div>
      </CardHeader>
      {summary ? (
        <div className="space-y-5 p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <strong className="block text-3xl font-semibold tabular-nums text-brand-deep">
                {summary.spam.toLocaleString()}
              </strong>
              <span className="text-xs text-muted">flagged as spam</span>
            </div>
            <div className="text-right">
              <strong className="block text-lg font-semibold tabular-nums">
                {summary.submissions ? `${summary.rate.toFixed(1)}%` : '—'}
              </strong>
              <span className="text-xs text-muted">
                of {summary.submissions.toLocaleString()} submissions
              </span>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-medium text-muted">
              Daily spam · last 14 days
            </p>
            <ol
              aria-label="Daily spam counts by submission date"
              className="flex h-20 items-end gap-1 border-b border-line-subtle pb-1"
            >
              {daily.map((day) => {
                const label = `${day.day}: ${day.spam_count} flagged as spam`;
                return (
                  <li
                    key={day.day}
                    aria-label={label}
                    title={label}
                    className="flex h-full min-w-0 flex-1 items-end"
                  >
                    <span
                      aria-hidden="true"
                      className={
                        day.spam_count
                          ? 'w-full rounded-t-sm bg-brand'
                          : 'h-0.5 w-full bg-line'
                      }
                      style={
                        day.spam_count
                          ? { height: `${(day.spam_count / maxCount) * 100}%` }
                          : undefined
                      }
                    />
                  </li>
                );
              })}
            </ol>
            <div className="mt-2 flex justify-between text-[10px] text-muted">
              <span>{daily[0]?.day}</span>
              <span>{daily.at(-1)?.day}</span>
            </div>
          </div>
          <p className="text-xs leading-5 text-muted">
            {summary.submissions === 0
              ? 'No submissions in this period. '
              : summary.spam === 0
                ? 'No spam flagged in this period. '
                : ''}
            Includes automatic and manual flags, grouped by arrival date.
            Reclassified submissions update these counts.
          </p>
        </div>
      ) : (
        <p className="p-5 text-sm leading-6 text-muted">
          Spam statistics are unavailable. The API must provide daily spam
          counts before this summary can be shown.
        </p>
      )}
    </Card>
  );
}
