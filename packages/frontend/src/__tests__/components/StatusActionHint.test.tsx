import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { StatusActionHint } from '../../components/StatusActionHint';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('StatusActionHint', () => {
  it('renders nothing when no hint matches', () => {
    const { container } = renderWithRouter(
      <StatusActionHint status="archived" context="record" canEdit canApprove />
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows Submit hint for draft transmittal with edit perms', () => {
    renderWithRouter(<StatusActionHint status="draft" context="transmittal" canEdit />);
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('hides Submit hint when user lacks edit perms', () => {
    const { container } = renderWithRouter(
      <StatusActionHint status="draft" context="transmittal" canEdit={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows Receive hint for submitted transmittal with approve perms', () => {
    renderWithRouter(<StatusActionHint status="submitted" context="transmittal" canApprove />);
    expect(screen.getByText('Receive')).toBeInTheDocument();
  });

  it('shows Review hint for pending disposition with approve perms', () => {
    renderWithRouter(<StatusActionHint status="pending_approval" context="disposition" canApprove />);
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('shows Return hint for checked_out record', () => {
    renderWithRouter(<StatusActionHint status="checked_out" context="record" canEdit />);
    expect(screen.getByText('Return')).toBeInTheDocument();
  });
});
