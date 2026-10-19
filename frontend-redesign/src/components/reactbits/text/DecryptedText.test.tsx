import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DecryptedText } from './DecryptedText';

describe('DecryptedText', () => {
  it('renders text with screen reader accessible span', () => {
    const { container } = render(<DecryptedText text="CONFIRMED PASS" />);

    const srOnly = container.querySelector('.sr-only');
    expect(srOnly).toHaveTextContent('CONFIRMED PASS');

    const ariaHidden = container.querySelector('[aria-hidden="true"]');
    expect(ariaHidden).toBeInTheDocument();
  });

  it('handles click animation trigger and keyboard activation', () => {
    render(<DecryptedText text="DECRYPT ME" animateOn="click" />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('tabindex', '0');

    // Trigger keypress
    fireEvent.keyDown(button, { key: 'Enter' });
  });
});
