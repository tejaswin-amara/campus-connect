import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BlurText } from './BlurText';

describe('BlurText', () => {
  it('renders accessible text with sr-only span and semantic tag', () => {
    const { container } = render(
      <BlurText text="Welcome to Campus" as="h1" className="text-4xl" />,
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();

    const srOnly = container.querySelector('.sr-only');
    expect(srOnly).toHaveTextContent('Welcome to Campus');
  });

  it('supports click trigger with keyboard accessibility role and tabIndex', () => {
    render(<BlurText text="Clickable Blur" trigger="click" as="div" />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('tabindex', '0');

    // Simulate Enter key
    fireEvent.keyDown(button, { key: 'Enter' });
  });
});
