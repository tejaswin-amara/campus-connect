import { describe, expect, it } from 'vitest';
import {
  calculateDepth,
  clampViewport,
  getTilePolygonPoints,
  gridToScreen,
  screenToGrid,
} from './isometricMath';

describe('isometricMath', () => {
  it('correctly maps origin (0,0) to screen origin', () => {
    const screen = gridToScreen({ x: 0, y: 0 });
    expect(screen).toEqual({ x: 0, y: 0 });
  });

  it('maps grid coordinates with standard 2:1 dimetric ratio', () => {
    // For 128x64 tile: halfW = 64, halfH = 32
    // (1, 0) -> x = (1 - 0) * 64 = 64, y = (1 + 0) * 32 = 32
    const screen1 = gridToScreen({ x: 1, y: 0 });
    expect(screen1).toEqual({ x: 64, y: 32 });

    // (0, 1) -> x = (0 - 1) * 64 = -64, y = (0 + 1) * 32 = 32
    const screen2 = gridToScreen({ x: 0, y: 1 });
    expect(screen2).toEqual({ x: -64, y: 32 });

    // (1, 1) -> x = (1 - 1) * 64 = 0, y = (1 + 1) * 32 = 64
    const screen3 = gridToScreen({ x: 1, y: 1 });
    expect(screen3).toEqual({ x: 0, y: 64 });
  });

  it('accounts for vertical elevation z', () => {
    const elevated = gridToScreen({ x: 2, y: 2, z: 20 });
    // Without z: x = 0, y = 4 * 32 = 128
    // With z=20: y = 128 - 20 = 108
    expect(elevated).toEqual({ x: 0, y: 108 });
  });

  it('inverts gridToScreen back with sub-pixel precision across integer and float coordinates', () => {
    const testCases = [
      { x: 0, y: 0 },
      { x: 3, y: 5 },
      { x: -2, y: 4 },
      { x: 7.25, y: 1.5 },
      { x: 10, y: 10 },
    ];

    for (const original of testCases) {
      const screen = gridToScreen(original);
      const inverted = screenToGrid(screen);
      expect(inverted.x).toBeCloseTo(original.x, 5);
      expect(inverted.y).toBeCloseTo(original.y, 5);
    }
  });

  it('generates four valid diamond polygon points for SVG rendering', () => {
    const pointsStr = getTilePolygonPoints(0, 0);
    const points = pointsStr.split(' ').map((p) => p.split(',').map(Number));

    expect(points.length).toBe(4);
    // Top point
    expect(points[0]).toEqual([0, 0]);
    // Right point (1, 0)
    expect(points[1]).toEqual([64, 32]);
    // Bottom point (1, 1)
    expect(points[2]).toEqual([0, 64]);
    // Left point (0, 1)
    expect(points[3]).toEqual([-64, 32]);
  });

  it('computes depth sorting keys maintaining back-to-front rendering order', () => {
    const backItem = calculateDepth(1, 1, 0);
    const frontItem = calculateDepth(3, 4, 0);
    expect(frontItem).toBeGreaterThan(backItem);

    // Layer offset prioritizes higher layer on the same tile coordinate
    const groundLayer = calculateDepth(2, 2, 0);
    const pinLayer = calculateDepth(2, 2, 100);
    expect(pinLayer).toBeGreaterThan(groundLayer);
  });

  it('clamps zoom levels within bounds', () => {
    const minClamped = clampViewport({ x: 100, y: 50 }, 0.2, 0.5, 2.0);
    expect(minClamped.zoom).toBe(0.5);

    const maxClamped = clampViewport({ x: 100, y: 50 }, 3.5, 0.5, 2.0);
    expect(maxClamped.zoom).toBe(2.0);

    const normal = clampViewport({ x: 100, y: 50 }, 1.2, 0.5, 2.0);
    expect(normal.zoom).toBe(1.2);
  });
});
