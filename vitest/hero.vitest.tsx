import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from '@/components/ui/Hero';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    ),
    h1: ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className={className} {...props}>
        {children}
      </h1>
    ),
    p: ({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className={className} {...props}>
        {children}
      </p>
    ),
    button: ({ children, className, ...props }: React.HTMLAttributes<HTMLButtonElement>) => (
      <button className={className} {...props}>
        {children}
      </button>
    ),
  },
  useScroll: () => ({ scrollY: { get: () => 0 } }),
  useTransform: () => 0,
}));

describe('Hero Component', () => {
  describe('Visual Appearance', () => {
    it('should display the overline badge', () => {
      render(<Hero />);
      expect(screen.getByText('NSW Universities')).toBeInTheDocument();
    });

    it('should display the main headline words', () => {
      render(<Hero />);
      expect(screen.getByText('Student')).toBeInTheDocument();
      expect(screen.getByText('Housing')).toBeInTheDocument();
      expect(screen.getByText('Reviews')).toBeInTheDocument();
    });

    it('should display the subtitle', () => {
      render(<Hero />);
      expect(screen.getByText(/Discover verified reviews from real students/i)).toBeInTheDocument();
    });

    it('should display CTA buttons', () => {
      render(<Hero />);
      expect(screen.getByText('Explore')).toBeInTheDocument();
      expect(screen.getByText('Take Quiz')).toBeInTheDocument();
    });

    it('should have h1 headings for main text', () => {
      render(<Hero />);
      const headings = screen.getAllByRole('heading', { level: 1 });
      expect(headings.length).toBeGreaterThanOrEqual(3); // Student, Housing, Reviews
    });
  });

  describe('Links and Navigation', () => {
    it('should have correct href for Explore link', () => {
      render(<Hero />);
      const exploreLink = screen.getByRole('link', { name: /Explore/i });
      expect(exploreLink).toHaveAttribute('href', '/browse');
    });

    it('should have correct href for Take Quiz link', () => {
      render(<Hero />);
      const quizLink = screen.getByRole('link', { name: /Take Quiz/i });
      expect(quizLink).toHaveAttribute('href', '/quiz');
    });
  });

  describe('Stats and Information', () => {
    it('should display total reviews stat', () => {
      render(<Hero />);
      expect(screen.getByText('100+')).toBeInTheDocument();
      expect(screen.getByText('Verified student reviews')).toBeInTheDocument();
    });

    it('should display universities count', () => {
      render(<Hero />);
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Universities')).toBeInTheDocument();
    });

    it('should display listings count', () => {
      render(<Hero />);
      expect(screen.getByText('50+')).toBeInTheDocument();
      expect(screen.getByText('Listings')).toBeInTheDocument();
    });

    it('should display verified badge', () => {
      render(<Hero />);
      expect(screen.getByText('Verified Only')).toBeInTheDocument();
      expect(screen.getByText('All reviews from real students')).toBeInTheDocument();
    });
  });

  describe('Styling and Structure', () => {
    it('should have dark background', () => {
      render(<Hero />);
      const container = document.querySelector('.bg-\\[\\#0a0a0a\\]');
      expect(container).toBeInTheDocument();
    });

    it('should have responsive container', () => {
      render(<Hero />);
      const heading = screen.getAllByRole('heading', { level: 1 })[0];
      expect(heading).toHaveClass('text-6xl');
    });

    it('should display university names in footer', () => {
      render(<Hero />);
      expect(screen.getByText('UNSW')).toBeInTheDocument();
      expect(screen.getByText('Sydney')).toBeInTheDocument();
      expect(screen.getByText('UTS')).toBeInTheDocument();
      expect(screen.getByText('Macquarie')).toBeInTheDocument();
      expect(screen.getByText('WSU')).toBeInTheDocument();
    });
  });
});
