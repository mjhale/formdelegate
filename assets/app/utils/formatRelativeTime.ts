export default function formatRelativeTime(date: Date): string {
  let duration = (date.getTime() - Date.now()) / 1000;
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const timeUnits: Array<{ value: number; name: Intl.RelativeTimeFormatUnit }> =
    [
      { value: 60, name: 'seconds' },
      { value: 60, name: 'minutes' },
      { value: 24, name: 'hours' },
      { value: 7, name: 'days' },
      { value: 4, name: 'weeks' },
      { value: 12, name: 'months' },
      { value: Number.POSITIVE_INFINITY, name: 'years' },
    ];

  for (let i = 0; i <= timeUnits.length; i++) {
    if (Math.abs(duration) < timeUnits[i].value) {
      return formatter.format(Math.round(duration), timeUnits[i].name);
    }

    duration /= timeUnits[i].value;
  }
}
