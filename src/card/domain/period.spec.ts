import { toPeriod } from './period';

const month = (iso: string) => new Date(`${iso}-01T00:00:00Z`);

describe('toPeriod', () => {
  it('counts a closed period in calendar months with both ends included', () => {
    expect(toPeriod(month('2023-06'), month('2024-05'))).toEqual({
      start: '2023-06',
      end: '2024-05',
      months: 12,
    });
  });

  it('counts an open period up to now and keeps the end empty', () => {
    expect(toPeriod(month('2025-07'), null, month('2025-12'))).toEqual({
      start: '2025-07',
      end: null,
      months: 6,
    });
  });

  it('treats a period inside one month as one month', () => {
    expect(toPeriod(month('2024-08'), month('2024-08')).months).toBe(1);
  });
});
