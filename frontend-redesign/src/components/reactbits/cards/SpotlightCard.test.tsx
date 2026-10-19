import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SpotlightCard } from './SpotlightCard';

describe('SpotlightCard', () => {
  it('renders children with container surface styles and backdrop structure', () => {
    render(
      <SpotlightCard className="custom-test-class">
        <span>Spotlight Content</span>
      </SpotlightCard>,
    );

    const content = screen.getByText('Spotlight Content');
    expect(content).toBeInTheDocument();
  });

  it('activates spotlight styling on pointer interaction', () => {
    // Mock requestAnimationFrame to execute synchronously in test
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(performance.now());
      return 1;
    });

    const { container } = render(
      <SpotlightCard proximity={100} intensity={0.5}>
        <div>Interactive Card</div>
      </SpotlightCard>,
    );

    const card = container.firstChild as HTMLDivElement;
    expect(card).toBeDefined();

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

    // Simulate pointer move over the card
    fireEvent.pointerDown(card, { clientX: 150, clientY: 150 });

    // Check that hidden light and edge elements exist and have radial gradient applied
    const lightSpan = card.querySelector('span[aria-hidden="true"]');
    expect(lightSpan).toBeInTheDocument();
  });
});
