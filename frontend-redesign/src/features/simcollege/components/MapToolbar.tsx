import { Columns2, List, Map as MapIcon, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import type React from 'react';
import type { ViewModality } from '../types/simcollege';

interface MapToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  modality: ViewModality;
  onModalityChange: (modality: ViewModality) => void;
}

export const MapToolbar: React.FC<MapToolbarProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  modality,
  onModalityChange,
}) => {
  return (
    <div
      role="toolbar"
      aria-label="Map Controls"
      className="flex flex-wrap items-center gap-2 p-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-lg"
    >
      {/* Zoom Controls (SC 2.5.5 >= 44x44px) */}
      <div className="flex items-center bg-slate-950/60 rounded-lg p-0.5 border border-slate-800">
        <button
          type="button"
          onClick={onZoomIn}
          aria-label="Zoom in"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-700 transition focus:outline-none focus:ring-2 focus:ring-sky-400"
          data-testid="toolbar-zoom-in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        <span
          className="px-2 text-xs font-mono font-medium text-slate-400 select-none"
          aria-label={`Current zoom level ${Math.round(zoom * 100)} percent`}
        >
          {Math.round(zoom * 100)}%
        </span>

        <button
          type="button"
          onClick={onZoomOut}
          aria-label="Zoom out"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-700 transition focus:outline-none focus:ring-2 focus:ring-sky-400"
          data-testid="toolbar-zoom-out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
      </div>

      {/* Recenter Button */}
      <button
        type="button"
        onClick={onReset}
        aria-label="Recenter campus view"
        className="min-w-[44px] min-h-[44px] px-3 flex items-center gap-2 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-700 transition text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-400"
        data-testid="toolbar-recenter"
      >
        <RotateCcw className="w-4 h-4 text-sky-400" />
        <span>Recenter</span>
      </button>

      {/* View Modality Toggles */}
      {/* biome-ignore lint/a11y/useSemanticElements: Button group for view modality */}
      <div
        role="group"
        aria-label="View display layout"
        className="flex items-center bg-slate-950/60 rounded-lg p-0.5 border border-slate-800 ml-auto"
      >
        <button
          type="button"
          aria-pressed={modality === 'split'}
          aria-label="Split view layout"
          onClick={() => onModalityChange('split')}
          className={`min-w-[44px] min-h-[44px] px-3 flex items-center gap-1.5 rounded-md text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-sky-400 ${
            modality === 'split'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          data-testid="modality-split"
        >
          <Columns2 className="w-4 h-4" />
          <span className="hidden sm:inline">Split</span>
        </button>

        <button
          type="button"
          aria-pressed={modality === 'map'}
          aria-label="Map only layout"
          onClick={() => onModalityChange('map')}
          className={`min-w-[44px] min-h-[44px] px-3 flex items-center gap-1.5 rounded-md text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-sky-400 ${
            modality === 'map'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          data-testid="modality-map"
        >
          <MapIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Map</span>
        </button>

        <button
          type="button"
          aria-pressed={modality === 'list'}
          aria-label="List only layout"
          onClick={() => onModalityChange('list')}
          className={`min-w-[44px] min-h-[44px] px-3 flex items-center gap-1.5 rounded-md text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-sky-400 ${
            modality === 'list'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          data-testid="modality-list"
        >
          <List className="w-4 h-4" />
          <span className="hidden sm:inline">List</span>
        </button>
      </div>
    </div>
  );
};
