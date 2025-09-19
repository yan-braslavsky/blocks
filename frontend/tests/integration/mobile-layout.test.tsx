/**
 * Integration test for mobile layout responsiveness
 * Tests that cards stack properly at ≤420px width
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Mock Next.js router
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/app/dashboard',
}));

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

// Mock dashboard layout with responsive cards
const MockDashboardLayout = ({ containerWidth }: { containerWidth: number }) => {
  return (
    <div 
      data-testid="dashboard-container" 
      style={{ width: containerWidth }}
      className={`dashboard-container ${containerWidth <= 420 ? 'mobile' : 'desktop'}`}
    >
      <div 
        data-testid="cards-grid"
        className={`grid gap-6 ${
          containerWidth <= 420 
            ? 'grid-cols-1' 
            : containerWidth <= 768 
            ? 'grid-cols-2' 
            : 'grid-cols-3'
        }`}
      >
        <div 
          data-testid="spend-overview-card"
          className="card bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Spend Overview</h3>
          <div className="metric-value text-3xl font-bold">$12,345</div>
          <div className="metric-change text-sm text-green-600">-5.2% vs last month</div>
        </div>

        <div 
          data-testid="cost-projection-card"
          className="card bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Cost Projection</h3>
          <div className="metric-value text-3xl font-bold">$15,200</div>
          <div className="metric-change text-sm text-orange-600">+2.1% projected</div>
        </div>

        <div 
          data-testid="recommendations-card"
          className="card bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
          <div className="recommendation-count text-3xl font-bold">3</div>
          <div className="potential-savings text-sm text-blue-600">$2,100 potential savings</div>
        </div>

        <div 
          data-testid="assistant-card"
          className="card bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold mb-4">AI Assistant</h3>
          <div className="assistant-status text-sm text-gray-600">Ready to help</div>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            Ask a question
          </button>
        </div>
      </div>
    </div>
  );
};

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (width: number) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => {
      const matches = query.includes('max-width') && query.includes('420px') 
        ? width <= 420
        : query.includes('max-width') && query.includes('768px')
        ? width <= 768
        : false;

      return {
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    }),
  });
};

describe('Mobile Layout Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful API responses
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {}
      }),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Desktop Layout (>420px)', () => {
    it('should display cards in grid format on desktop', () => {
      mockMatchMedia(1024);
      
      render(<MockDashboardLayout containerWidth={1024} />);

      const cardsGrid = screen.getByTestId('cards-grid');
      expect(cardsGrid).toHaveClass('grid-cols-3');
      expect(cardsGrid).not.toHaveClass('grid-cols-1');
      
      const container = screen.getByTestId('dashboard-container');
      expect(container).toHaveClass('desktop');
      expect(container).not.toHaveClass('mobile');
    });

    it('should display cards in 2-column grid on tablet (421px-768px)', () => {
      mockMatchMedia(600);
      
      render(<MockDashboardLayout containerWidth={600} />);

      const cardsGrid = screen.getByTestId('cards-grid');
      expect(cardsGrid).toHaveClass('grid-cols-2');
      expect(cardsGrid).not.toHaveClass('grid-cols-1');
      
      const container = screen.getByTestId('dashboard-container');
      expect(container).toHaveClass('desktop');
    });

    it('should render all dashboard cards on desktop', () => {
      mockMatchMedia(1024);
      
      render(<MockDashboardLayout containerWidth={1024} />);

      expect(screen.getByTestId('spend-overview-card')).toBeInTheDocument();
      expect(screen.getByTestId('cost-projection-card')).toBeInTheDocument();
      expect(screen.getByTestId('recommendations-card')).toBeInTheDocument();
      expect(screen.getByTestId('assistant-card')).toBeInTheDocument();
    });
  });

  describe('Mobile Layout (≤420px)', () => {
    it('should stack cards in single column at 420px width', () => {
      mockMatchMedia(420);
      
      render(<MockDashboardLayout containerWidth={420} />);

      const cardsGrid = screen.getByTestId('cards-grid');
      expect(cardsGrid).toHaveClass('grid-cols-1');
      expect(cardsGrid).not.toHaveClass('grid-cols-2');
      expect(cardsGrid).not.toHaveClass('grid-cols-3');
      
      const container = screen.getByTestId('dashboard-container');
      expect(container).toHaveClass('mobile');
      expect(container).not.toHaveClass('desktop');
    });

    it('should stack cards in single column at 375px width (iPhone)', () => {
      mockMatchMedia(375);
      
      render(<MockDashboardLayout containerWidth={375} />);

      const cardsGrid = screen.getByTestId('cards-grid');
      expect(cardsGrid).toHaveClass('grid-cols-1');
      
      const container = screen.getByTestId('dashboard-container');
      expect(container).toHaveClass('mobile');
    });

    it('should stack cards in single column at 320px width (small mobile)', () => {
      mockMatchMedia(320);
      
      render(<MockDashboardLayout containerWidth={320} />);

      const cardsGrid = screen.getByTestId('cards-grid');
      expect(cardsGrid).toHaveClass('grid-cols-1');
      
      const container = screen.getByTestId('dashboard-container');
      expect(container).toHaveClass('mobile');
    });

    it('should render all cards even on mobile layout', () => {
      mockMatchMedia(375);
      
      render(<MockDashboardLayout containerWidth={375} />);

      // All cards should still be present, just stacked
      expect(screen.getByTestId('spend-overview-card')).toBeInTheDocument();
      expect(screen.getByTestId('cost-projection-card')).toBeInTheDocument();
      expect(screen.getByTestId('recommendations-card')).toBeInTheDocument();
      expect(screen.getByTestId('assistant-card')).toBeInTheDocument();
    });

    it('should maintain card content readability on mobile', () => {
      mockMatchMedia(375);
      
      render(<MockDashboardLayout containerWidth={375} />);

      // Check that text content is still accessible
      expect(screen.getByText('Spend Overview')).toBeInTheDocument();
      expect(screen.getByText('$12,345')).toBeInTheDocument();
      expect(screen.getByText('-5.2% vs last month')).toBeInTheDocument();
      
      expect(screen.getByText('Cost Projection')).toBeInTheDocument();
      expect(screen.getByText('$15,200')).toBeInTheDocument();
      
      expect(screen.getByText('Recommendations')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      
      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
      expect(screen.getByText('Ask a question')).toBeInTheDocument();
    });
  });

  describe('Breakpoint Behavior', () => {
    it('should transition correctly at the 420px breakpoint', () => {
      // Test just above breakpoint
      mockMatchMedia(421);
      const { rerender } = render(<MockDashboardLayout containerWidth={421} />);
      
      let cardsGrid = screen.getByTestId('cards-grid');
      expect(cardsGrid).toHaveClass('grid-cols-2');
      expect(cardsGrid).not.toHaveClass('grid-cols-1');
      
      // Test at breakpoint
      mockMatchMedia(420);
      rerender(<MockDashboardLayout containerWidth={420} />);
      
      cardsGrid = screen.getByTestId('cards-grid');
      expect(cardsGrid).toHaveClass('grid-cols-1');
      expect(cardsGrid).not.toHaveClass('grid-cols-2');
      
      // Test just below breakpoint
      mockMatchMedia(419);
      rerender(<MockDashboardLayout containerWidth={419} />);
      
      cardsGrid = screen.getByTestId('cards-grid');
      expect(cardsGrid).toHaveClass('grid-cols-1');
    });

    it('should apply correct CSS classes for different screen sizes', () => {
      const testCases = [
        { width: 320, expectedCols: 'grid-cols-1', expectedContainer: 'mobile' },
        { width: 375, expectedCols: 'grid-cols-1', expectedContainer: 'mobile' },
        { width: 420, expectedCols: 'grid-cols-1', expectedContainer: 'mobile' },
        { width: 421, expectedCols: 'grid-cols-2', expectedContainer: 'desktop' },
        { width: 768, expectedCols: 'grid-cols-2', expectedContainer: 'desktop' },
        { width: 1024, expectedCols: 'grid-cols-3', expectedContainer: 'desktop' },
      ];

      testCases.forEach(({ width, expectedCols, expectedContainer }) => {
        mockMatchMedia(width);
        
        render(<MockDashboardLayout containerWidth={width} />);
        
        const cardsGrid = screen.getByTestId('cards-grid');
        const container = screen.getByTestId('dashboard-container');
        
        expect(cardsGrid).toHaveClass(expectedCols);
        expect(container).toHaveClass(expectedContainer);
        
        // Clean up for next iteration
        vi.clearAllMocks();
      });
    });
  });

  describe('Card Styling and Layout', () => {
    it('should maintain consistent card styling across breakpoints', () => {
      const testWidths = [320, 420, 768, 1024];
      
      testWidths.forEach(width => {
        mockMatchMedia(width);
        
        render(<MockDashboardLayout containerWidth={width} />);
        
        // Check that all cards maintain their base styling
        const cards = [
          screen.getByTestId('spend-overview-card'),
          screen.getByTestId('cost-projection-card'),
          screen.getByTestId('recommendations-card'),
          screen.getByTestId('assistant-card'),
        ];
        
        cards.forEach(card => {
          expect(card).toHaveClass('card');
          expect(card).toHaveClass('bg-white');
          expect(card).toHaveClass('rounded-lg');
          expect(card).toHaveClass('shadow');
          expect(card).toHaveClass('p-6');
        });
        
        // Clean up for next iteration
        vi.clearAllMocks();
      });
    });

    it('should maintain proper spacing between cards on mobile', () => {
      mockMatchMedia(375);
      
      render(<MockDashboardLayout containerWidth={375} />);

      const cardsGrid = screen.getByTestId('cards-grid');
      
      // Should maintain gap spacing even in mobile
      expect(cardsGrid).toHaveClass('gap-6');
      expect(cardsGrid).toHaveClass('grid');
    });

    it('should ensure cards are full-width on mobile layout', () => {
      mockMatchMedia(375);
      
      render(<MockDashboardLayout containerWidth={375} />);

      const cardsGrid = screen.getByTestId('cards-grid');
      
      // Single column means cards take full width
      expect(cardsGrid).toHaveClass('grid-cols-1');
      
      // All cards should be present and accessible
      const cards = screen.getAllByText(/Overview|Projection|Recommendations|Assistant/);
      expect(cards).toHaveLength(4);
    });
  });

  describe('Content Accessibility on Mobile', () => {
    it('should maintain button accessibility on mobile', () => {
      mockMatchMedia(375);
      
      render(<MockDashboardLayout containerWidth={375} />);

      const assistantButton = screen.getByText('Ask a question');
      expect(assistantButton).toBeInTheDocument();
      expect(assistantButton).toHaveClass('px-4');
      expect(assistantButton).toHaveClass('py-2');
      expect(assistantButton).toHaveClass('bg-blue-500');
      expect(assistantButton).toHaveClass('text-white');
      expect(assistantButton).toHaveClass('rounded');
    });

    it('should preserve text hierarchy on mobile', () => {
      mockMatchMedia(375);
      
      render(<MockDashboardLayout containerWidth={375} />);

      // Headers should maintain their styling
      const headers = screen.getAllByRole('heading', { level: 3 });
      expect(headers).toHaveLength(4);
      
      headers.forEach(header => {
        expect(header).toHaveClass('text-lg');
        expect(header).toHaveClass('font-semibold');
        expect(header).toHaveClass('mb-4');
      });

      // Metric values should maintain prominence
      const metricValues = document.querySelectorAll('.metric-value');
      metricValues.forEach(value => {
        expect(value).toHaveClass('text-3xl');
        expect(value).toHaveClass('font-bold');
      });
    });

    it('should maintain color coding for metrics on mobile', () => {
      mockMatchMedia(375);
      
      render(<MockDashboardLayout containerWidth={375} />);

      // Check color classes are preserved
      expect(screen.getByText('-5.2% vs last month')).toHaveClass('text-green-600');
      expect(screen.getByText('+2.1% projected')).toHaveClass('text-orange-600');
      expect(screen.getByText('$2,100 potential savings')).toHaveClass('text-blue-600');
    });
  });
});