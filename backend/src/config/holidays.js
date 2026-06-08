// Official Japanese national holidays (国民の祝日) for 2024 – 2026.
// Includes substitute holidays (振替休日) and sandwiched citizen's holidays (国民の休日).
// Source: Cabinet Office Japan — https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html

const JAPANESE_HOLIDAYS = [
  // ── 2024 ─────────────────────────────────────────────────────────────────
  '2024-01-01', // 元日          New Year's Day
  '2024-01-08', // 成人の日      Coming of Age Day (2nd Monday)
  '2024-02-11', // 建国記念の日  National Foundation Day (Sunday)
  '2024-02-12', // 振替休日      Substitute Holiday
  '2024-02-23', // 天皇誕生日    Emperor's Birthday
  '2024-03-20', // 春分の日      Vernal Equinox Day
  '2024-04-29', // 昭和の日      Showa Day
  '2024-05-03', // 憲法記念日    Constitution Memorial Day
  '2024-05-04', // みどりの日    Greenery Day (Saturday — no substitute)
  '2024-05-05', // こどもの日    Children's Day (Sunday)
  '2024-05-06', // 振替休日      Substitute Holiday (for Children's Day)
  '2024-07-15', // 海の日        Marine Day (3rd Monday)
  '2024-08-11', // 山の日        Mountain Day (Sunday)
  '2024-08-12', // 振替休日      Substitute Holiday
  '2024-09-16', // 敬老の日      Respect for the Aged Day (3rd Monday)
  '2024-09-22', // 秋分の日      Autumnal Equinox Day (Sunday)
  '2024-09-23', // 振替休日      Substitute Holiday
  '2024-10-14', // スポーツの日  Sports Day (2nd Monday)
  '2024-11-03', // 文化の日      Culture Day (Sunday)
  '2024-11-04', // 振替休日      Substitute Holiday
  '2024-11-23', // 勤労感謝の日  Labor Thanksgiving Day (Saturday — no substitute)

  // ── 2025 ─────────────────────────────────────────────────────────────────
  '2025-01-01', // 元日          New Year's Day
  '2025-01-13', // 成人の日      Coming of Age Day (2nd Monday)
  '2025-02-11', // 建国記念の日  National Foundation Day
  '2025-02-23', // 天皇誕生日    Emperor's Birthday (Sunday)
  '2025-02-24', // 振替休日      Substitute Holiday
  '2025-03-20', // 春分の日      Vernal Equinox Day
  '2025-04-29', // 昭和の日      Showa Day
  '2025-05-03', // 憲法記念日    Constitution Memorial Day (Saturday — no substitute)
  '2025-05-04', // みどりの日    Greenery Day (Sunday)
  '2025-05-05', // こどもの日    Children's Day
  '2025-05-06', // 振替休日      Substitute Holiday (for Greenery Day)
  '2025-07-21', // 海の日        Marine Day (3rd Monday)
  '2025-08-11', // 山の日        Mountain Day
  '2025-09-15', // 敬老の日      Respect for the Aged Day (3rd Monday)
  '2025-09-23', // 秋分の日      Autumnal Equinox Day
  '2025-10-13', // スポーツの日  Sports Day (2nd Monday)
  '2025-11-03', // 文化の日      Culture Day
  '2025-11-23', // 勤労感謝の日  Labor Thanksgiving Day (Sunday)
  '2025-11-24', // 振替休日      Substitute Holiday

  // ── 2026 ─────────────────────────────────────────────────────────────────
  '2026-01-01', // 元日          New Year's Day
  '2026-01-12', // 成人の日      Coming of Age Day (2nd Monday)
  '2026-02-11', // 建国記念の日  National Foundation Day
  '2026-02-23', // 天皇誕生日    Emperor's Birthday
  '2026-03-20', // 春分の日      Vernal Equinox Day
  '2026-04-29', // 昭和の日      Showa Day
  '2026-05-03', // 憲法記念日    Constitution Memorial Day (Sunday)
  '2026-05-04', // みどりの日    Greenery Day
  '2026-05-05', // こどもの日    Children's Day
  '2026-05-06', // 振替休日      Substitute Holiday (for Constitution Memorial Day)
  '2026-07-20', // 海の日        Marine Day (3rd Monday)
  '2026-08-11', // 山の日        Mountain Day
  '2026-09-21', // 敬老の日      Respect for the Aged Day (3rd Monday)
  '2026-09-22', // 国民の休日    Citizen's Holiday (sandwiched between two holidays)
  '2026-09-23', // 秋分の日      Autumnal Equinox Day
  '2026-10-12', // スポーツの日  Sports Day (2nd Monday)
  '2026-11-03', // 文化の日      Culture Day
  '2026-11-23', // 勤労感謝の日  Labor Thanksgiving Day
];

const HOLIDAY_SET = new Set(JAPANESE_HOLIDAYS);

/**
 * Returns true if the given YYYY-MM-DD string is a Japanese national holiday.
 * @param {string} dateString  e.g. "2025-08-11"
 */
const isJapaneseHoliday = (dateString) => HOLIDAY_SET.has(dateString);

module.exports = { JAPANESE_HOLIDAYS, isJapaneseHoliday };
