
import { Location, PrayerTimes } from '../types';

export async function fetchPrayerTimes(
  location: Location,
  method: number = 2,
  school: number = 0
): Promise<{ timings: PrayerTimes; date: any }> {
  try {
    const { latitude, longitude } = location;
    const date = new Date();
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${Math.floor(date.getTime() / 1000)}?latitude=${latitude}&longitude=${longitude}&method=${method}&school=${school}`
    );
    const data = await response.json();
    
    if (data.code === 200) {
      return {
        timings: data.data.timings,
        date: data.data.date
      };
    }
    throw new Error('Failed to fetch prayer times');
  } catch (error) {
    console.error('Prayer fetch error:', error);
    throw error;
  }
}

export function calculateQibla(latitude: number, longitude: number): number {
  const makkahLat = 21.4225;
  const makkahLng = 39.8262;
  
  const φ1 = latitude * Math.PI / 180;
  const φ2 = makkahLat * Math.PI / 180;
  const Δλ = (makkahLng - longitude) * Math.PI / 180;

  const y = Math.sin(Δλ);
  const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
  let qibla = Math.atan2(y, x) * 180 / Math.PI;
  
  return (qibla + 360) % 360;
}
