import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { INITIAL_EVENT_PINS } from '../data/campusMapData';
import { useMapKeyboardNav } from './useMapKeyboardNav';

describe('useMapKeyboardNav', () => {
  const onSelectPin = vi.fn();
  const onClearSelection = vi.fn();

  it('cycles focused pin forward on ArrowDown and ArrowRight', () => {
    const { result } = renderHook(() =>
      useMapKeyboardNav({
        pins: INITIAL_EVENT_PINS,
        selectedPinId: null,
        onSelectPin,
        onClearSelection,
      }),
    );

    expect(result.current.focusedIndex).toBe(0);

    act(() => {
      result.current.handleKeyDown({
        key: 'ArrowDown',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.focusedIndex).toBe(1);

    act(() => {
      result.current.handleKeyDown({
        key: 'ArrowRight',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.focusedIndex).toBe(2);
  });

  it('cycles focused pin backward with wrap-around on ArrowUp and ArrowLeft', () => {
    const { result } = renderHook(() =>
      useMapKeyboardNav({
        pins: INITIAL_EVENT_PINS,
        selectedPinId: null,
        onSelectPin,
        onClearSelection,
      }),
    );

    expect(result.current.focusedIndex).toBe(0);

    act(() => {
      result.current.handleKeyDown({
        key: 'ArrowUp',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.focusedIndex).toBe(INITIAL_EVENT_PINS.length - 1);
  });

  it('triggers onSelectPin on Enter or Space key', () => {
    const { result } = renderHook(() =>
      useMapKeyboardNav({
        pins: INITIAL_EVENT_PINS,
        selectedPinId: null,
        onSelectPin,
        onClearSelection,
      }),
    );

    act(() => {
      result.current.handleKeyDown({
        key: 'Enter',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(onSelectPin).toHaveBeenCalledWith(INITIAL_EVENT_PINS[0].id);
  });

  it('triggers onClearSelection on Escape key', () => {
    const { result } = renderHook(() =>
      useMapKeyboardNav({
        pins: INITIAL_EVENT_PINS,
        selectedPinId: 101,
        onSelectPin,
        onClearSelection,
      }),
    );

    act(() => {
      result.current.handleKeyDown({
        key: 'Escape',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(onClearSelection).toHaveBeenCalled();
  });
});
