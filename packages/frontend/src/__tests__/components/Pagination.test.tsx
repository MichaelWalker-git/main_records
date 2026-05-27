import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from '../../components/Pagination';

describe('Pagination', () => {
  it('renders nothing when totalPages <= 1', () => {
    const { container } = render(
      <Pagination page={1} pageSize={25} total={5} totalPages={1} onPageChange={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders page range info', () => {
    render(
      <Pagination page={2} pageSize={25} total={100} totalPages={4} onPageChange={() => {}} />
    );
    expect(screen.getByText('26–50 of 100')).toBeInTheDocument();
  });

  it('disables prev on first page', () => {
    render(
      <Pagination page={1} pageSize={25} total={100} totalPages={4} onPageChange={() => {}} />
    );
    expect(screen.getByTestId('pagination-prev')).toBeDisabled();
  });

  it('disables next on last page', () => {
    render(
      <Pagination page={4} pageSize={25} total={100} totalPages={4} onPageChange={() => {}} />
    );
    expect(screen.getByTestId('pagination-next')).toBeDisabled();
  });

  it('calls onPageChange when next is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Pagination page={2} pageSize={25} total={100} totalPages={4} onPageChange={onChange} />
    );

    await user.click(screen.getByTestId('pagination-next'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('marks current page with aria-current', () => {
    render(
      <Pagination page={2} pageSize={25} total={100} totalPages={4} onPageChange={() => {}} />
    );
    const currentBtn = screen.getByLabelText('Page 2');
    expect(currentBtn).toHaveAttribute('aria-current', 'page');
  });
});
