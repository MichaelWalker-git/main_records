import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HelpHint } from '../../components/HelpHint';

describe('HelpHint', () => {
  it('renders info icon', () => {
    render(<HelpHint content="More info" />);
    expect(screen.getByTestId('help-hint')).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<HelpHint content="More info" />);
    expect(screen.getByLabelText('More information')).toBeInTheDocument();
  });
});
