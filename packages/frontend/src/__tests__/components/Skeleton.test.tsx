import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from '../../components/Skeleton';

describe('Skeleton', () => {
  it('renders single skeleton block by default', () => {
    render(<Skeleton />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders multiple skeletons when count is set', () => {
    const { container } = render(<Skeleton count={3} />);
    const inner = container.querySelectorAll('[aria-hidden="true"]');
    expect(inner.length).toBe(3);
  });

  it('renders table-row variant with multiple cells', () => {
    const { container } = render(<Skeleton variant="table-row" />);
    const cells = container.querySelectorAll('.bg-slate-200');
    expect(cells.length).toBeGreaterThan(1);
  });

  it('applies custom width', () => {
    const { container } = render(<Skeleton width={200} />);
    const el = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(el.style.width).toBe('200px');
  });
});
