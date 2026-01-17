
import React, { useState, useEffect } from 'react';
import { Compass, Navigation } from 'lucide-react';

interface QiblaCompassProps {
  targetAngle: number;
}

const QiblaCompass: React.FC<QiblaCompassProps> = ({ targetAngle }) => {
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setHeading(event.alpha);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const diff = (targetAngle - heading + 360) % 360;

  return (
    <div className="bg-emerald-900 p-8 rounded-3xl text-white shadow-xl flex flex-col items-center">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold">Qibla Direction</h2>
        <p className="text-emerald-200/70 text-sm">Align your device towards the Kaaba</p>
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Compass Ring */}
        <div className="absolute inset-0 border-4 border-emerald-800 rounded-full"></div>
        <div className="absolute inset-2 border border-emerald-700 rounded-full flex items-center justify-center">
           {[0, 90, 180, 270].map(d => (
             <span key={d} className="absolute text-[10px] text-emerald-600 font-bold" 
                   style={{ transform: `rotate(${d}deg) translateY(-105px)` }}>
               {d === 0 ? 'N' : d === 90 ? 'E' : d === 180 ? 'S' : 'W'}
             </span>
           ))}
        </div>

        {/* Pointer */}
        <div 
          className="relative w-full h-full flex items-center justify-center transition-transform duration-300"
          style={{ transform: `rotate(${targetAngle - heading}deg)` }}
        >
          <div className="absolute top-4">
            <div className="w-1.5 h-16 bg-gradient-to-t from-emerald-500 to-amber-400 rounded-full shadow-lg shadow-amber-400/20"></div>
            <div className="w-6 h-6 -mt-1 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
              <Navigation className="w-4 h-4 text-emerald-900 fill-current" />
            </div>
          </div>
        </div>
        
        <div className="bg-emerald-950 p-4 rounded-full border border-emerald-800 shadow-inner">
           <Compass className="w-12 h-12 text-emerald-500 opacity-20" />
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-4xl font-mono font-bold text-amber-400">{Math.round(targetAngle)}°</p>
        <p className="text-emerald-400 text-xs mt-1 uppercase tracking-widest font-semibold">Bearing from North</p>
      </div>
    </div>
  );
};

export default QiblaCompass;
