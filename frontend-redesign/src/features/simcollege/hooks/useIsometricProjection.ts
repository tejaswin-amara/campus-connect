import { useCallback, useRef, useState } from 'react';
import type { ScreenCoord } from '../types/simcollege';
import { clampViewport, gridToScreen } from '../utils/isometricMath';

interface UseIsometricProjectionOptions {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
}

export function useIsometricProjection({
  initialZoom = 1.0,
  minZoom = 0.5,
  maxZoom = 2.2,
}: UseIsometricProjectionOptions = {}) {
  const [pan, setPan] = useState<ScreenCoord>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(initialZoom);
  const isDragging = useRef(false);
  const lastPointerPos = useRef<ScreenCoord>({ x: 0, y: 0 });

  const zoomIn = useCallback(() => {
    setZoom((prev) => clampViewport(pan, prev + 0.2, minZoom, maxZoom).zoom);
  }, [pan, minZoom, maxZoom]);

  const zoomOut = useCallback(() => {
    setZoom((prev) => clampViewport(pan, prev - 0.2, minZoom, maxZoom).zoom);
  }, [pan, minZoom, maxZoom]);

  const resetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1.0);
  }, []);

  const centerOnGrid = useCallback(
    (gridX: number, gridY: number, containerWidth = 800, containerHeight = 600) => {
      const targetScreen = gridToScreen({ x: gridX, y: gridY });
      // Calculate pan required to center targetScreen in the viewport
      setPan({
        x: containerWidth / 2 - targetScreen.x * zoom,
        y: containerHeight / 2 - targetScreen.y * zoom,
      });
    },
    [zoom],
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only primary button
    const target = e.target as Element | null;
    if (target?.closest('[role="button"], button, [data-testid^="event-pin-"]')) {
      return;
    }
    isDragging.current = true;
    lastPointerPos.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - lastPointerPos.current.x;
    const deltaY = e.clientY - lastPointerPos.current.y;
    lastPointerPos.current = { x: e.clientX, y: e.clientY };

    setPan((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if already released
      }
    }
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 0.1 : -0.1;
      setZoom((prev) => clampViewport(pan, prev + zoomFactor, minZoom, maxZoom).zoom);
    },
    [pan, minZoom, maxZoom],
  );

  return {
    pan,
    setPan,
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    resetView,
    centerOnGrid,
    pointerHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onWheel: handleWheel,
    },
  };
}
