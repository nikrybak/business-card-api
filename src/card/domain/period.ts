export interface Period {
  start: string;
  end: string | null;
  months: number;
}

const toMonth = (date: Date): string => date.toISOString().slice(0, 7);

/** An employment period in whole calendar months, both ends included; no end means "until now" */
export function toPeriod(startedAt: Date, endedAt: Date | null, now = new Date()): Period {
  const until = endedAt ?? now;
  const months =
    (until.getUTCFullYear() - startedAt.getUTCFullYear()) * 12 +
    (until.getUTCMonth() - startedAt.getUTCMonth()) +
    1;

  return { start: toMonth(startedAt), end: endedAt && toMonth(endedAt), months };
}
