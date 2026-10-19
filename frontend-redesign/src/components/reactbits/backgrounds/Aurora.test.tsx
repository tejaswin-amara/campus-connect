import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Aurora } from './Aurora';

describe('Aurora', () => {
  it('renders container and canvas with aria-hidden="true"', () => {
    const { container } = render(<Aurora className="custom-aurora" />);

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    expect(container.firstChild).toHaveClass('custom-aurora');
  });

  it('handles absence of WebGL2 context gracefully without crashing', () => {
    // In jsdom canvas.getContext('webgl2') returns null by default
    expect(() => {
      render(<Aurora mouseInteraction={false} paused={true} />);
    }).not.toThrow();
  });
});
