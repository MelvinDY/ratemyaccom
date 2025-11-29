import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BrowseFilters from '@/components/browse/BrowseFilters';
import { SearchFilters } from '@/types';

describe('BrowseFilters Component', () => {
  const defaultProps = {
    filters: {} as SearchFilters,
    onFilterChange: vi.fn(),
    onClearFilters: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should display the Filters heading', () => {
      render(<BrowseFilters {...defaultProps} />);
      expect(screen.getByRole('heading', { name: 'Filters' })).toBeInTheDocument();
    });

    it('should display all filter sections', () => {
      render(<BrowseFilters {...defaultProps} />);
      expect(screen.getByLabelText('Filter by university')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by location')).toBeInTheDocument();
      expect(screen.getByLabelText('Minimum price')).toBeInTheDocument();
      expect(screen.getByLabelText('Maximum price')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by minimum rating')).toBeInTheDocument();
    });

    it('should not show Clear All button when no filters are active', () => {
      render(<BrowseFilters {...defaultProps} />);
      expect(screen.queryByLabelText('Clear all filters')).not.toBeInTheDocument();
    });
  });

  describe('Clear Filters', () => {
    it('should show Clear All button when filters are active', () => {
      render(<BrowseFilters {...defaultProps} filters={{ location: 'Kensington' }} />);
      expect(screen.getByLabelText('Clear all filters')).toBeInTheDocument();
    });

    it('should call onClearFilters when Clear All is clicked', async () => {
      const user = userEvent.setup();
      const onClearFilters = vi.fn();
      render(
        <BrowseFilters
          {...defaultProps}
          filters={{ location: 'Kensington' }}
          onClearFilters={onClearFilters}
        />
      );

      await user.click(screen.getByLabelText('Clear all filters'));
      expect(onClearFilters).toHaveBeenCalledTimes(1);
    });
  });

  describe('Location Filter', () => {
    it('should call onFilterChange when location is entered', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      render(<BrowseFilters {...defaultProps} onFilterChange={onFilterChange} />);

      const locationInput = screen.getByLabelText('Filter by location');
      await user.type(locationInput, 'Kensington');

      // Should have been called for each keystroke
      expect(onFilterChange).toHaveBeenCalled();
      expect(onFilterChange.mock.calls.length).toBeGreaterThan(0);
    });

    it('should clear location filter when input is empty', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      render(
        <BrowseFilters
          {...defaultProps}
          filters={{ location: 'Test' }}
          onFilterChange={onFilterChange}
        />
      );

      const locationInput = screen.getByLabelText('Filter by location');
      await user.clear(locationInput);

      expect(onFilterChange).toHaveBeenCalled();
      const lastCall = onFilterChange.mock.calls[onFilterChange.mock.calls.length - 1][0];
      expect(lastCall.location).toBeUndefined();
    });
  });

  describe('Price Filters', () => {
    it('should call onFilterChange when min price is entered', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      render(<BrowseFilters {...defaultProps} onFilterChange={onFilterChange} />);

      const minPriceInput = screen.getByLabelText('Minimum price');
      await user.type(minPriceInput, '300');

      // Should have been called for each keystroke
      expect(onFilterChange).toHaveBeenCalled();
      expect(onFilterChange.mock.calls.length).toBeGreaterThan(0);
    });

    it('should call onFilterChange when max price is entered', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      render(<BrowseFilters {...defaultProps} onFilterChange={onFilterChange} />);

      const maxPriceInput = screen.getByLabelText('Maximum price');
      await user.type(maxPriceInput, '500');

      // Should have been called for each keystroke
      expect(onFilterChange).toHaveBeenCalled();
      expect(onFilterChange.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('Active Filters Summary', () => {
    it('should display active filter badges', () => {
      render(
        <BrowseFilters
          {...defaultProps}
          filters={{
            university: 'University of New South Wales (UNSW)',
            location: 'Kensington',
            priceMin: 300,
            priceMax: 500,
            rating: 4,
          }}
        />
      );

      // University appears in both dropdown and badge, so use getAllByText
      expect(screen.getAllByText('University of New South Wales (UNSW)').length).toBeGreaterThan(0);
      // Kensington appears in both input and badge
      expect(document.body.textContent).toContain('Kensington');
      expect(screen.getByText('Min: $300')).toBeInTheDocument();
      expect(screen.getByText('Max: $500')).toBeInTheDocument();
      // Rating appears in both dropdown and badge
      expect(screen.getAllByText('4+ Stars').length).toBeGreaterThan(0);
    });

    it('should not display Active Filters section when no filters', () => {
      render(<BrowseFilters {...defaultProps} />);
      expect(screen.queryByText('Active Filters:')).not.toBeInTheDocument();
    });

    it('should display Active Filters section when filters exist', () => {
      render(<BrowseFilters {...defaultProps} filters={{ location: 'Test' }} />);
      expect(screen.getByText('Active Filters:')).toBeInTheDocument();
    });
  });

  describe('University Filter', () => {
    it('should display university dropdown', () => {
      render(<BrowseFilters {...defaultProps} />);
      const universityTrigger = screen.getByLabelText('Filter by university');
      expect(universityTrigger).toBeInTheDocument();
    });

    it('should show "All Universities" as default', () => {
      render(<BrowseFilters {...defaultProps} />);
      expect(screen.getByText('All Universities')).toBeInTheDocument();
    });
  });

  describe('Rating Filter', () => {
    it('should display rating dropdown', () => {
      render(<BrowseFilters {...defaultProps} />);
      const ratingTrigger = screen.getByLabelText('Filter by minimum rating');
      expect(ratingTrigger).toBeInTheDocument();
    });

    it('should show "All Ratings" as default', () => {
      render(<BrowseFilters {...defaultProps} />);
      expect(screen.getByText('All Ratings')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<BrowseFilters {...defaultProps} />);

      expect(screen.getByLabelText('Filter by university')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by location')).toBeInTheDocument();
      expect(screen.getByLabelText('Minimum price')).toBeInTheDocument();
      expect(screen.getByLabelText('Maximum price')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by minimum rating')).toBeInTheDocument();
    });

    it('should have clear all button with aria-label', () => {
      render(<BrowseFilters {...defaultProps} filters={{ location: 'Test' }} />);
      expect(screen.getByLabelText('Clear all filters')).toBeInTheDocument();
    });
  });
});
