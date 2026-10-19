import { CheckCircle2, Compass, Info, X } from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { useSimCollegeTelemetry } from '../api/useSimCollegeTelemetry';
import { INITIAL_EVENT_PINS, OKABE_ITO_COLORS } from '../data/campusMapData';
import { useIsometricProjection } from '../hooks/useIsometricProjection';
import { useMapKeyboardNav } from '../hooks/useMapKeyboardNav';
import type { SimCollegeEventPin, ViewModality } from '../types/simcollege';
import { AccessibleSpatialAnnouncer } from './AccessibleSpatialAnnouncer';
import { IsometricCanvas } from './IsometricCanvas';
import { MapToolbar } from './MapToolbar';
import { SynchronizedEventList } from './SynchronizedEventList';

export const SimCollegeContainer: React.FC = () => {
  const [pins] = useState<SimCollegeEventPin[]>(INITIAL_EVENT_PINS);
  const [selectedPinId, setSelectedPinId] = useState<number | null>(null);
  const [modality, setModality] = useState<ViewModality>('split');
  const [announcement, setAnnouncement] = useState<string>(
    'Interactive campus map loaded. Use arrow keys or toolbar to navigate.',
  );

  const { trackEvent } = useSimCollegeTelemetry();

  const { pan, zoom, zoomIn, zoomOut, resetView, centerOnGrid, pointerHandlers } =
    useIsometricProjection();

  const handleSelectPin = useCallback(
    (pinId: number) => {
      setSelectedPinId(pinId);
      const targetPin = pins.find((p) => p.id === pinId);
      if (targetPin) {
        setAnnouncement(
          `Selected event: ${targetPin.title} at ${targetPin.venue}. Date: ${targetPin.date}. Category: ${targetPin.category}.`,
        );
        trackEvent('pin_click', {
          pinId: targetPin.id,
          venue: targetPin.venue,
        });
      }
    },
    [pins, trackEvent],
  );

  const handleClearSelection = useCallback(() => {
    setSelectedPinId(null);
    setAnnouncement('Selection cleared.');
  }, []);

  const { focusedIndex, handleKeyDown } = useMapKeyboardNav({
    pins,
    selectedPinId,
    onSelectPin: handleSelectPin,
    onClearSelection: handleClearSelection,
  });

  const handleLocatePin = useCallback(
    (pin: SimCollegeEventPin) => {
      centerOnGrid(pin.gridX, pin.gridY);
      setSelectedPinId(pin.id);
      setAnnouncement(`Centered map on ${pin.venue} for ${pin.title}.`);
      trackEvent('list_select', { pinId: pin.id, venue: pin.venue });
    },
    [centerOnGrid, trackEvent],
  );

  const handleModalityChange = (newModality: ViewModality) => {
    setModality(newModality);
    setAnnouncement(`View switched to ${newModality} layout.`);
    trackEvent('view_toggle', { modality: newModality });
  };

  const selectedEvent = pins.find((p) => p.id === selectedPinId);

  return (
    <div
      className="space-y-4 focus:outline-none"
      onKeyDown={handleKeyDown}
      aria-label="SimCollege Campus Simulation Interface"
    >
      {/* Screen-reader spatial announcements */}
      <AccessibleSpatialAnnouncer message={announcement} />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Compass className="w-5 h-5" />
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              SimCollege: Campus Spatial Map
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Accessible 2:1 dimetric spatial simulation of campus grounds, landmarks, and live
            activities.
          </p>
        </div>

        {/* Legend pills preview */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-300 font-semibold px-1">Categories:</span>
          {Object.entries(OKABE_ITO_COLORS).map(([key, cfg]) => (
            <span
              key={key}
              className="px-1.5 py-0.5 rounded text-[10px] font-bold"
              style={{
                backgroundColor: cfg.bg,
                color: cfg.text,
                border: cfg.needsDarkBorder ? '1px solid #0f172a' : 'none',
              }}
            >
              {cfg.label.split(' ')[0]}
            </span>
          ))}
        </div>
      </div>

      {/* Toolbar Controls */}
      <MapToolbar
        zoom={zoom}
        onZoomIn={() => {
          zoomIn();
          trackEvent('map_zoom', { zoomLevel: zoom });
        }}
        onZoomOut={() => {
          zoomOut();
          trackEvent('map_zoom', { zoomLevel: zoom });
        }}
        onReset={() => {
          resetView();
          setAnnouncement('Map position reset to campus center.');
          trackEvent('map_pan');
        }}
        modality={modality}
        onModalityChange={handleModalityChange}
      />

      {/* Main Spatial Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[620px]">
        {/* Isometric Map View */}
        {(modality === 'split' || modality === 'map') && (
          <div className={`h-full ${modality === 'split' ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
            <IsometricCanvas
              pan={pan}
              zoom={zoom}
              pointerHandlers={pointerHandlers}
              pins={pins}
              selectedPinId={selectedPinId}
              focusedPinIndex={focusedIndex}
              onSelectPin={handleSelectPin}
            />
          </div>
        )}

        {/* Synchronized Event List View */}
        {(modality === 'split' || modality === 'list') && (
          <div className={`h-full ${modality === 'split' ? 'lg:col-span-4' : 'lg:col-span-12'}`}>
            <SynchronizedEventList
              events={pins}
              selectedPinId={selectedPinId}
              onSelectPin={handleSelectPin}
              onLocatePin={handleLocatePin}
            />
          </div>
        )}
      </div>

      {/* Selected Event Details Modal / Drawer */}
      {selectedEvent && (
        // biome-ignore lint/a11y/useSemanticElements: Floating overlay modal dialog
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="selected-event-title"
          className="fixed bottom-6 right-6 max-w-sm w-full bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-bottom-4"
          data-testid="event-detail-popup"
        >
          <div className="flex items-start justify-between">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: OKABE_ITO_COLORS[selectedEvent.category].bg,
                color: OKABE_ITO_COLORS[selectedEvent.category].text,
              }}
            >
              {OKABE_ITO_COLORS[selectedEvent.category].label}
            </span>

            <button
              type="button"
              onClick={handleClearSelection}
              aria-label="Close event details"
              className="min-w-[44px] min-h-[44px] -mr-2 -mt-2 flex items-center justify-center text-slate-400 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 id="selected-event-title" className="text-base font-bold text-white mt-2">
            {selectedEvent.title}
          </h3>

          <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>{selectedEvent.venue}</span>
          </p>

          <div className="mt-3 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
            <span>{selectedEvent.date}</span>
            <span>{selectedEvent.time}</span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAnnouncement(`Registered for ${selectedEvent.title}.`);
                handleClearSelection();
              }}
              className="min-h-[44px] flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs rounded-lg transition flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Attendance</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
