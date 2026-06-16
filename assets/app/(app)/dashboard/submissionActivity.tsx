interface ActivityDay {
  day: string;
  submission_count: number;
}

interface CalendarDay {
  count: number;
  date: Date;
  dateKey: string;
  isInRange: boolean;
}

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const INTENSITY_CLASSES = [
  'bg-zinc-100',
  'bg-emerald-100',
  'bg-emerald-300',
  'bg-emerald-500',
  'bg-emerald-700',
];
const MOBILE_ACTIVITY_DAY_LIMIT = 80;
const DESKTOP_ACTIVITY_DAY_LIMIT = 240;

export default function SubmissionActivity({
  activity,
}: {
  activity: ActivityDay[];
}) {
  const mobileCalendar = buildCalendar(activity, MOBILE_ACTIVITY_DAY_LIMIT);
  const desktopCalendar = buildCalendar(activity, DESKTOP_ACTIVITY_DAY_LIMIT);

  if (desktopCalendar.weeks.length === 0) {
    return (
      <section className="border border-grey-600 rounded-t overflow-hidden">
        <div className="bg-carnation-400 text-white border-stone-200 block text-sm font-semibold leading-6 p-2 uppercase">
          Submission Activity
        </div>
        <div className="py-4 px-6 bg-white text-sm text-slate-600">
          No submission activity to show yet.
        </div>
      </section>
    );
  }

  return (
    <section className="border border-grey-600 rounded-t overflow-hidden">
      <div className="bg-carnation-400 text-white border-stone-200 block text-sm font-semibold leading-6 p-2 uppercase">
        Submission Activity
      </div>
      <div className="bg-white px-4 py-5 sm:px-6">
        <ActivityWindow
          calendar={mobileCalendar}
          className="[--activity-cell-size:1.125rem] [--activity-gap:0.375rem] sm:hidden"
          dayLimit={MOBILE_ACTIVITY_DAY_LIMIT}
        />
        <ActivityWindow
          calendar={desktopCalendar}
          className="hidden [--activity-cell-size:0.8125rem] [--activity-gap:0.25rem] sm:block"
          dayLimit={DESKTOP_ACTIVITY_DAY_LIMIT}
        />
      </div>
    </section>
  );
}

function ActivityWindow({
  calendar,
  className,
  dayLimit,
}: {
  calendar: ReturnType<typeof buildCalendar>;
  className: string;
  dayLimit: number;
}) {
  return (
    <div className={className}>
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {calendar.totalSubmissions.toLocaleString()} submissions in the last{' '}
            {dayLimit} days
          </h2>
          <p className="text-xs text-slate-500">
            {formatDisplayDate(calendar.firstActivityDate)} -{' '}
            {formatDisplayDate(calendar.lastActivityDate)}
          </p>
        </div>
      </div>

      <div className="inline-grid max-w-full grid-cols-[auto_1fr] gap-x-2">
        <div className="h-6" />
        <div
          className="grid h-6 gap-[var(--activity-gap)]"
          style={{
            gridTemplateColumns: `repeat(${calendar.weeks.length}, var(--activity-cell-size))`,
          }}
        >
          {calendar.monthLabels.map((monthLabel) => (
            <div
              className="text-xs leading-5 text-slate-500"
              key={`${monthLabel.month}-${monthLabel.weekIndex}`}
              style={{
                gridColumn: `${monthLabel.weekIndex + 1} / span ${
                  monthLabel.span
                }`,
              }}
            >
              {monthLabel.month}
            </div>
          ))}
        </div>

        <div className="grid grid-rows-7 gap-[var(--activity-gap)] pt-px">
          {DAY_LABELS.map((label, index) => (
            <div
              className="h-[var(--activity-cell-size)] text-xs leading-[var(--activity-cell-size)] text-slate-500"
              key={`${label}-${index}`}
            >
              {label}
            </div>
          ))}
        </div>
        <div
          aria-label={`Daily submission activity for the last ${dayLimit} days`}
          className="grid grid-flow-col grid-rows-7 gap-[var(--activity-gap)]"
        >
          {calendar.weeks.flat().map((day) => (
            <div
              aria-label={`${formatDisplayDate(day.date)}: ${
                day.count
              } submissions`}
              className={`h-[var(--activity-cell-size)] w-[var(--activity-cell-size)] rounded-sm ring-1 ring-inset ring-black/5 ${
                day.isInRange
                  ? INTENSITY_CLASSES[
                      getIntensity(day.count, calendar.maxCount)
                    ]
                  : 'bg-transparent ring-transparent'
              }`}
              key={day.dateKey}
              title={`${formatDisplayDate(day.date)}: ${day.count} submissions`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function buildCalendar(activity: ActivityDay[], dayLimit: number) {
  if (!activity || activity.length === 0) {
    return {
      firstActivityDate: new Date(),
      lastActivityDate: new Date(),
      maxCount: 0,
      monthLabels: [],
      totalSubmissions: 0,
      weeks: [],
    };
  }

  const recentActivity = activity.slice(-dayLimit);
  const activityByDate = new Map(
    recentActivity.map((item) => [
      item.day,
      Number(item.submission_count) > 0 ? Number(item.submission_count) : 0,
    ])
  );
  const firstActivityDate = parseDateKey(recentActivity[0].day);
  const lastActivityDate = parseDateKey(
    recentActivity[recentActivity.length - 1].day
  );
  const firstGridDate = startOfWeek(firstActivityDate);
  const lastGridDate = endOfWeek(lastActivityDate);
  const days = eachDay(firstGridDate, lastGridDate).map((date) => {
    const dateKey = toDateKey(date);
    const isInRange = date >= firstActivityDate && date <= lastActivityDate;

    return {
      count: isInRange ? activityByDate.get(dateKey) || 0 : 0,
      date,
      dateKey,
      isInRange,
    };
  });
  const weeks = chunk(days, 7);
  const counts = days.map((day) => day.count);
  const maxCount = Math.max(...counts);

  return {
    firstActivityDate,
    lastActivityDate,
    maxCount,
    monthLabels: buildMonthLabels(weeks),
    totalSubmissions: counts.reduce((total, count) => total + count, 0),
    weeks,
  };
}

function buildMonthLabels(weeks: CalendarDay[][]) {
  return weeks.reduce<
    Array<{
      month: string;
      span: number;
      weekIndex: number;
    }>
  >((labels, week, weekIndex) => {
    const monthStart = week.find((day) => day.date.getDate() === 1);

    if (!monthStart) {
      return labels;
    }

    const nextMonthWeek = weeks.findIndex(
      (candidateWeek, candidateWeekIndex) =>
        candidateWeekIndex > weekIndex &&
        candidateWeek.some((day) => day.date.getDate() === 1)
    );

    labels.push({
      month: MONTH_LABELS[monthStart.date.getMonth()],
      span:
        nextMonthWeek === -1
          ? Math.max(1, weeks.length - weekIndex)
          : Math.max(1, nextMonthWeek - weekIndex),
      weekIndex,
    });

    return labels;
  }, []);
}

function getIntensity(count: number, maxCount: number) {
  if (count <= 0 || maxCount <= 0) {
    return 0;
  }

  return Math.min(4, Math.ceil((count / maxCount) * 4));
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(year, month - 1, day);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function startOfWeek(date: Date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());

  return start;
}

function endOfWeek(date: Date) {
  const end = new Date(date);
  end.setDate(end.getDate() + (6 - end.getDay()));

  return end;
}

function eachDay(startDate: Date, endDate: Date) {
  const days: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}
