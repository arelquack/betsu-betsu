import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WalletConnect from '../components/WalletConnect';
import * as stellarUtils from '../utils/stellar';

// Mock the stellar utils
jest.mock('../utils/stellar', () => ({
  connectWallet: jest.fn(),
  fetchBalance: jest.fn(),
}));

describe('WalletConnect Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders connect button initially', () => {
    render(<WalletConnect onConnect={() => {}} />);
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('handles connection success', async () => {
    const mockOnConnect = jest.fn();
    (stellarUtils.connectWallet as jest.Mock).mockResolvedValue('G_TEST_PUBLIC_KEY');
    (stellarUtils.fetchBalance as jest.Mock).mockResolvedValue('100.5');

    render(<WalletConnect onConnect={mockOnConnect} />);
    
    const connectButton = screen.getByText('Connect Wallet');
    fireEvent.click(connectButton);

    expect(screen.getByText('Connecting...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockOnConnect).toHaveBeenCalledWith('G_TEST_PUBLIC_KEY');
    });
  });

  it('handles connection error gracefully', async () => {
    (stellarUtils.connectWallet as jest.Mock).mockRejectedValue(new Error('Rejected by user'));

    render(<WalletConnect onConnect={() => {}} />);
    
    const connectButton = screen.getByText('Connect Wallet');
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(screen.getByText('Rejected by user')).toBeInTheDocument();
    });
  });
});
