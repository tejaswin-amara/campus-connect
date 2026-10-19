import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { OKABE_ITO_COLORS } from '../data/campusMapData';
import type { SimCollegeEventPin } from '../types/simcollege';

interface SynchronizedEventListProps {
  events: SimCollegeEventPin[];
  selectedPinId: number | null;
  onSelectPin: (id: number) => void;
  onLocatePin: (pin: SimCollegeEventPin) => void;
}

export const SynchronizedEventList: React.FC<SynchronizedEventListProps> = ({
  events,
  selectedPinId,
  onSelectPin,
  onLocatePin,
}) => {
  const itemRefs = useRef<Map<number, HTMLLIElement>>(new Map());

  // Scroll active list card into view when selected from the map
  useEffect(() => {
    if (selectedPinId) {
      const el = itemRefs.current.get(selectedPinId);
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedPinId]);

  return (
    <section
      aria-label="Campus Event Schedule & Locations"
      className="h-full flex flex-col bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden"
    >
      <div className="p-4 border-b border-slate-800 bg-slate-950/40">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-400" />
          <span>Synchronized Event Roster</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {events.length} campus events scheduled. Select any event to highlight its spatial
          location.
        </p>
      </div>

      <ol className="flex-1 overflow-y-auto divide-y divide-slate-800/80 p-2 space-y-2">
        {events.map((evt) => {
          const isSelected = evt.id === selectedPinId;
          const colorConfig = OKABE_ITO_COLORS[evt.category];

          return (
            <li
              key={evt.id}
              ref={(el) => {
                if (el) itemRefs.current.set(evt.id, el);
                else itemRefs.current.delete(evt.id);
              }}
              className={`p-3.5 rounded-lg border transition-all duration-150 ${
                isSelected
                  ? 'bg-slate-800/90 border-sky-400 ring-1 ring-sky-400/50 shadow-md'
                  : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className="px-2 py-0.5 text-xs font-semibold rounded-full select-none"
                  style={{
                    backgroundColor: colorConfig.bg,
                    color: colorConfig.text,
                    border: colorConfig.needsDarkBorder ? '1.5px solid #0f172a' : 'none',
                  }}
                >
                  {colorConfig.label}
                </span>

                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                    evt.status === 'LIVE'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'text-slate-400'
                  }`}
                >
                  {evt.status}
                </span>
              </div>

              <h4 className="text-sm font-semibold text-white mt-2 leading-snug">{evt.title}</h4>

              <div className="mt-2.5 space-y-1 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{evt.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {evt.date} • {evt.time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {evt.registeredCount} / {evt.capacity} registered
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => {
                    onSelectPin(evt.id);
                    onLocatePin(evt);
                  }}
                  className="min-h-[44px] flex-1 px-3 py-2 rounded-md bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-medium border border-sky-500/30 transition flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  aria-label={`Locate on Map: ${evt.title}`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Locate on Map</span>
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
