
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MapPin, 
  Settings, 
  Calendar, 
  Moon, 
  Sun, 
  Sparkles, 
  ChevronRight, 
  History, 
  Compass as CompassIcon,
  LayoutDashboard
} from 'lucide-react';
import { Location, PrayerTimes, DailyProgress, UserProfile, AIRecommendation } from './types';
import { fetchPrayerTimes, calculateQibla } from './services/prayerTimeService';
import { getPersonalizedGuidance } from './services/geminiService';
import PrayerCard from './components/PrayerCard';
import ProgressTracker from './components/ProgressTracker';
import QiblaCompass from './components/QiblaCompass';
import { PRAYER_NAMES } from './constants';

const App: React.FC = () => {
  // State
  const [location, setLocation] = useState<Location | null>(null);
  const [prayerData, setPrayerData] = useState<{ timings: PrayerTimes; date: any } | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'progress' | 'qibla' | 'ai'>('today');
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('noortime_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Guest',
      calculationMethod: 2,
      school: 0,
      notificationsEnabled: true,
      history: []
    };
  });
  const [aiSuggestions, setAiSuggestions] = useState<AIRecommendation[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [todayProgress, setTodayProgress] = useState<DailyProgress | null>(null);

  // Sync profile with storage
  useEffect(() => {
    localStorage.setItem('noortime_profile', JSON.stringify(profile));
  }, [profile]);

  // Initial Location Setup
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        (err) => {
          console.warn("Geolocation permission denied. Defaulting to London.", err);
          setLocation({ latitude: 51.5074, longitude: -0.1278 });
        }
      );
    }
  }, []);

  // Fetch Prayer Times
  useEffect(() => {
    if (location) {
      fetchPrayerTimes(location, profile.calculationMethod, profile.school)
        .then(setPrayerData)
        .catch(console.error);
    }
  }, [location, profile.calculationMethod, profile.school]);

  // Handle Daily Progress Object
  useEffect(() => {
    const todayStr = new Date().toDateString();
    const existing = profile.history.find(h => h.date === todayStr);
    if (!existing) {
      const newDay: DailyProgress = {
        date: todayStr,
        prayers: { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false }
      };
      setTodayProgress(newDay);
    } else {
      setTodayProgress(existing);
    }
  }, [profile.history]);

  const togglePrayer = (prayerName: keyof Omit<PrayerTimes, 'Sunrise' | 'Imsak' | 'Iftar'>) => {
    if (!todayProgress) return;

    const updatedDay = {
      ...todayProgress,
      prayers: { ...todayProgress.prayers, [prayerName]: !todayProgress.prayers[prayerName] }
    };

    setTodayProgress(updatedDay);
    
    setProfile(prev => {
      const historyWithoutToday = prev.history.filter(h => h.date !== updatedDay.date);
      return { ...prev, history: [...historyWithoutToday, updatedDay] };
    });
  };

  const nextPrayer = useMemo(() => {
    if (!prayerData) return null;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (const name of PRAYER_NAMES) {
      const [h, m] = prayerData.timings[name].split(':').map(Number);
      if (h * 60 + m > currentTime) return name;
    }
    return 'Fajr'; // Next day
  }, [prayerData]);

  const loadAiGuidance = useCallback(async () => {
    if (!todayProgress || isAiLoading) return;
    setIsAiLoading(true);
    try {
      const guidance = await getPersonalizedGuidance(profile.history, nextPrayer || 'Dhuhr', profile.name);
      setAiSuggestions(guidance);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  }, [profile.history, nextPrayer, profile.name, isAiLoading, todayProgress]);

  // Auto-load AI guidance on mount or when habits change significantly
  useEffect(() => {
    if (activeTab === 'ai' && aiSuggestions.length === 0) {
      loadAiGuidance();
    }
  }, [activeTab, aiSuggestions.length, loadAiGuidance]);

  const qiblaAngle = useMemo(() => {
    return location ? calculateQibla(location.latitude, location.longitude) : 0;
  }, [location]);

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto relative overflow-x-hidden">
      {/* Header */}
      <header className="p-6 bg-white/50 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Sun className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-none">NoorTime</h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {location ? 'Precise Location' : 'Detecting...'}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="p-4 space-y-6">
        {activeTab === 'today' && (
          <>
            {/* Greeting & Date */}
            <div className="px-2">
              <p className="text-slate-500 text-sm font-medium">As-salamu alaykum,</p>
              <h2 className="text-2xl font-bold text-slate-900">May your day be blessed.</h2>
              <div className="mt-4 flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100 inline-flex">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-700">
                  {prayerData?.date?.hijri?.day} {prayerData?.date?.hijri?.month?.en} {prayerData?.date?.hijri?.year}
                </span>
              </div>
            </div>

            {/* Prayer Grid */}
            <div className="grid grid-cols-1 gap-4">
              {PRAYER_NAMES.map((name) => (
                <PrayerCard 
                  key={name}
                  name={name}
                  time={prayerData?.timings[name] || '--:--'}
                  isNext={name === nextPrayer}
                  isCompleted={!!todayProgress?.prayers[name]}
                  onToggle={() => togglePrayer(name)}
                />
              ))}
            </div>

            {/* Quick AI Tip Banner */}
            <div 
              className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-3xl border border-amber-200 cursor-pointer group"
              onClick={() => setActiveTab('ai')}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-2">
                    <Sparkles className="w-4 h-4" /> Personalized Insight
                  </div>
                  <h3 className="text-lg font-bold text-amber-900 leading-tight">
                    {aiSuggestions.length > 0 ? aiSuggestions[0].title : "How's your spiritual journey today?"}
                  </h3>
                  <p className="text-amber-800/70 text-sm mt-2 line-clamp-2 italic">
                    {aiSuggestions.length > 0 ? aiSuggestions[0].content : "Get personalized recommendations based on your habits."}
                  </p>
                </div>
                <div className="bg-white/50 p-2 rounded-full group-hover:translate-x-1 transition-transform">
                  <ChevronRight className="w-5 h-5 text-amber-700" />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            <ProgressTracker history={profile.history} />
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
               <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                 <History className="w-5 h-5 text-emerald-600" /> History
               </h3>
               <div className="space-y-3">
                 {profile.history.slice(-5).reverse().map((day, idx) => (
                   <div key={idx} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl">
                      <div className="text-sm font-medium text-slate-600">{day.date}</div>
                      <div className="flex gap-1">
                        {Object.entries(day.prayers).map(([p, completed], i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${completed ? 'bg-emerald-500' : 'bg-slate-200'}`} title={p} />
                        ))}
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'qibla' && (
          <div className="flex flex-col gap-6 items-center pt-8">
            <QiblaCompass targetAngle={qiblaAngle} />
            <div className="w-full bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-800 mb-2">Current Location</h4>
              <p className="text-slate-500 text-sm">Lat: {location?.latitude.toFixed(4)}</p>
              <p className="text-slate-500 text-sm">Lng: {location?.longitude.toFixed(4)}</p>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                NoorAI Guidance <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
              </h2>
              <button 
                onClick={loadAiGuidance}
                disabled={isAiLoading}
                className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 disabled:opacity-50"
              >
                {isAiLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {isAiLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1,2,3].map(i => (
                  <div key={i} className="h-40 bg-slate-100 rounded-3xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {aiSuggestions.map((rec, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                        {rec.type}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">{rec.title}</h3>
                    
                    {rec.arabic && (
                      <div className="bg-emerald-50/50 p-4 rounded-2xl mb-3 text-right">
                        <p className="arabic text-2xl text-emerald-900 leading-relaxed">{rec.arabic}</p>
                      </div>
                    )}
                    
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      {rec.type === 'verse' || rec.type === 'dua' ? rec.translation : rec.content}
                    </p>
                    
                    {rec.source && (
                      <p className="text-xs text-slate-400 mb-4">— {rec.source}</p>
                    )}

                    <div className="pt-4 border-t border-slate-50">
                      <p className="text-xs text-emerald-700/60 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> NoorAI Analysis: {rec.reasoning}
                      </p>
                    </div>
                  </div>
                ))}

                {aiSuggestions.length === 0 && (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">Click refresh to get personalized spiritual guidance.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Navigation Dock */}
      <nav className="fixed bottom-6 left-6 right-6 h-16 glass rounded-2xl shadow-2xl flex items-center justify-around px-2 z-50">
        <NavButton 
          active={activeTab === 'today'} 
          onClick={() => setActiveTab('today')}
          icon={<LayoutDashboard className="w-6 h-6" />}
          label="Today"
        />
        <NavButton 
          active={activeTab === 'progress'} 
          onClick={() => setActiveTab('progress')}
          icon={<History className="w-6 h-6" />}
          label="Progress"
        />
        <NavButton 
          active={activeTab === 'ai'} 
          onClick={() => setActiveTab('ai')}
          icon={<Sparkles className="w-6 h-6" />}
          label="NoorAI"
        />
        <NavButton 
          active={activeTab === 'qibla'} 
          onClick={() => setActiveTab('qibla')}
          icon={<CompassIcon className="w-6 h-6" />}
          label="Qibla"
        />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-300 relative
      ${active ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'}
    `}
  >
    {active && <div className="absolute -top-3 w-6 h-1 bg-emerald-500 rounded-full" />}
    <div className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-emerald-50' : 'bg-transparent'}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-tighter ${active ? 'opacity-100' : 'opacity-0'}`}>
      {label}
    </span>
  </button>
);

export default App;
