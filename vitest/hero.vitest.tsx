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
    it('should display the badge', () => {
      render(<Hero />);
      expect(screen.getByText('Built for NSW Students')).toBeInTheDocument();
    });

    it('should display the main headline', () => {
      render(<Hero />);
      expect(screen.getByText('Find Your Perfect')).toBeInTheDocument();
      expect(screen.getByText('Student Accommodation')).toBeInTheDocument();
      expect(screen.getByText('in NSW')).toBeInTheDocument();
    });

    it('should display the subtitle', () => {
      render(<Hero />);
      expect(
        screen.getByText(
          /Real reviews from real students\. Make informed decisions about where you'll call home during your university years\./i
        )
      ).toBeInTheDocument();
    });

    it('should display CTA buttons', () => {
      render(<Hero />);
      expect(screen.getByText('Explore Accommodations')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
    });

    it('should have the h1 heading', () => {
      render(<Hero />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Links and Navigation', () => {
    it('should have correct href for Explore Accommodations link', () => {
      render(<Hero />);
      const exploreLink = screen.getByRole('link', { name: /Explore Accommodations/i });
      expect(exploreLink).toHaveAttribute('href', '/browse');
    });

    it('should have correct href for Learn More link', () => {
      render(<Hero />);
      const learnMoreLink = screen.getByRole('link', { name: /Learn More/i });
      expect(learnMoreLink).toHaveAttribute('href', '/about');
    });
  });

  describe('Styling and Structure', () => {
    it('should have gradient background', () => {
      render(<Hero />);
      const heroContainer = screen.getByText('Find Your Perfect').closest('.bg-gradient-to-br');
      expect(heroContainer).toBeInTheDocument();
    });

    it('should have responsive container classes', () => {
      render(<Hero />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-5xl');
    });
  });
});
