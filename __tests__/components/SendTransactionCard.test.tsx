import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SendTransactionCard } from '@/components/SendTransactionCard';

describe('SendTransactionCard', () => {
  const mockOnSend = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when not connected', () => {
    const { container } = render(
      <SendTransactionCard
        isConnected={false}
        isLoading={false}
        onSend={mockOnSend}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders form when connected', () => {
    render(
      <SendTransactionCard
        isConnected={true}
        isLoading={false}
        onSend={mockOnSend}
      />
    );

    expect(screen.getByText('Send ETH')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/recipient address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/amount/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send transaction/i })).toBeInTheDocument();
  });

  it('updates input values on change', () => {
    render(
      <SendTransactionCard
        isConnected={true}
        isLoading={false}
        onSend={mockOnSend}
      />
    );

    const addressInput = screen.getByPlaceholderText(/recipient address/i);
    const amountInput = screen.getByPlaceholderText(/amount/i);

    fireEvent.change(addressInput, { target: { value: '0x1234567890' } });
    fireEvent.change(amountInput, { target: { value: '1.5' } });

    expect(addressInput).toHaveValue('0x1234567890');
    expect(amountInput).toHaveValue(1.5);
  });

  it('calls onSend with correct values and clears inputs', async () => {
    render(
      <SendTransactionCard
        isConnected={true}
        isLoading={false}
        onSend={mockOnSend}
      />
    );

    const addressInput = screen.getByPlaceholderText(/recipient address/i);
    const amountInput = screen.getByPlaceholderText(/amount/i);
    const submitButton = screen.getByRole('button', { name: /send transaction/i });

    fireEvent.change(addressInput, { target: { value: '0x1234567890123456789012345678901234567890' } });
    fireEvent.change(amountInput, { target: { value: '1.5' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSend).toHaveBeenCalledWith('0x1234567890123456789012345678901234567890', '1.5');
    });

    // Inputs should be cleared after successful send
    await waitFor(() => {
      expect(addressInput).toHaveValue('');
      expect(amountInput).toHaveValue(null);
    });
  });

  it('does not submit when inputs are empty', () => {
    render(
      <SendTransactionCard
        isConnected={true}
        isLoading={false}
        onSend={mockOnSend}
      />
    );

    const submitButton = screen.getByRole('button', { name: /send transaction/i });
    
    // Button should be disabled when inputs are empty
    expect(submitButton).toBeDisabled();
  });

  it('shows loading state', () => {
    render(
      <SendTransactionCard
        isConnected={true}
        isLoading={true}
        onSend={mockOnSend}
      />
    );

    const submitButton = screen.getByRole('button', { name: /sending/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/sending/i);
  });

  it('disables submit when loading', () => {
    render(
      <SendTransactionCard
        isConnected={true}
        isLoading={true}
        onSend={mockOnSend}
      />
    );

    const addressInput = screen.getByPlaceholderText(/recipient address/i);
    const amountInput = screen.getByPlaceholderText(/amount/i);

    fireEvent.change(addressInput, { target: { value: '0x1234567890' } });
    fireEvent.change(amountInput, { target: { value: '1.0' } });

    const submitButton = screen.getByRole('button');
    expect(submitButton).toBeDisabled();
  });
});
