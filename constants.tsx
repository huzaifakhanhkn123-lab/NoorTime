
export const PRAYER_METHODS = [
  { id: 2, name: 'ISNA (North America)' },
  { id: 3, name: 'Muslim World League' },
  { id: 4, name: 'Umm al-Qura (Makkah)' },
  { id: 5, name: 'Egyptian General Authority' },
  { id: 1, name: 'University of Islamic Sciences, Karachi' },
  { id: 8, name: 'Gulf Region' },
  { id: 9, name: 'Kuwait' },
  { id: 10, name: 'Qatar' },
  { id: 11, name: 'Majlis Ugama Islam Singapura' },
  { id: 12, name: 'Union des Organisations Islamiques de France' },
];

export const PRAYER_NAMES: (keyof Omit<import('./types').PrayerTimes, 'Sunrise' | 'Imsak' | 'Iftar'>)[] = 
  ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const THEME_COLORS = {
  emerald: '#064e3b',
  gold: '#b45309',
  cream: '#fffbeb',
};
