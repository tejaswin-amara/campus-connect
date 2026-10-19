import type React from 'react';
import { OKABE_ITO_COLORS } from '../data/campusMapData';
import type { SimCollegeEventPin } from '../types/simcollege';
import { gridToScreen } from '../utils/isometricMath';

interface EventPinMarkerProps {
  pin: SimCollegeEventPin;
  isSelected: boolean;
  isFocused: boolean;
  onSelect: (pinId: number) => void;
  tabIndex: number;
}

export const EventPinMarker: React.FC<EventPinMarkerProps> = ({
  pin,
  isSelected,
  isFocused,
  onSelect,
  tabIndex,
}) => {
  // Pin elevation above ground (z = 35)
  const screenPos = gridToScreen({ x: pin.gridX, y: pin.gridY, z: 35 });
  const categoryConfig = OKABE_ITO_COLORS[pin.category];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(pin.id);
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: SVG group element acting as interactive map pin button
    <g
      role="button"
      transform={`translate(${screenPos.x}, ${screenPos.y})`}
      className="cursor-pointer transition-transform duration-150 focus:outline-none"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(pin.id);
      }}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
      aria-label={`${isSelected ? 'Selected: ' : ''}${pin.title} at ${pin.venue}. Category: ${categoryConfig.label}. Date: ${pin.date}. Status: ${pin.status}`}
      data-testid={`event-pin-${pin.id}`}
    >
      {/* SC 2.5.5: Enhanced 44x44px transparent bounding hit target (radius 22px) */}
      <circle
        cx="0"
        cy="-10"
        r="24"
        fill="#000000"
        opacity="0.001"
        style={{ pointerEvents: 'all' }}
      />

      {/* Anchor shadow on ground */}
      <ellipse cx="0" cy="25" rx="10" ry="5" fill="#000000" opacity="0.35" />

      {/* Vertical pin stem connecting to ground */}
      <line x1="0" y1="5" x2="0" y2="25" stroke="#1e293b" strokeWidth="2" strokeDasharray="2 2" />

      {/* Pulsing selection halo */}
      {isSelected && (
        <circle
          cx="0"
          cy="-10"
          r="20"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3"
          className="animate-ping opacity-75"
        />
      )}

      {/* Focused indicator ring for keyboard accessibility */}
      {isFocused && (
        <circle
          cx="0"
          cy="-10"
          r="18"
          fill="none"
          stroke="#f8fafc"
          strokeWidth="3"
          strokeDasharray="3 3"
        />
      )}

      {/* Main Pin Body with Okabe-Ito Color & Dark Outline */}
      <path
        d="M 0,-24 C -10,-24 -16,-17 -16,-8 C -16,4 0,10 0,10 C 0,10 16,4 16,-8 C 16,-17 10,-24 0,-24 Z"
        fill={categoryConfig.bg}
        stroke={categoryConfig.needsDarkBorder ? '#0f172a' : categoryConfig.stroke}
        strokeWidth={categoryConfig.needsDarkBorder ? 2.5 : 1.5}
      />

      {/* Pin Center Core */}
      <circle cx="0" cy="-9" r="5.5" fill={categoryConfig.text} />

      {/* Label Tooltip on Focus / Hover */}
      {(isSelected || isFocused) && (
        <g transform="translate(0, -32)" className="pointer-events-none">
          <rect
            x="-70"
            y="-22"
            width="140"
            height="22"
            rx="4"
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="1"
            opacity="0.95"
          />
          <text
            x="0"
            y="-7"
            textAnchor="middle"
            fill="#f8fafc"
            fontSize="11"
            fontWeight="600"
            className="select-none"
          >
            {pin.title.length > 18 ? `${pin.title.substring(0, 16)}...` : pin.title}
          </text>
        </g>
      )}
    </g>
  );
};
