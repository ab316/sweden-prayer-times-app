// Display formatting for source-provided Hijri dates.

const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
];

export type SourceHijriDate = {
  short: string;
  long: string;
};

export function formatScheduleHijri(hijri: SourceHijriDate): string {
  const [day, month, year] = hijri.short.split('.').map(Number);
  const monthName = HIJRI_MONTHS[month - 1];

  if (!day || !monthName || !year) {
    return hijri.long;
  }

  return `${day} ${monthName} ${year}`;
}
