import { MONTHS } from './constants';

export const createDateKey = (year, monthIndex, day) => {
  const date = new Date(Date.UTC(year, monthIndex, day));
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const d = date.getUTCDate().toString().padStart(2, '0');
  return `${date.getUTCFullYear()}-${month}-${d}`;
};

export const generateCalendarForYear = (year) => {
  const days = {};
  for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const monthName = MONTHS[monthIndex];
    for (let day = 1; day <= daysInMonth; day++) {
      const key = createDateKey(year, monthIndex, day);
      days[key] = {
        day: day,
        month: monthName,
        locations: '',
        details: '',
        colorId: 'none',
        icons: [],
        year: year,
      };
    }
  }
  return days;
};