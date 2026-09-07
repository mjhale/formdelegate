import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../_components/card';
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
const MOBILE_ACTIVITY_DAY_LIMIT = 80;
const DESKTOP_ACTIVITY_DAY_LIMIT = 240;

export default function SubmissionActivity({
  activity,
}: {
  activity: ActivityDay[];
}) {
  const mobileCalendar = buildCalendar(activity, MOBILE_ACTIVITY_DAY_LIMIT);
  const desktopCalendar = buildCalendar(activity, DESKTOP_ACTIVITY_DAY_LIMIT);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Submission activity</CardTitle>
          <CardDescription>
            Daily activity across all forms over the last 240 days.
          </CardDescription>
        </div>
        <div className="flex items-baseline gap-2 [&_span]:text-xs [&_span]:text-muted [&_strong]:text-[21px] [&_strong]:tracking-[-0.03em]">
          <strong>{desktopCalendar.totalSubmissions.toLocaleString()}</strong>
          <span>submissions</span>
        </div>
      </CardHeader>
      <div className="p-5">
        {desktopCalendar.weeks.length === 0 ? (
          <p className="m-0 text-[13px] text-muted">
            No submission activity to show yet.
          </p>
        ) : (
          <>
            <ActivityWindow
              calendar={mobileCalendar}
              className="sm:hidden"
              dayLimit={MOBILE_ACTIVITY_DAY_LIMIT}
            />
            <ActivityWindow
              calendar={desktopCalendar}
              className="hidden sm:block"
              dayLimit={DESKTOP_ACTIVITY_DAY_LIMIT}
            />
          </>
        )}
      </div>
    </Card>
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
      <div className="max-w-full overflow-x-auto pb-0.5 pl-0 pr-0 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          aria-label={`Daily submission activity for the last ${dayLimit} days`}
          className="inline-grid min-w-[650px] grid-cols-[29px_auto] gap-1.5"
        >
          <div />
          <div
            className="grid h-5 grid-cols-[repeat(42,_12px)] gap-1 text-[10px] text-muted [&_span]:whitespace-nowrap"
            style={{
              gridTemplateColumns: `repeat(${calendar.weeks.length}, 12px)`,
            }}
          >
            {calendar.monthLabels.map((monthLabel) => (
              <span
                key={`${monthLabel.month}-${monthLabel.weekIndex}`}
                style={{
                  gridColumn: `${monthLabel.weekIndex + 1} / span ${monthLabel.span}`,
                }}
              >
                {monthLabel.month}
              </span>
            ))}
          </div>
          <div className="grid grid-rows-[repeat(7,12px)] gap-1 text-[9px] leading-[12px] text-[#9899a0]">
            {DAY_LABELS.map((label, index) => (
              <span key={`${label}-${index}`}>{label}</span>
            ))}
          </div>
          <div
            className="grid grid-flow-col grid-cols-[repeat(42,_12px)] grid-rows-[repeat(7,12px)] gap-1"
            style={{
              gridTemplateColumns: `repeat(${calendar.weeks.length}, 12px)`,
            }}
          >
            {calendar.weeks.flat().map((day) => {
              const intensity = day.isInRange
                ? getIntensity(day.count, calendar.maxCount)
                : 0;

              return (
                <span
                  aria-label={`${formatDisplayDate(day.date)}: ${day.count} submissions`}
                  className={activityCellClasses(intensity)}
                  key={day.dateKey}
                  title={`${formatDisplayDate(day.date)}: ${day.count} submissions`}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-[5px] text-[10px] text-muted">
        <span>Less</span>
        <span className={activityCellClasses(0)} />
        <span className={activityCellClasses(1)} />
        <span className={activityCellClasses(2)} />
        <span className={activityCellClasses(3)} />
        <span className={activityCellClasses(4)} />
        <span>More</span>
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
      weeks: [] as CalendarDay[][],
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

    if (!monthStart) return labels;

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
  if (count <= 0 || maxCount <= 0) return 0;
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

const activityLevels = [
  'border-[#7e5d4b]/10 bg-[#f0ece5]',
  'border-[#f3c8c2] bg-[#f8d6d2]',
  'border-[#e98e85] bg-[#eea49d]',
  'border-[#cb574e] bg-[#d9685f]',
  'border-[#932d28] bg-[#a63731]',
];

function activityCellClasses(intensity: number) {
  return `inline-block size-3 rounded-[3px] border ${activityLevels[intensity] ?? activityLevels[0]}`;
}
