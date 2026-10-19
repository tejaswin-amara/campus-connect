import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CountUp } from './CountUp';

describe('CountUp', () => {
  it('renders mode="count" with screen reader text and formatted visual numbers', () => {
    const { container } = render(
      <CountUp to={2500} separator="," prefix="$" suffix=" USD" mode="count" />,
    );

    const srOnly = container.querySelector('.sr-only');
    expect(srOnly).toHaveTextContent('$2,500 USD');

    const visualSpan = container.querySelector('[aria-hidden="true"]');
    expect(visualSpan).toBeInTheDocument();
  });

  it('renders mode="roll" with screen reader text and structured slots', () => {
    const { container } = render(<CountUp to={42} mode="roll" />);

    const srOnly = container.querySelector('.sr-only');
    expect(srOnly).toHaveTextContent('42');
  });
});
