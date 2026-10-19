import { useCallback, useEffect, useState } from 'react';
import type { SimCollegeEventPin } from '../types/simcollege';

interface UseMapKeyboardNavProps {
  pins: SimCollegeEventPin[];
  selectedPinId: number | null;
  onSelectPin: (pinId: number) => void;
  onClearSelection: () => void;
}

export function useMapKeyboardNav({
  pins,
  selectedPinId,
  onSelectPin,
  onClearSelection,
}: UseMapKeyboardNavProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  useEffect(() => {
    if (selectedPinId !== null) {
      const idx = pins.findIndex((p) => p.id === selectedPinId);
      if (idx !== -1) setFocusedIndex(idx);
    }
  }, [selectedPinId, pins]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (pins.length === 0) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown': {
          e.preventDefault();
          const nextIndex = (focusedIndex + 1) % pins.length;
          setFocusedIndex(nextIndex);
          break;
        }

        case 'ArrowLeft':
        case 'ArrowUp': {
          e.preventDefault();
          const prevIndex = (focusedIndex - 1 + pins.length) % pins.length;
          setFocusedIndex(prevIndex);
          break;
        }

        case 'Enter':
        case ' ': {
          e.preventDefault();
          const targetPin = pins[focusedIndex];
          if (targetPin) {
            onSelectPin(targetPin.id);
          }
          break;
        }

        case 'Escape': {
          e.preventDefault();
          onClearSelection();
          break;
        }

        default:
          break;
      }
    },
    [pins, focusedIndex, onSelectPin, onClearSelection],
  );

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
    currentFocusedPin: pins[focusedIndex] ?? null,
  };
}
