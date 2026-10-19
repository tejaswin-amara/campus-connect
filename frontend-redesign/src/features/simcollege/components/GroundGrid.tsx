import type React from 'react';
import { GRID_CONFIG } from '../data/campusMapData';
import { getTilePolygonPoints } from '../utils/isometricMath';

export const GroundGrid: React.FC = () => {
  const { columns, rows, pathCoords, waterCoords } = GRID_CONFIG;
  const tiles: React.ReactNode[] = [];

  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      const coordKey = `${x},${y}`;
      const points = getTilePolygonPoints(x, y);

      if (waterCoords.has(coordKey)) {
        // Central reflection pond
        tiles.push(
          <polygon
            key={coordKey}
            points={points}
            fill="#0284c7"
            stroke="#38bdf8"
            strokeWidth="0.8"
            opacity="0.85"
            data-testid={`tile-water-${coordKey}`}
          />,
        );
      } else if (pathCoords.has(coordKey)) {
        // Paved campus walkway / plaza
        tiles.push(
          <polygon
            key={coordKey}
            points={points}
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="0.8"
            data-testid={`tile-path-${coordKey}`}
          />,
        );
      } else {
        // Campus grass / lawn
        const isAlternate = (x + y) % 2 === 0;
        tiles.push(
          <polygon
            key={coordKey}
            points={points}
            fill={isAlternate ? '#064e3b' : '#044232'}
            stroke="#065f46"
            strokeWidth="0.6"
            data-testid={`tile-lawn-${coordKey}`}
          />,
        );
      }
    }
  }

  return <g className="ground-grid">{tiles}</g>;
};
