import type React from 'react';
import { useMemo } from 'react';
import { CAMPUS_BUILDINGS } from '../data/campusMapData';
import type { ScreenCoord, SimCollegeEventPin } from '../types/simcollege';
import { calculateDepth } from '../utils/isometricMath';
import { CampusBuilding } from './CampusBuilding';
import { EventPinMarker } from './EventPinMarker';
import { GroundGrid } from './GroundGrid';

interface IsometricCanvasProps {
  pan: ScreenCoord;
  zoom: number;
  pointerHandlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onWheel: (e: React.WheelEvent) => void;
  };
  pins: SimCollegeEventPin[];
  selectedPinId: number | null;
  focusedPinIndex: number;
  onSelectPin: (pinId: number) => void;
}

export const IsometricCanvas: React.FC<IsometricCanvasProps> = ({
  pan,
  zoom,
  pointerHandlers,
  pins,
  selectedPinId,
  focusedPinIndex,
  onSelectPin,
}) => {
  // Sort buildings depth-first (further away rendered first)
  const sortedBuildings = useMemo(() => {
    return [...CAMPUS_BUILDINGS].sort((a, b) => {
      const depthA = calculateDepth(a.gridX + a.gridWidth / 2, a.gridY + a.gridDepth / 2);
      const depthB = calculateDepth(b.gridX + b.gridWidth / 2, b.gridY + b.gridDepth / 2);
      return depthA - depthB;
    });
  }, []);

  // Sort pins depth-first so closer pins render in front of further pins
  const sortedPins = useMemo(() => {
    return pins
      .map((pin, originalIndex) => ({ pin, originalIndex }))
      .sort((a, b) => {
        const depthA = calculateDepth(a.pin.gridX, a.pin.gridY);
        const depthB = calculateDepth(b.pin.gridX, b.pin.gridY);
        return depthA - depthB;
      });
  }, [pins]);

  return (
    <section
      aria-label="Campus Interactive Map"
      className="relative w-full h-full min-h-[480px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 touch-none select-none cursor-grab active:cursor-grabbing shadow-inner"
      {...pointerHandlers}
      data-testid="simcollege-canvas-container"
    >
      <svg
        viewBox="-600 -300 1200 900"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        aria-label="2:1 Dimetric Campus Map showing buildings, plazas, and event locations"
      >
        <title>2:1 Dimetric Campus Map showing buildings, plazas, and event locations</title>
        <defs>
          <radialGradient id="campus-ambient-glow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient background glow */}
        <rect x="-600" y="-300" width="1200" height="900" fill="url(#campus-ambient-glow)" />

        {/* Pan and Zoom Transform Group */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Ground Terrain Grid */}
          <GroundGrid />

          {/* Depth-sorted buildings layer */}
          <g data-testid="buildings-layer">
            {sortedBuildings.map((building) => (
              <CampusBuilding key={`b-${building.id}`} building={building} />
            ))}
          </g>

          {/* Foreground Interactive Pins Layer */}
          <g data-testid="pins-layer">
            {sortedPins.map(({ pin, originalIndex }) => {
              const isSelected = pin.id === selectedPinId;
              const isFocused = originalIndex === focusedPinIndex;
              return (
                <EventPinMarker
                  key={`p-${pin.id}`}
                  pin={pin}
                  isSelected={isSelected}
                  isFocused={isFocused}
                  onSelect={onSelectPin}
                  tabIndex={isFocused ? 0 : -1}
                />
              );
            })}
          </g>
        </g>
      </svg>
    </section>
  );
};
