/**
 * Integration test for assistant stub
 * Tests that assistant responses contain [REF: tokens
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

// Mock assistant widget component for testing
const MockAssistantWidget = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Array<{ role: string; content: string; references?: string[] }>>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [prompt, setPrompt] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          references: data.references
        }]);
        setPrompt('');
      }
    } catch (error) {
      console.error('Assistant query failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div data-testid="assistant-widget">
      <button 
        data-testid="assistant-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Close Assistant' : 'Open Assistant'}
      </button>
      
      {isOpen && (
        <div data-testid="assistant-panel">
          <div data-testid="assistant-messages">
            {messages.map((message, index) => (
              <div key={index} data-testid={`message-${index}`}>
                <div className="content" data-testid={`message-content-${index}`}>
                  {message.content}
                </div>
                {message.references && message.references.length > 0 && (
                  <div className="references" data-testid={`message-references-${index}`}>
                    {message.references.map((ref, refIndex) => (
                      <span key={refIndex} data-testid={`reference-${index}-${refIndex}`}>
                        {ref}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <form onSubmit={handleSubmit} data-testid="assistant-form">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask about your cloud spending..."
              data-testid="assistant-input"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              data-testid="assistant-submit"
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

describe('Assistant Reference Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default response with reference tokens
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        interactionId: '123e4567-e89b-12d3-a456-426614174000',
        response: 'Top savings from EC2 commitment coverage improvements. [REF:agg:2025-09-19T10] [REF:rec:uuid-rec-1]',
        references: ['agg:2025-09-19T10', 'rec:uuid-rec-1'],
        firstTokenLatencyMs: 120
      }),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Assistant Widget Rendering', () => {
    it('should render assistant widget with trigger button', () => {
      render(<MockAssistantWidget />);

      expect(screen.getByTestId('assistant-widget')).toBeInTheDocument();
      expect(screen.getByTestId('assistant-trigger')).toBeInTheDocument();
      expect(screen.getByText('Open Assistant')).toBeInTheDocument();
    });

    it('should show assistant panel when trigger is clicked', async () => {
      render(<MockAssistantWidget />);

      const trigger = screen.getByTestId('assistant-trigger');
      fireEvent.click(trigger);

      expect(screen.getByTestId('assistant-panel')).toBeInTheDocument();
      expect(screen.getByTestId('assistant-form')).toBeInTheDocument();
      expect(screen.getByTestId('assistant-input')).toBeInTheDocument();
      expect(screen.getByTestId('assistant-submit')).toBeInTheDocument();
    });

    it('should have proper input placeholder and form elements', async () => {
      render(<MockAssistantWidget />);

      const trigger = screen.getByTestId('assistant-trigger');
      fireEvent.click(trigger);

      const input = screen.getByTestId('assistant-input');
      expect(input).toHaveAttribute('placeholder', 'Ask about your cloud spending...');
      expect(input).toHaveAttribute('type', 'text');
      
      const submitButton = screen.getByTestId('assistant-submit');
      expect(submitButton).toHaveTextContent('Send');
    });
  });

  describe('Assistant Query and Response', () => {
    it('should submit query and receive response with references', async () => {
      render(<MockAssistantWidget />);

      // Open the assistant panel
      const trigger = screen.getByTestId('assistant-trigger');
      fireEvent.click(trigger);

      const input = screen.getByTestId('assistant-input');
      const submitButton = screen.getByTestId('assistant-submit');

      // Fill in and submit the query
      fireEvent.change(input, { target: { value: 'Where are we saving money this month?' } });
      fireEvent.click(submitButton);

      // Verify API was called
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/assistant/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Where are we saving money this month?' }),
        });
      });

      // Verify response is displayed
      await waitFor(() => {
        expect(screen.getByTestId('message-0')).toBeInTheDocument();
      });
    });

    it('should display response content with [REF: tokens', async () => {
      render(<MockAssistantWidget />);

      // Open panel and submit query
      fireEvent.click(screen.getByTestId('assistant-trigger'));
      
      const input = screen.getByTestId('assistant-input');
      fireEvent.change(input, { target: { value: 'Show me cost optimization opportunities' } });
      fireEvent.click(screen.getByTestId('assistant-submit'));

      // Wait for response
      await waitFor(() => {
        expect(screen.getByTestId('message-content-0')).toBeInTheDocument();
      });

      const messageContent = screen.getByTestId('message-content-0');
      
      // Verify content contains [REF: tokens
      expect(messageContent).toHaveTextContent('[REF:agg:2025-09-19T10]');
      expect(messageContent).toHaveTextContent('[REF:rec:uuid-rec-1]');
      expect(messageContent).toHaveTextContent('Top savings from EC2 commitment coverage improvements');
    });

    it('should display references separately when provided', async () => {
      render(<MockAssistantWidget />);

      // Open panel and submit query
      fireEvent.click(screen.getByTestId('assistant-trigger'));
      
      const input = screen.getByTestId('assistant-input');
      fireEvent.change(input, { target: { value: 'Analyze spending patterns' } });
      fireEvent.click(screen.getByTestId('assistant-submit'));

      // Wait for response
      await waitFor(() => {
        expect(screen.getByTestId('message-references-0')).toBeInTheDocument();
      });

      // Verify individual references are displayed
      expect(screen.getByTestId('reference-0-0')).toHaveTextContent('agg:2025-09-19T10');
      expect(screen.getByTestId('reference-0-1')).toHaveTextContent('rec:uuid-rec-1');
    });

    it('should handle responses without references gracefully', async () => {
      // Mock response without references
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          interactionId: '123e4567-e89b-12d3-a456-426614174000',
          response: 'I can help you analyze your cloud spending patterns.',
          references: [],
          firstTokenLatencyMs: 95
        }),
      });

      render(<MockAssistantWidget />);

      // Open panel and submit query
      fireEvent.click(screen.getByTestId('assistant-trigger'));
      
      const input = screen.getByTestId('assistant-input');
      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.click(screen.getByTestId('assistant-submit'));

      // Wait for response
      await waitFor(() => {
        expect(screen.getByTestId('message-content-0')).toBeInTheDocument();
      });

      const messageContent = screen.getByTestId('message-content-0');
      expect(messageContent).toHaveTextContent('I can help you analyze your cloud spending patterns.');
      
      // References section should not be rendered for empty references
      expect(screen.queryByTestId('message-references-0')).not.toBeInTheDocument();
    });

    it('should show loading state during API request', async () => {
      // Mock slow response
      mockFetch.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            status: 200,
            json: async () => ({
              interactionId: '123e4567-e89b-12d3-a456-426614174000',
              response: 'Delayed response with [REF:agg:2025-09-19T15]',
              references: ['agg:2025-09-19T15'],
              firstTokenLatencyMs: 500
            }),
          }), 100)
        )
      );

      render(<MockAssistantWidget />);

      // Open panel and submit query
      fireEvent.click(screen.getByTestId('assistant-trigger'));
      
      const input = screen.getByTestId('assistant-input');
      const submitButton = screen.getByTestId('assistant-submit');
      
      fireEvent.change(input, { target: { value: 'Test query' } });
      fireEvent.click(submitButton);

      // Should show loading state
      expect(submitButton).toHaveTextContent('Sending...');
      expect(submitButton).toBeDisabled();
      expect(input).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(submitButton).toHaveTextContent('Send');
      });
    });

    it('should handle API errors gracefully', async () => {
      // Mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            code: 'MISSING_PROMPT',
            message: 'Prompt is required',
          }
        }),
      });

      render(<MockAssistantWidget />);

      // Open panel and submit query
      fireEvent.click(screen.getByTestId('assistant-trigger'));
      
      const input = screen.getByTestId('assistant-input');
      fireEvent.change(input, { target: { value: 'Test error' } });
      fireEvent.click(screen.getByTestId('assistant-submit'));

      // Verify API was called but no message was added
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // No message should be displayed on error
      expect(screen.queryByTestId('message-0')).not.toBeInTheDocument();
    });
  });

  describe('Reference Token Validation', () => {
    it('should validate that responses contain at least one [REF: token when references exist', async () => {
      const testCases = [
        {
          response: 'Savings from EC2 optimization [REF:agg:2025-09-19T10]',
          references: ['agg:2025-09-19T10'],
          shouldContainRef: true
        },
        {
          response: 'Multiple references [REF:agg:2025-09-19T10] and [REF:rec:uuid-1]',
          references: ['agg:2025-09-19T10', 'rec:uuid-1'],
          shouldContainRef: true
        },
        {
          response: 'No reference tokens in response text',
          references: ['agg:2025-09-19T10'],
          shouldContainRef: false
        }
      ];

      for (const testCase of testCases) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            interactionId: '123e4567-e89b-12d3-a456-426614174000',
            response: testCase.response,
            references: testCase.references,
            firstTokenLatencyMs: 120
          }),
        });

        render(<MockAssistantWidget />);

        // Open panel and submit query
        fireEvent.click(screen.getByTestId('assistant-trigger'));
        
        const input = screen.getByTestId('assistant-input');
        fireEvent.change(input, { target: { value: 'Test query' } });
        fireEvent.click(screen.getByTestId('assistant-submit'));

        // Wait for response
        await waitFor(() => {
          expect(screen.getByTestId('message-content-0')).toBeInTheDocument();
        });

        const messageContent = screen.getByTestId('message-content-0');
        
        if (testCase.shouldContainRef) {
          expect(messageContent.textContent).toMatch(/\[REF:/);
        } else {
          expect(messageContent.textContent).not.toMatch(/\[REF:/);
        }

        // Clean up for next iteration
        vi.clearAllMocks();
      }
    });

    it('should validate reference format matches expected patterns', async () => {
      const validReferences = [
        'agg:2025-09-19T10',
        'rec:uuid-rec-1',
        'agg:2025-09-15T14',
        'rec:123e4567-e89b-12d3-a456-426614174000'
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          interactionId: '123e4567-e89b-12d3-a456-426614174000',
          response: 'Response with valid refs [REF:agg:2025-09-19T10] [REF:rec:uuid-rec-1]',
          references: validReferences,
          firstTokenLatencyMs: 120
        }),
      });

      render(<MockAssistantWidget />);

      // Open panel and submit query
      fireEvent.click(screen.getByTestId('assistant-trigger'));
      
      const input = screen.getByTestId('assistant-input');
      fireEvent.change(input, { target: { value: 'Show valid references' } });
      fireEvent.click(screen.getByTestId('assistant-submit'));

      // Wait for response
      await waitFor(() => {
        expect(screen.getByTestId('message-references-0')).toBeInTheDocument();
      });

      // Verify all references are displayed and match expected patterns
      validReferences.forEach((ref, index) => {
        const refElement = screen.getByTestId(`reference-0-${index}`);
        expect(refElement).toHaveTextContent(ref);
        
        // Validate reference format (agg: or rec: prefix)
        expect(ref).toMatch(/^(agg|rec):/);
      });
    });

    it('should ensure response text contains [REF: tokens for all provided references', async () => {
      const references = ['agg:2025-09-19T10', 'rec:uuid-rec-1', 'agg:2025-09-19T11'];
      const responseWithAllRefs = `Analysis shows savings opportunities. [REF:${references[0]}] indicates EC2 optimization. [REF:${references[1]}] suggests commitment discounts. [REF:${references[2]}] shows usage patterns.`;

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          interactionId: '123e4567-e89b-12d3-a456-426614174000',
          response: responseWithAllRefs,
          references: references,
          firstTokenLatencyMs: 150
        }),
      });

      render(<MockAssistantWidget />);

      // Open panel and submit query
      fireEvent.click(screen.getByTestId('assistant-trigger'));
      
      const input = screen.getByTestId('assistant-input');
      fireEvent.change(input, { target: { value: 'Comprehensive analysis' } });
      fireEvent.click(screen.getByTestId('assistant-submit'));

      // Wait for response
      await waitFor(() => {
        expect(screen.getByTestId('message-content-0')).toBeInTheDocument();
      });

      const messageContent = screen.getByTestId('message-content-0');
      
      // Verify each reference appears in the response text
      references.forEach(ref => {
        expect(messageContent.textContent).toContain(`[REF:${ref}]`);
      });
    });
  });

  describe('Form Interaction', () => {
    it('should clear input after successful submission', async () => {
      render(<MockAssistantWidget />);

      // Open panel
      fireEvent.click(screen.getByTestId('assistant-trigger'));
      
      const input = screen.getByTestId('assistant-input');
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(screen.getByTestId('assistant-submit'));

      // Wait for response and input to clear
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('should disable submit button when input is empty', () => {
      render(<MockAssistantWidget />);

      // Open panel
      fireEvent.click(screen.getByTestId('assistant-trigger'));
      
      const submitButton = screen.getByTestId('assistant-submit');
      expect(submitButton).toBeDisabled();

      const input = screen.getByTestId('assistant-input');
      fireEvent.change(input, { target: { value: 'Non-empty input' } });
      expect(submitButton).not.toBeDisabled();

      fireEvent.change(input, { target: { value: '' } });
      expect(submitButton).toBeDisabled();
    });

    it('should support keyboard form submission', async () => {
      render(<MockAssistantWidget />);

      // Open panel
      fireEvent.click(screen.getByTestId('assistant-trigger'));
      
      const input = screen.getByTestId('assistant-input');
      fireEvent.change(input, { target: { value: 'Keyboard submission test' } });
      
      // Submit with Enter key
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      // Verify API was called
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/assistant/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Keyboard submission test' }),
        });
      });
    });
  });
});