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
    render(<SplitBillForm payerPublicKey="G_TEST_PAYER" hostPublicKey="" />);
    expect(screen.getByText('Submit Split')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Host Public Key (G...)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Total amount in XLM')).toBeInTheDocument();
  });

  it('handles submission and success flow', async () => {
    (stellarUtils.splitBillTransaction as jest.Mock).mockResolvedValue('hash_123');

    render(<SplitBillForm payerPublicKey="G_TEST_PAYER" hostPublicKey="" />);
    
    fireEvent.change(screen.getByPlaceholderText('Host Public Key (G...)'), { target: { value: 'G_TEST_HOST' } });
    fireEvent.change(screen.getByPlaceholderText('Total amount in XLM'), { target: { value: '10' } });
    
    fireEvent.click(screen.getByText('Submit Split'));

    expect(screen.getByText('Processing Transaction...')).toBeInTheDocument();

    await waitFor(() => {
      expect(stellarUtils.splitBillTransaction).toHaveBeenCalledWith('G_TEST_PAYER', 'G_TEST_HOST', 10);
      expect(screen.getByText('Transaction Successful!')).toBeInTheDocument();
    });
  });

  it('handles error gracefully', async () => {
    (stellarUtils.splitBillTransaction as jest.Mock).mockRejectedValue(new Error('Failed to submit'));

    render(<SplitBillForm payerPublicKey="G_TEST_PAYER" hostPublicKey="" />);
    
    fireEvent.change(screen.getByPlaceholderText('Host Public Key (G...)'), { target: { value: 'G_TEST_HOST' } });
    fireEvent.change(screen.getByPlaceholderText('Total amount in XLM'), { target: { value: '10' } });
    
    fireEvent.click(screen.getByText('Submit Split'));

    await waitFor(() => {
      expect(screen.getByText('Failed to submit')).toBeInTheDocument();
    });
  });
});
