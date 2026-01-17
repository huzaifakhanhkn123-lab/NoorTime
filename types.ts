
export interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Imsak?: string;
  Iftar?: string;
}

export interface DailyProgress {
  date: string;
  prayers: {
    [key in keyof Omit<PrayerTimes, 'Sunrise' | 'Imsak' | 'Iftar'>]: boolean;
  };
}

export interface AIRecommendation {
  type: 'dua' | 'verse' | 'habit' | 'quote';
  title: string;
  content: string;
  arabic?: string;
  translation?: string;
  source?: string;
  reasoning: string;
}

export interface UserProfile {
  name: string;
  calculationMethod: number;
  school: number; // 0 for Shafi/Hanbali/Maliki, 1 for Hanafi
  notificationsEnabled: boolean;
  history: DailyProgress[];
}
