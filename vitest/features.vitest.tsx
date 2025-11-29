import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Features from '@/components/sections/Features';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { whileHover?: object; variants?: object }) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
  useInView: () => true,
}));

describe('Features Component', () => {
  describe('Section Header', () => {
    it('should display the Features badge', () => {
      render(<Features />);
      expect(screen.getByText('Features')).toBeInTheDocument();
    });

    it('should display the main heading', () => {
      render(<Features />);
      expect(screen.getByText(/Everything You Need to/i)).toBeInTheDocument();
      expect(screen.getByText('Find Your Home')).toBeInTheDocument();
    });

    it('should display the subheading', () => {
      render(<Features />);
      expect(
        screen.getByText(/Discover why thousands of students trust Rate My Accom/i)
      ).toBeInTheDocument();
    });

    it('should have correct heading hierarchy with h2', () => {
      render(<Features />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveAttribute('id', 'features-heading');
    });
  });

  describe('Feature Cards', () => {
    it('should display all 6 feature titles', () => {
      render(<Features />);
      expect(screen.getByRole('heading', { name: 'Real Student Reviews' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Verified Students Only' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Comprehensive Filters' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Photo Galleries' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Detailed Information' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Compare Accommodations' })).toBeInTheDocument();
    });

    it('should display feature descriptions', () => {
      render(<Features />);
      expect(
        screen.getByText(/Read authentic experiences from students who have lived/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/All reviewers are verified with their university email/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Find exactly what you need with advanced filters/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Browse through extensive photo galleries/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Access comprehensive details about each accommodation/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Side-by-side comparison tool to help you make/i)
      ).toBeInTheDocument();
    });

    it('should have 6 h3 headings for feature cards', () => {
      render(<Features />);
      const h3Headings = screen.getAllByRole('heading', { level: 3 });
      expect(h3Headings).toHaveLength(6);
    });
  });

  describe('Accessibility', () => {
    it('should have semantic section element with aria-labelledby', () => {
      render(<Features />);
      const section = document.querySelector('section[aria-labelledby="features-heading"]');
      expect(section).toBeInTheDocument();
    });

    it('should have icons with aria-hidden attribute', () => {
      render(<Features />);
      const hiddenIcons = document.querySelectorAll('svg[aria-hidden="true"]');
      expect(hiddenIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Grid Layout', () => {
    it('should have grid with responsive classes', () => {
      render(<Features />);
      const grid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('should have 6 feature cards', () => {
      render(<Features />);
      const cards = document.querySelectorAll('.group.relative');
      expect(cards).toHaveLength(6);
    });
  });

  describe('Styling', () => {
    it('should have bg-gray-900 background on section', () => {
      render(<Features />);
      const section = document.querySelector('section');
      expect(section).toHaveClass('bg-gray-900');
    });

    it('should have animated blur backgrounds', () => {
      render(<Features />);
      const blurElements = document.querySelectorAll('[class*="blur-3xl"]');
      expect(blurElements.length).toBe(2);
    });
  });
});
