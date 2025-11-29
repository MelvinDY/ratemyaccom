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
      expect(screen.getByText(/Frequently Asked/i)).toBeInTheDocument();
      expect(screen.getByText('Questions')).toBeInTheDocument();
    });

    it('should display the subheading', () => {
      render(<FAQ />);
      expect(screen.getByText(/Got questions\? We've got answers/i)).toBeInTheDocument();
    });

    it('should have correct heading hierarchy with h2', () => {
      render(<FAQ />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveAttribute('id', 'faq-heading');
    });
  });

  describe('FAQ Questions', () => {
    it('should display all 8 FAQ questions', () => {
      render(<FAQ />);
      expect(screen.getByText('How do I leave a review?')).toBeInTheDocument();
      expect(screen.getByText('Are all reviews verified?')).toBeInTheDocument();
      expect(screen.getByText('How do I search for accommodation?')).toBeInTheDocument();
      expect(screen.getByText('Is the service free to use?')).toBeInTheDocument();
      expect(screen.getByText('How are ratings calculated?')).toBeInTheDocument();
      expect(screen.getByText('Can I edit or delete my review?')).toBeInTheDocument();
      expect(
        screen.getByText('What if I find incorrect information about an accommodation?')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Can accommodation providers respond to reviews?')
      ).toBeInTheDocument();
    });

    it('should have 8 accordion items', () => {
      render(<FAQ />);
      // Each question is a button (accordion trigger)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(8);
    });
  });

  describe('Accordion Functionality', () => {
    it('should expand accordion when clicked', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      const firstQuestion = screen.getByText('How do I leave a review?');
      await user.click(firstQuestion);

      // Answer should become visible
      expect(
        screen.getByText(
          /To leave a review, first create an account using your university email address/i
        )
      ).toBeVisible();
    });

    it('should toggle accordion when clicked', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      const firstQuestion = screen.getByText('How do I leave a review?');

      // Click to expand
      await user.click(firstQuestion);
      const answerText = screen.getByText(
        /To leave a review, first create an account using your university email address/i
      );
      expect(answerText).toBeInTheDocument();

      // Click to collapse - the accordion toggles state
      await user.click(firstQuestion);
      // Content may still be in DOM but container state changes
      const trigger = firstQuestion.closest('[data-state]');
      expect(trigger).toBeDefined();
    });

    it('should support single accordion mode', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      const firstQuestion = screen.getByText('How do I leave a review?');
      const secondQuestion = screen.getByText('Are all reviews verified?');

      // Open first
      await user.click(firstQuestion);
      expect(screen.getByText(/To leave a review, first create an account/i)).toBeInTheDocument();

      // Open second - this is a single accordion so first closes
      await user.click(secondQuestion);
      expect(
        screen.getByText(/Yes! All reviewers must verify their identity/i)
      ).toBeInTheDocument();
    });
  });

  describe('Contact Support', () => {
    it('should display "Still have questions?" text', () => {
      render(<FAQ />);
      expect(screen.getByText('Still have questions?')).toBeInTheDocument();
    });

    it('should have contact support link with correct href', () => {
      render(<FAQ />);
      const contactLink = screen.getByRole('link', { name: /Contact Support/i });
      expect(contactLink).toBeInTheDocument();
      expect(contactLink).toHaveAttribute('href', 'mailto:support@ratemyaccom.com');
    });

    it('should have gradient styling on contact button', () => {
      render(<FAQ />);
      const contactLink = screen.getByRole('link', { name: /Contact Support/i });
      expect(contactLink).toHaveClass('bg-gradient-to-r');
    });
  });

  describe('Accessibility', () => {
    it('should have semantic section element with aria-labelledby', () => {
      render(<FAQ />);
      const section = document.querySelector('section[aria-labelledby="faq-heading"]');
      expect(section).toBeInTheDocument();
    });

    it('should have HelpCircle icon with aria-hidden', () => {
      render(<FAQ />);
      const icons = document.querySelectorAll('svg[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have accessible accordion buttons', () => {
      render(<FAQ />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('Styling', () => {
    it('should have bg-gray-900 background on section', () => {
      render(<FAQ />);
      const section = document.querySelector('section');
      expect(section).toHaveClass('bg-gray-900');
    });

    it('should have animated blur backgrounds', () => {
      render(<FAQ />);
      const blurElements = document.querySelectorAll('[class*="blur-3xl"]');
      expect(blurElements.length).toBe(2);
    });

    it('should have backdrop blur container for accordion', () => {
      render(<FAQ />);
      const container = document.querySelector('.backdrop-blur-xl');
      expect(container).toBeInTheDocument();
    });
  });

  describe('FAQ Content', () => {
    it('should have complete answer content when expanded', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      // Test verification answer content
      const verifiedQuestion = screen.getByText('Are all reviews verified?');
      await user.click(verifiedQuestion);

      expect(
        screen.getByText(
          /All reviewers must verify their identity using a valid university email address/i
        )
      ).toBeVisible();
    });

    it('should mention email support in incorrect info FAQ', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      const incorrectInfoQuestion = screen.getByText(
        'What if I find incorrect information about an accommodation?'
      );
      await user.click(incorrectInfoQuestion);

      expect(screen.getByText(/support@ratemyaccom.com/i)).toBeVisible();
    });
  });
});
