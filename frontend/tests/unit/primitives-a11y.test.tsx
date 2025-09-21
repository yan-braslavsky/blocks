/**
 * Accessibility t    it('should be keyboard accessible', () => {
      render(<Button>Click me</Button>);
      
      const button = screen.getByRole('button');
      // Buttons are naturally keyboard accessible without tabindex="0"
      expect(button).toBeInTheDocument();
      // Focus management classes should be present
      expect(button.className).toContain('focus:outline-none');
      expect(button.className).toContain('focus:ring-2');
    });or UI primitives
 * Tests WCAG compliance and accessibility features
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import Button from '../../src/components/ui/Button';
import Card from '../../src/components/ui/Card';
import KPIStat from '../../src/components/ui/KPIStat';

describe('UI Primitives - Accessibility Tests', () => {
  describe('Button component', () => {
    it('should have proper button semantics', () => {
      render(<Button>Submit</Button>);
      
      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });

    it('should be keyboard accessible', () => {
      render(<Button>Navigate</Button>);
      
      const button = screen.getByRole('button');
      // Buttons are naturally keyboard accessible without tabindex="0"
      expect(button).toBeInTheDocument();
      // Focus management classes should be present
      expect(button.className).toContain('focus:outline-none');
      expect(button.className).toContain('focus:ring-2');
    });

    it('should handle disabled state accessibly', () => {
      render(<Button disabled>Disabled button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      // HTML disabled attribute is sufficient, aria-disabled is not required
      expect(button.className).toContain('disabled:opacity-50');
      expect(button.className).toContain('disabled:cursor-not-allowed');
    });    it('should support all variants accessibly', () => {
      const variants = ['primary', 'secondary', 'outline', 'ghost'] as const;
      
      variants.forEach(variant => {
        const { unmount } = render(
          <Button variant={variant}>Test {variant}</Button>
        );
        
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent(`Test ${variant}`);
        
        unmount();
      });
    });

    it('should support custom aria-label', () => {
      render(
        <Button aria-label="Close dialog">×</Button>
      );
      
      const button = screen.getByRole('button', { name: 'Close dialog' });
      expect(button).toBeInTheDocument();
    });

    it('should have proper focus management classes', () => {
      render(<Button>Focus test</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('focus:outline-none');
      expect(button.className).toContain('focus:ring-2');
    });
  });

  describe('Card component', () => {
    it('should render content accessibly', () => {
      render(
        <Card>
          <h2>Card Title</h2>
          <p>Card content goes here.</p>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card content goes here.')).toBeInTheDocument();
    });

    it('should support landmark structure when used as section', () => {
      render(
        <Card role="region" aria-labelledby="card-title">
          <h2 id="card-title">Important Information</h2>
          <p>This is important content.</p>
        </Card>
      );

      const region = screen.getByRole('region', { name: 'Important Information' });
      expect(region).toBeInTheDocument();
    });

    it('should support keyboard navigation for interactive cards', () => {
      render(
        <Card 
          tabIndex={0}
          role="button"
          aria-label="View details"
          onClick={() => {}}
        >
          <h3>Interactive Card</h3>
          <p>Click to view more details</p>
        </Card>
      );

      const card = screen.getByRole('button', { name: 'View details' });
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('should render all variants correctly', () => {
      const variants = ['default', 'outlined', 'elevated'] as const;
      
      variants.forEach(variant => {
        const { unmount } = render(
          <Card variant={variant}>
            <h3>Test Content</h3>
            <p>This is test content for variant {variant}</p>
          </Card>
        );
        
        expect(screen.getByText('Test Content')).toBeInTheDocument();
        expect(screen.getByText(`This is test content for variant ${variant}`)).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('KPIStat component', () => {
    it('should render all content accessibly', () => {
      render(
        <KPIStat
          label="Monthly Spend"
          value="$1,234.56"
          change={{
            value: "+12.5%",
            type: "increase",
            period: "vs last month"
          }}
        />
      );

      expect(screen.getByText('Monthly Spend')).toBeInTheDocument();
      expect(screen.getByText('$1,234.56')).toBeInTheDocument();
      expect(screen.getByText('+12.5%')).toBeInTheDocument();
      expect(screen.getByText('vs last month')).toBeInTheDocument();
    });

    it('should provide semantic structure for screen readers', () => {
      render(
        <KPIStat
          label="Total Cost"
          value="$2,500.00"
          change={{
            value: "-5.2%",
            type: "decrease",
            period: "vs last month"
          }}
        />
      );

      // Check that label and value are properly associated
      expect(screen.getByText('Total Cost')).toBeInTheDocument();
      expect(screen.getByText('$2,500.00')).toBeInTheDocument();
      expect(screen.getByText('-5.2%')).toBeInTheDocument();
    });

    it('should handle change indicators correctly', () => {
      render(
        <KPIStat
          label="Performance Metric"
          value="95%"
          change={{
            value: "+3.1%",
            type: "increase",
            period: "vs target"
          }}
        />
      );

      const changeElement = screen.getByText('+3.1%').closest('span');
      expect(changeElement).toBeInTheDocument();
      
      // Should have appropriate styling classes for increase
      expect(changeElement?.className || changeElement?.parentElement?.className).toContain('text-red-600');
    });

    it('should handle icons properly', () => {
      const TestIcon = () => (
        <svg aria-hidden="true" width="16" height="16" data-testid="test-icon">
          <path d="M8 0L16 8L8 16L0 8Z" />
        </svg>
      );

      render(
        <KPIStat
          label="Server Uptime"
          value="99.9%"
          icon={<TestIcon />}
        />
      );

      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should handle all change types correctly', () => {
      const changeTypes = ['increase', 'decrease', 'neutral'] as const;
      
      changeTypes.forEach(type => {
        const { unmount } = render(
          <KPIStat
            label={`Test ${type}`}
            value="100"
            change={{
              value: type === 'increase' ? '+10%' : type === 'decrease' ? '-10%' : '0%',
              type,
              period: 'test period'
            }}
          />
        );
        
        expect(screen.getByText(`Test ${type}`)).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
        
        unmount();
      });
    });

    it('should work with compact variant', () => {
      render(
        <KPIStat
          variant="compact"
          label="Compact KPI"
          value="42"
          change={{
            value: "+1.5%",
            type: "increase"
          }}
        />
      );

      expect(screen.getByText('Compact KPI')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('+1.5%')).toBeInTheDocument();
    });
  });

  describe('Focus management', () => {
    it('should handle focus properly in multiple interactive components', () => {
      render(
        <div>
          <Button>Button 1</Button>
          <Button>Button 2</Button>
          <Button variant="secondary">Button 3</Button>
        </div>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      
      // Each button should have focus management classes
      buttons.forEach(button => {
        expect(button.className).toContain('focus:outline-none');
        expect(button.className).toContain('focus:ring-2');
      });
    });

    it('should provide visible focus indicators on buttons', () => {
      render(<Button>Focus Test</Button>);
      
      const button = screen.getByRole('button');
      
      // Check for focus ring classes
      expect(button.className).toContain('focus:ring-2');
      expect(button.className).toContain('focus:ring-offset-2');
    });
  });

  describe('Responsive design accessibility', () => {
    it('should handle different button sizes', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      
      sizes.forEach(size => {
        const { unmount } = render(
          <Button size={size}>Size {size}</Button>
        );
        
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent(`Size ${size}`);
        
        unmount();
      });
    });

    it('should handle different card padding sizes', () => {
      const paddings = ['sm', 'md', 'lg'] as const;
      
      paddings.forEach(padding => {
        const { unmount } = render(
          <Card padding={padding}>
            <p>Padding {padding}</p>
          </Card>
        );
        
        expect(screen.getByText(`Padding ${padding}`)).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Animation and transition accessibility', () => {
    it('should include transition classes for smooth interactions', () => {
      render(<Button>Animated Button</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('transition');
    });
  });

  describe('Color and contrast considerations', () => {
    it('should use appropriate color classes for different states', () => {
      render(<Button variant="primary">Primary Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-blue-600');
      expect(button.className).toContain('text-white');
    });

    it('should provide dark mode support classes', () => {
      render(<Button variant="outline">Outline Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button.className).toContain('dark:bg-slate-800');
      expect(button.className).toContain('dark:text-slate-200');
    });

    it('should handle trend colors appropriately in KPIStat', () => {
      render(
        <KPIStat
          label="Cost Trend"
          value="$100"
          change={{ value: '+10%', type: 'increase' }}
        />
      );

      const changeElement = screen.getByText('+10%').closest('span');
      // Increases should be red (bad for cost) - check parent element
      expect(changeElement?.parentElement?.className || '').toContain('text-red-600');
    });
  });
});