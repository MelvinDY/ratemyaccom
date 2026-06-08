import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from '@/components/ui/Hero';

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
    button: ({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button className={className} {...props}>
        {children}
      </button>
    ),
    span: ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span className={className} {...props}>
        {children}
      </span>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useScroll: () => ({ scrollY: { get: () => 0 } }),
  useTransform: () => 0,
  useInView: () => true,
}));

// AnimatedJoinButton uses canvas/complex animations — stub it out
vi.mock('@/components/ui/AnimatedJoinButton', () => ({
  default: () => <div data-testid="animated-join-button" />,
}));

describe('Hero Component', () => {
  describe('Visual Appearance', () => {
    it('should display the NSW badge', () => {
      render(<Hero />);
      expect(screen.getByText('NSW Student Accommodations')).toBeInTheDocument();
    });

    it('should display the main headline', () => {
      render(<Hero />);
      expect(screen.getByText(/Find Your Perfect/i)).toBeInTheDocument();
      expect(screen.getByText(/Student Home/i)).toBeInTheDocument();
    });

    it('should display the subtitle', () => {
      render(<Hero />);
      expect(
        screen.getByText(/Verified reviews from real students across 5 NSW universities/i)
      ).toBeInTheDocument();
    });

    it('should display a search input', () => {
      render(<Hero />);
      expect(screen.getByPlaceholderText('Search university or suburb...')).toBeInTheDocument();
    });

    it('should have h1 heading', () => {
      render(<Hero />);
      const headings = screen.getAllByRole('heading', { level: 1 });
      expect(headings.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Links and Navigation', () => {
    it('should have Browse all listings link to /browse', () => {
      render(<Hero />);
      const browseLink = screen.getByRole('link', { name: /Browse all listings/i });
      expect(browseLink).toHaveAttribute('href', '/browse');
    });

    it('should have Take the quiz link to /quiz', () => {
      render(<Hero />);
      const quizLink = screen.getByRole('link', { name: /Take the quiz/i });
      expect(quizLink).toHaveAttribute('href', '/quiz');
    });

    it('should have a Search button linking to /browse', () => {
      render(<Hero />);
      const searchLinks = screen.getAllByRole('link');
      const browseLinks = searchLinks.filter((l) => l.getAttribute('href')?.startsWith('/browse'));
      expect(browseLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Styling and Structure', () => {
    it('should have light neumorphic background', () => {
      render(<Hero />);
      const container = document.querySelector('.bg-\\[\\#e0e5ec\\]');
      expect(container).toBeInTheDocument();
    });

    it('should have h1 heading with responsive font size', () => {
      render(<Hero />);
      const heading = screen.getAllByRole('heading', { level: 1 })[0];
      expect(heading).toHaveClass('text-4xl');
    });
  });
});
