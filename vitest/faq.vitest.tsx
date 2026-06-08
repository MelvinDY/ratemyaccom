import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FAQ from '@/components/sections/FAQ';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { variants?: object }) => (
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
    section: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLElement> & { variants?: object }) => (
      <section className={className} {...props}>
        {children}
      </section>
    ),
    button: ({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button className={className} {...props}>
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useInView: () => true,
}));

describe('FAQ Component', () => {
  describe('Section Header', () => {
    it('should display the FAQ badge', () => {
      render(<FAQ />);
      expect(screen.getByText('FAQ')).toBeInTheDocument();
    });

    it('should display the main heading', () => {
      render(<FAQ />);
      expect(screen.getByText(/Frequently asked questions/i)).toBeInTheDocument();
    });

    it('should have correct heading hierarchy with h2', () => {
      render(<FAQ />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveAttribute('id', 'faq-heading');
    });
  });

  describe('FAQ Questions', () => {
    it('should display all 6 FAQ questions', () => {
      render(<FAQ />);
      expect(screen.getByText('How do I leave a review?')).toBeInTheDocument();
      expect(screen.getByText('Are all reviews verified?')).toBeInTheDocument();
      expect(screen.getByText('How do I search for accommodation?')).toBeInTheDocument();
      expect(screen.getByText('Is the service free to use?')).toBeInTheDocument();
      expect(screen.getByText('How are ratings calculated?')).toBeInTheDocument();
      expect(screen.getByText('Can I edit or delete my review?')).toBeInTheDocument();
    });

    it('should have a toggle button for each question', () => {
      render(<FAQ />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('Accordion Behaviour', () => {
    it('should show the first answer open by default', () => {
      render(<FAQ />);
      expect(
        screen.getByText(/Create an account using your university email address/i)
      ).toBeInTheDocument();
    });

    it('should reveal an answer when its question is clicked', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      const question = screen.getByText('Are all reviews verified?');
      await user.click(question);

      expect(
        screen.getByText(
          /All reviewers must verify their identity using a valid university email address/i
        )
      ).toBeInTheDocument();
    });

    it('should show the ratings answer when that question is clicked', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      const question = screen.getByText('How are ratings calculated?');
      await user.click(question);

      expect(
        screen.getByText(/Overall ratings average scores across six categories/i)
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic section element with aria-labelledby', () => {
      render(<FAQ />);
      const section = document.querySelector('section[aria-labelledby="faq-heading"]');
      expect(section).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(<FAQ />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Styling', () => {
    it('should have light neumorphic background on section', () => {
      render(<FAQ />);
      const section = document.querySelector('section');
      expect(section).toHaveClass('bg-[#e0e5ec]');
    });
  });
});
