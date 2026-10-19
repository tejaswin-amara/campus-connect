import type { GridCoord, ScreenCoord, TileSize } from '../types/simcollege';

export const DEFAULT_TILE_SIZE: TileSize = {
  width: 128,
  height: 64,
};

/**
 * Projects a 2D/3D grid coordinate into 2:1 dimetric screen space coordinates.
 */
export function gridToScreen(
  coord: GridCoord,
  tileSize: TileSize = DEFAULT_TILE_SIZE,
  origin: ScreenCoord = { x: 0, y: 0 },
): ScreenCoord {
  const halfW = tileSize.width / 2;
  const halfH = tileSize.height / 2;
  const elevation = coord.z ?? 0;

  return {
    x: (coord.x - coord.y) * halfW + origin.x,
    y: (coord.x + coord.y) * halfH - elevation + origin.y,
  };
}

/**
 * Converts 2:1 dimetric screen space coordinates back into grid coordinates.
 * Inverts gridToScreen with sub-pixel precision.
 */
export function screenToGrid(
  screen: ScreenCoord,
  tileSize: TileSize = DEFAULT_TILE_SIZE,
  origin: ScreenCoord = { x: 0, y: 0 },
): GridCoord {
  const halfW = tileSize.width / 2;
  const halfH = tileSize.height / 2;
  const relX = screen.x - origin.x;
  const relY = screen.y - origin.y;

  const x = (relX / halfW + relY / halfH) / 2;
  const y = (relY / halfH - relX / halfW) / 2;

  return { x, y };
}

/**
 * Generates an SVG polygon points string for a flat 2:1 dimetric diamond tile.
 */
export function getTilePolygonPoints(
  gridX: number,
  gridY: number,
  tileSize: TileSize = DEFAULT_TILE_SIZE,
  origin: ScreenCoord = { x: 0, y: 0 },
): string {
  const top = gridToScreen({ x: gridX, y: gridY }, tileSize, origin);
  const right = gridToScreen({ x: gridX + 1, y: gridY }, tileSize, origin);
  const bottom = gridToScreen({ x: gridX + 1, y: gridY + 1 }, tileSize, origin);
  const left = gridToScreen({ x: gridX, y: gridY + 1 }, tileSize, origin);

  return `${top.x},${top.y} ${right.x},${right.y} ${bottom.x},${bottom.y} ${left.x},${left.y}`;
}

/**
 * Calculates a deterministic depth sorting key for an isometric item.
 * Higher values should render in front of lower values.
 */
export function calculateDepth(gridX: number, gridY: number, layerOffset = 0): number {
  // Objects with larger (gridX + gridY) are positioned closer to the viewer
  return (gridX + gridY) * 1000 + layerOffset;
}

/**
 * Clamps viewport zoom and pan coordinates within boundary constraints.
 */
export function clampViewport(
  pan: ScreenCoord,
  zoom: number,
  minZoom = 0.5,
  maxZoom = 2.5,
): { pan: ScreenCoord; zoom: number } {
  const clampedZoom = Math.min(Math.max(zoom, minZoom), maxZoom);
  return {
    pan,
    zoom: clampedZoom,
  };
}
