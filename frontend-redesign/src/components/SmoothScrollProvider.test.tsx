import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SmoothScrollProvider, useSmoothScroll } from './SmoothScrollProvider';

let scrollTarget: unknown = null;

function TestConsumer() {
  const { lenis, scrollTo } = useSmoothScroll();
  return (
    <div>
      <span data-testid="has-lenis">{lenis ? 'yes' : 'no'}</span>
      <button
        type="button"
        onClick={() => {
          if (lenis) {
            vi.spyOn(lenis, 'scrollTo').mockImplementation((target) => {
              scrollTarget = target;
            });
          }
          scrollTo(100);
        }}
      >
        Scroll Action
      </button>
    </div>
  );
}

describe('SmoothScrollProvider', () => {
  it('renders children and provides scroll context with lenis instance', () => {
    render(
      <SmoothScrollProvider>
        <TestConsumer />
      </SmoothScrollProvider>,
    );

    const button = screen.getByRole('button', { name: 'Scroll Action' });
    expect(button).toBeInTheDocument();

    button.click();
    expect(scrollTarget).toBe(100);
  });
});
