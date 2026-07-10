import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SplitBillForm from '../components/SplitBillForm';
import * as stellarUtils from '../utils/stellar';

jest.mock('../utils/stellar', () => ({
  splitBillTransaction: jest.fn(),
}));

describe('SplitBillForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default state', () => {
    render(<SplitBillForm payerPublicKey="G_TEST_PAYER" />);
    expect(screen.getByText('Pay Share Now')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('G...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
  });

  it('handles submission and success flow', async () => {
    (stellarUtils.splitBillTransaction as jest.Mock).mockResolvedValue('hash_123');

    render(<SplitBillForm payerPublicKey="G_TEST_PAYER" />);
    
    fireEvent.change(screen.getByPlaceholderText('G...'), { target: { value: 'G_TEST_HOST' } });
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '10' } });
    
    fireEvent.click(screen.getByText('Pay Share Now'));

    // Wait for the button to show loading spinner or just wait for the transaction call
    await waitFor(() => {
      expect(stellarUtils.splitBillTransaction).toHaveBeenCalledWith('G_TEST_PAYER', 'G_TEST_HOST', 5); // 10 XLM / 2 people = 5 XLM
      expect(screen.getByText('Transaction Successful!')).toBeInTheDocument();
    });
  });

  it('handles error gracefully', async () => {
    (stellarUtils.splitBillTransaction as jest.Mock).mockRejectedValue(new Error('Failed to submit'));

    render(<SplitBillForm payerPublicKey="G_TEST_PAYER" />);
    
    fireEvent.change(screen.getByPlaceholderText('G...'), { target: { value: 'G_TEST_HOST' } });
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '10' } });
    
    fireEvent.click(screen.getByText('Pay Share Now'));

    await waitFor(() => {
      expect(screen.getByText('Failed to submit')).toBeInTheDocument();
    });
  });
});
