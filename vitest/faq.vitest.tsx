import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FAQ from '@/components/sections/FAQ';

// Mock framer-motion to avoid animation issues in tests
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
    a: ({
      children,
      className,
      href,
      ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      whileHover?: object;
      whileTap?: object;
    }) => (
      <a className={className} href={href} {...props}>
        {children}
      </a>
    ),
  },
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
      expect(screen.getByText('Got')).toBeInTheDocument();
      expect(screen.getByText('questions?')).toBeInTheDocument();
    });

    it('should display the subheading', () => {
      render(<FAQ />);
      expect(
        screen.getByText(/Find answers to the most common questions about Rate My Accom/i)
      ).toBeInTheDocument();
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
      // Questions appear both in the main card and in quick links, use getAllByText
      expect(screen.getAllByText('How do I leave a review?').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Are all reviews verified?').length).toBeGreaterThan(0);
      expect(screen.getAllByText('How do I search for accommodation?').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Is the service free to use?').length).toBeGreaterThan(0);
      expect(screen.getAllByText('How are ratings calculated?').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Can I edit or delete my review?').length).toBeGreaterThan(0);
    });

    it('should have 6 question selector buttons plus navigation buttons', () => {
      render(<FAQ />);
      const buttons = screen.getAllByRole('button');
      // 6 numbered selectors + 6 quick link buttons + 2 navigation buttons (Previous/Next)
      expect(buttons.length).toBeGreaterThanOrEqual(14);
    });
  });

  describe('Card Navigation', () => {
    it('should navigate to next question when Next button clicked', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      // First question should be visible initially
      expect(
        screen.getByRole('heading', { level: 3, name: 'How do I leave a review?' })
      ).toBeInTheDocument();

      // Click Next
      const nextButton = screen.getByText('Next question');
      await user.click(nextButton);

      // Second question should now be visible
      expect(
        screen.getByRole('heading', { level: 3, name: 'Are all reviews verified?' })
      ).toBeInTheDocument();
    });

    it('should navigate to previous question when Previous button clicked', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      // Click Previous from first question (should wrap to last)
      const prevButton = screen.getByText('Previous');
      await user.click(prevButton);

      // Last question should now be visible
      expect(
        screen.getByRole('heading', { level: 3, name: 'Can I edit or delete my review?' })
      ).toBeInTheDocument();
    });

    it('should navigate when numbered button clicked', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      // Click on button "3"
      const thirdButton = screen.getByRole('button', { name: '3' });
      await user.click(thirdButton);

      // Third question should be visible
      expect(
        screen.getByRole('heading', { level: 3, name: 'How do I search for accommodation?' })
      ).toBeInTheDocument();
    });
  });

  describe('FAQ Content', () => {
    it('should display the active question answer', () => {
      render(<FAQ />);

      // First answer should be visible by default
      expect(
        screen.getByText(/Create an account using your university email address/i)
      ).toBeInTheDocument();
    });

    it('should show answer about verification when that FAQ is selected', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      // Navigate to verification FAQ
      const secondButton = screen.getByRole('button', { name: '2' });
      await user.click(secondButton);

      expect(
        screen.getByText(
          /All reviewers must verify their identity using a valid university email address/i
        )
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
    it('should have dark background on section', () => {
      render(<FAQ />);
      const section = document.querySelector('section');
      expect(section).toHaveClass('bg-[#0a0a0a]');
    });

    it('should have progress indicator', () => {
      render(<FAQ />);
      // Check for the progress bar numbers - there are multiple '01' elements (progress bar and card number)
      const progressNumbers = screen.getAllByText('01');
      expect(progressNumbers.length).toBeGreaterThan(0);
      expect(screen.getByText('06')).toBeInTheDocument();
    });
  });

  describe('Quick Links', () => {
    it('should display quick link buttons for all FAQs', () => {
      render(<FAQ />);
      // Check for Q1-Q6 labels
      expect(screen.getByText('Q1')).toBeInTheDocument();
      expect(screen.getByText('Q2')).toBeInTheDocument();
      expect(screen.getByText('Q3')).toBeInTheDocument();
      expect(screen.getByText('Q4')).toBeInTheDocument();
      expect(screen.getByText('Q5')).toBeInTheDocument();
      expect(screen.getByText('Q6')).toBeInTheDocument();
    });
  });
});
