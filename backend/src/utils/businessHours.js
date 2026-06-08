const { isJapaneseHoliday } = require('../config/holidays');

// JST is UTC+9 with no DST — the offset is always constant.
const JST_OFFSET_MS  = 9 * 60 * 60 * 1000;
const ONE_HOUR_MS    = 60 * 60 * 1000;
const ONE_DAY_MS     = 24 * 60 * 60 * 1000;
const BIZ_START_HOUR = 9;   // inclusive
const BIZ_END_HOUR   = 18;  // exclusive

/**
 * Decompose a UTC Date into its JST calendar components.
 */
const toJST = (date) => {
  const jst   = new Date(date.getTime() + JST_OFFSET_MS);
  const year  = jst.getUTCFullYear();
  const month = jst.getUTCMonth() + 1;
  const day   = jst.getUTCDate();
  return {
    year,
    month,
    day,
    hour:       jst.getUTCHours(),
    dayOfWeek:  jst.getUTCDay(), // 0 = Sunday
    dateString: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  };
};

// 09:00 JST on a JST calendar date equals 00:00 UTC on the same date.
const jstDayStart = (year, month, day) =>
  new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

// 18:00 JST on a JST calendar date equals 09:00 UTC on the same date.
const jstDayEnd = (year, month, day) =>
  new Date(Date.UTC(year, month - 1, day, 9, 0, 0));

const isWeekdayJST = (dayOfWeek) => dayOfWeek >= 1 && dayOfWeek <= 5;

/**
 * Returns true if `date` falls within 09:00–18:00 JST on a business day.
 */
const isBusinessHour = (date) => {
  const { dayOfWeek, hour, dateString } = toJST(date);
  return isWeekdayJST(dayOfWeek)
    && hour >= BIZ_START_HOUR && hour < BIZ_END_HOUR
    && !isJapaneseHoliday(dateString);
};

/**
 * Returns a Date representing 09:00 JST on the next business day after `date`.
 * "Next" means the next JST calendar day (even if `date` is already within business hours).
 */
const getNextBusinessDayStart = (date) => {
  const { year, month, day } = toJST(date);
  // 09:00 JST on the next calendar day = 00:00 UTC next day = today's start + 24 h
  let next = new Date(jstDayStart(year, month, day).getTime() + ONE_DAY_MS);

  for (let i = 0; i < 365; i++) {
    const { dayOfWeek, dateString } = toJST(next);
    if (isWeekdayJST(dayOfWeek) && !isJapaneseHoliday(dateString)) return next;
    next = new Date(next.getTime() + ONE_DAY_MS);
  }

  throw new Error('getNextBusinessDayStart: no business day found within 365 days');
};

/**
 * Snap `date` to the current or next business start:
 *   - If already in business hours → return unchanged.
 *   - If before 09:00 JST on a business day → snap to 09:00 JST today.
 *   - If after 18:00 JST, or on a weekend/holiday → advance to next business day 09:00.
 */
const snapToBusinessStart = (date) => {
  const { year, month, day, hour, dayOfWeek, dateString } = toJST(date);

  if (isWeekdayJST(dayOfWeek) && !isJapaneseHoliday(dateString)) {
    if (hour >= BIZ_START_HOUR && hour < BIZ_END_HOUR) return new Date(date);
    if (hour < BIZ_START_HOUR) return jstDayStart(year, month, day);
  }
  // After-hours, weekend or holiday
  return getNextBusinessDayStart(date);
};

/**
 * Return a new Date that is exactly `hours` business hours after `startDate`.
 * If `startDate` is outside business hours, counting begins at the next business start.
 */
const addBusinessHours = (startDate, hours) => {
  if (hours <= 0) return new Date(startDate);

  let current   = snapToBusinessStart(new Date(startDate));
  let remaining = hours;

  while (remaining > 0) {
    const { year, month, day } = toJST(current);
    const endOfDay = jstDayEnd(year, month, day);

    const msLeft       = endOfDay.getTime() - current.getTime();
    const hoursLeft    = msLeft / ONE_HOUR_MS;

    if (remaining <= hoursLeft) {
      current   = new Date(current.getTime() + remaining * ONE_HOUR_MS);
      remaining = 0;
    } else {
      remaining -= hoursLeft;
      current    = getNextBusinessDayStart(current);
    }
  }

  return current;
};

/**
 * Count the number of business hours between two dates.
 * Only hours within 09:00–18:00 JST on Mon–Fri excl. Japanese holidays are counted.
 */
const businessHoursBetween = (startDate, endDate) => {
  if (endDate <= startDate) return 0;

  let current    = snapToBusinessStart(new Date(startDate));
  let totalHours = 0;

  while (current < endDate) {
    const { year, month, day } = toJST(current);
    const endOfDay    = jstDayEnd(year, month, day);
    const dayBoundary = endDate < endOfDay ? endDate : endOfDay;

    totalHours += (dayBoundary.getTime() - current.getTime()) / ONE_HOUR_MS;

    if (dayBoundary >= endOfDay) {
      current = getNextBusinessDayStart(endOfDay);
    } else {
      break;
    }
  }

  return totalHours;
};

module.exports = {
  isBusinessHour,
  addBusinessHours,
  businessHoursBetween,
  getNextBusinessDayStart,
};
