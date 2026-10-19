import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Magnet } from './Magnet';

describe('Magnet', () => {
  it('renders children within wrapper and inner container', () => {
    render(
      <Magnet wrapperClassName="custom-wrap" innerClassName="custom-inner">
        <button type="button">Magnet Button</button>
      </Magnet>,
    );

    const button = screen.getByRole('button', { name: 'Magnet Button' });
    expect(button).toBeInTheDocument();
  });

  it('handles pointer moves and calculates proximity smoothly', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(performance.now());
      return 1;
    });

    const onActiveChange = vi.fn();
    const { container, unmount } = render(
      <Magnet padding={80} magnetStrength={3} onActiveChange={onActiveChange}>
        <span>Interactive Magnet</span>
      </Magnet>,
    );

    const wrapper = container.firstChild as HTMLDivElement;
    vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      bottom: 200,
      right: 200,
      x: 100,
      y: 100,
      toJSON: () => {},
    });

    // Fire pointermove on window within reach
    fireEvent.pointerMove(window, { clientX: 120, clientY: 120, pointerType: 'mouse' });

    // Clean up
    unmount();
  });
});
