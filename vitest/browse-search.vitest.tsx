import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BrowseSearch from '@/components/browse/BrowseSearch';

describe('BrowseSearch Component', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render search input', () => {
      render(<BrowseSearch {...defaultProps} />);
      expect(screen.getByLabelText('Search accommodations')).toBeInTheDocument();
    });

    it('should display default placeholder', () => {
      render(<BrowseSearch {...defaultProps} />);
      expect(
        screen.getByPlaceholderText('Search by name, location, or university...')
      ).toBeInTheDocument();
    });

    it('should display custom placeholder when provided', () => {
      render(<BrowseSearch {...defaultProps} placeholder="Custom placeholder" />);
      expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
    });

    it('should display current value', () => {
      render(<BrowseSearch {...defaultProps} value="UNSW Village" />);
      expect(screen.getByDisplayValue('UNSW Village')).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('should call onChange when user types', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<BrowseSearch {...defaultProps} onChange={onChange} />);

      const searchInput = screen.getByLabelText('Search accommodations');
      await user.type(searchInput, 'UNSW');

      expect(onChange).toHaveBeenCalled();
      // Each keystroke triggers onChange
      expect(onChange).toHaveBeenCalledTimes(4); // U, N, S, W
    });

    it('should call onChange with each keystroke', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<BrowseSearch {...defaultProps} onChange={onChange} />);

      const searchInput = screen.getByLabelText('Search accommodations');
      await user.type(searchInput, 'Test');

      // onChange is called for each keystroke with the cumulative value
      expect(onChange).toHaveBeenCalled();
      // The calls build up: 'T', 'Te', 'Tes', 'Test'
      expect(onChange.mock.calls.length).toBe(4);
    });

    it('should allow clearing the search', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<BrowseSearch {...defaultProps} value="Test" onChange={onChange} />);

      const searchInput = screen.getByLabelText('Search accommodations');
      await user.clear(searchInput);

      expect(onChange).toHaveBeenLastCalledWith('');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label for accessibility', () => {
      render(<BrowseSearch {...defaultProps} />);
      const input = screen.getByLabelText('Search accommodations');
      expect(input).toHaveAttribute('aria-label', 'Search accommodations');
    });

    it('should be focusable', async () => {
      const user = userEvent.setup();
      render(<BrowseSearch {...defaultProps} />);

      const searchInput = screen.getByLabelText('Search accommodations');
      await user.click(searchInput);

      expect(searchInput).toHaveFocus();
    });

    it('should have type="text"', () => {
      render(<BrowseSearch {...defaultProps} />);
      const input = screen.getByLabelText('Search accommodations');
      expect(input).toHaveAttribute('type', 'text');
    });
  });

  describe('Styling', () => {
    it('should have search icon container', () => {
      render(<BrowseSearch {...defaultProps} />);
      // The search icon should be in the DOM
      const container = document.querySelector('.group');
      expect(container).toBeInTheDocument();
    });

    it('should have rounded styling', () => {
      render(<BrowseSearch {...defaultProps} />);
      const input = screen.getByLabelText('Search accommodations');
      expect(input).toHaveClass('rounded-3xl');
    });
  });
});
