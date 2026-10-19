import type React from 'react';
import { useState } from 'react';
import type { CampusBuildingData } from '../types/simcollege';
import { gridToScreen } from '../utils/isometricMath';

interface CampusBuildingProps {
  building: CampusBuildingData;
}

export const CampusBuilding: React.FC<CampusBuildingProps> = ({ building }) => {
  const [isHovered, setIsHovered] = useState(false);

  const { gridX, gridY, gridWidth, gridDepth, height } = building;

  // Base corners on ground (z = 0)
  const baseRight = gridToScreen({ x: gridX + gridWidth, y: gridY });
  const baseBottom = gridToScreen({ x: gridX + gridWidth, y: gridY + gridDepth });
  const baseLeft = gridToScreen({ x: gridX, y: gridY + gridDepth });

  // Roof corners at elevation (z = height)
  const roofTop = gridToScreen({ x: gridX, y: gridY, z: height });
  const roofRight = gridToScreen({ x: gridX + gridWidth, y: gridY, z: height });
  const roofBottom = gridToScreen({ x: gridX + gridWidth, y: gridY + gridDepth, z: height });
  const roofLeft = gridToScreen({ x: gridX, y: gridY + gridDepth, z: height });

  // Polygon strings
  const leftWallPoints = `${baseLeft.x},${baseLeft.y} ${baseBottom.x},${baseBottom.y} ${roofBottom.x},${roofBottom.y} ${roofLeft.x},${roofLeft.y}`;
  const rightWallPoints = `${baseBottom.x},${baseBottom.y} ${baseRight.x},${baseRight.y} ${roofRight.x},${roofRight.y} ${roofBottom.x},${roofBottom.y}`;
  const roofPoints = `${roofTop.x},${roofTop.y} ${roofRight.x},${roofRight.y} ${roofBottom.x},${roofBottom.y} ${roofLeft.x},${roofLeft.y}`;

  return (
    <g
      className="pointer-events-none transition-opacity duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`building-${building.id}`}
    >
      {/* Ground Footprint Shadow */}
      <polygon
        points={`${baseLeft.x + 8},${baseLeft.y + 4} ${baseBottom.x + 10},${baseBottom.y + 6} ${baseRight.x + 8},${baseRight.y + 4} ${baseRight.x},${baseRight.y}`}
        fill="#000000"
        opacity="0.3"
      />

      {/* Left Wall (Shadowed side) */}
      <polygon points={leftWallPoints} fill="#1e293b" stroke="#334155" strokeWidth="1.5" />

      {/* Right Wall (Light side) */}
      <polygon points={rightWallPoints} fill="#334155" stroke="#475569" strokeWidth="1.5" />

      {/* Roof Facet */}
      <polygon
        points={roofPoints}
        fill={isHovered ? '#475569' : '#0f172a'}
        stroke={building.accentColor}
        strokeWidth={isHovered ? '2.5' : '1.5'}
      />

      {/* Roof Accent Trim */}
      <line
        x1={roofLeft.x}
        y1={roofLeft.y}
        x2={roofBottom.x}
        y2={roofBottom.y}
        stroke={building.accentColor}
        strokeWidth="2"
      />
      <line
        x1={roofBottom.x}
        y1={roofBottom.y}
        x2={roofRight.x}
        y2={roofRight.y}
        stroke={building.accentColor}
        strokeWidth="2"
      />

      {/* Building Identifier Badge */}
      <g transform={`translate(${roofTop.x}, ${roofTop.y - 12})`} className="pointer-events-none">
        <rect
          x="-50"
          y="-14"
          width="100"
          height="16"
          rx="3"
          fill="#020617"
          stroke="#334155"
          strokeWidth="1"
          opacity={isHovered ? 1 : 0.85}
        />
        <text
          x="0"
          y="-3"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="9"
          fontWeight="600"
          className="select-none tracking-wide"
        >
          {building.name.length > 18 ? `${building.name.substring(0, 16)}...` : building.name}
        </text>
      </g>
    </g>
  );
};
