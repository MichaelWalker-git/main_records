import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchInput } from '../../components/SearchInput';

describe('SearchInput', () => {
  it('renders input with placeholder', () => {
    render(<SearchInput placeholder="Search records..." onSearch={vi.fn()} />);
    expect(screen.getByPlaceholderText('Search records...')).toBeInTheDocument();
  });

  it('renders default placeholder when none provided', () => {
    render(<SearchInput onSearch={vi.fn()} />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('has search role for accessibility', () => {
    render(<SearchInput onSearch={vi.fn()} />);
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('shows semantic toggle when enabled', () => {
    render(<SearchInput onSearch={vi.fn()} showSemanticToggle />);
    expect(screen.getByTestId('semantic-toggle')).toBeInTheDocument();
    expect(screen.getByText('AI Search')).toBeInTheDocument();
  });

  it('hides semantic toggle by default', () => {
    render(<SearchInput onSearch={vi.fn()} />);
    expect(screen.queryByTestId('semantic-toggle')).not.toBeInTheDocument();
  });

  it('has data-testid', () => {
    render(<SearchInput onSearch={vi.fn()} />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });
});