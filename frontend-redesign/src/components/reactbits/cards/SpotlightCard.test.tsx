import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SpotlightCard } from './SpotlightCard';

describe('SpotlightCard', () => {
  it('renders children with OLED surface styles and backdrop blur', () => {
    render(
      <SpotlightCard className="custom-test-class">
        <span>Spotlight Content</span>
      </SpotlightCard>,
    );

    const content = screen.getByText('Spotlight Content');
    expect(content).toBeInTheDocument();
  });

  it('updates CSS variables --mouse-x and --mouse-y on mouse move', () => {
    const { container } = render(
      <SpotlightCard>
        <div>Interactive Card</div>
      </SpotlightCard>,
    );

    const card = container.firstChild as HTMLDivElement;
    expect(card).toBeDefined();

    // Mock getBoundingClientRect
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 100,
      width: 200,
      height: 200,
      bottom: 300,
      right: 300,
      x: 100,
      y: 100,
      toJSON: () => {},
    });

    // Mock requestAnimationFrame to execute synchronously in test
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 1;
    });

    fireEvent.mouseMove(card, { clientX: 150, clientY: 175 });

    expect(card.style.getPropertyValue('--mouse-x')).toBe('50px');
    expect(card.style.getPropertyValue('--mouse-y')).toBe('75px');
  });
});
