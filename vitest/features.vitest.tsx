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
    h2: ({
      children,
      className,
      id,
      ...props
    }: React.HTMLAttributes<HTMLHeadingElement> & { variants?: object }) => (
      <h2 className={className} id={id} {...props}>
        {children}
      </h2>
    ),
    p: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLParagraphElement> & { variants?: object }) => (
      <p className={className} {...props}>
        {children}
      </p>
    ),
    span: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLSpanElement> & { variants?: object }) => (
      <span className={className} {...props}>
        {children}
      </span>
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
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toContain('Everything');
      expect(heading.textContent).toContain('need');
    });

    it('should display the subheading', () => {
      render(<Features />);
      expect(
        screen.getByText(/Powerful tools to help you find the perfect student accommodation/i)
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
      expect(screen.getByRole('heading', { name: 'Real Reviews' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Verified Students' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Smart Filters' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Photo Galleries' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Detailed Info' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Easy Comparison' })).toBeInTheDocument();
    });

    it('should display feature descriptions', () => {
      render(<Features />);
      expect(
        screen.getByText(/Authentic experiences from students who have lived there/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/All reviewers verified with university email addresses/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Find exactly what you need with advanced filtering/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Browse student-uploaded photos/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Comprehensive details including amenities, transport links/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Compare options side-by-side/i)).toBeInTheDocument();
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
  });

  describe('Grid Layout', () => {
    it('should have grid with responsive classes', () => {
      render(<Features />);
      const grid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('should have 6 feature cards', () => {
      render(<Features />);
      const cards = document.querySelectorAll('.group');
      expect(cards).toHaveLength(6);
    });
  });

  describe('Styling', () => {
    it('should have dark background on section', () => {
      render(<Features />);
      const section = document.querySelector('section');
      expect(section).toHaveClass('bg-neutral-950');
    });
  });
});
