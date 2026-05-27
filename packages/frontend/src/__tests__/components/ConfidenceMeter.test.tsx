import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ConfidenceMeter } from '../../components/ConfidenceMeter';

describe('ConfidenceMeter', () => {
  it('renders percentage text', () => {
    render(<ConfidenceMeter score={0.92} />);
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('renders green bar for high confidence', () => {
    const { container } = render(<ConfidenceMeter score={0.95} />);
    expect(container.querySelector('.bg-green-500')).toBeInTheDocument();
  });

  it('renders amber bar for medium confidence', () => {
    const { container } = render(<ConfidenceMeter score={0.65} />);
    expect(container.querySelector('.bg-amber-500')).toBeInTheDocument();
  });

  it('renders red bar for low confidence', () => {
    const { container } = render(<ConfidenceMeter score={0.3} />);
    expect(container.querySelector('.bg-red-500')).toBeInTheDocument();
  });

  it('has data-testid', () => {
    render(<ConfidenceMeter score={0.5} />);
    expect(screen.getByTestId('confidence-meter')).toBeInTheDocument();
  });
});
