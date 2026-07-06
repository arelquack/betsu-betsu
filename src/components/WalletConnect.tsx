'use client';

import { useState } from 'react';
import { connectWallet, fetchBalance } from '@/utils/stellar';
import { Wallet, LogOut, Download, AlertCircle } from 'lucide-react';
import { FREIGHTER_ID, ALBEDO_ID } from '@creit.tech/stellar-wallets-kit';

interface WalletConnectProps {
  onConnect: (publicKey: string) => void;
  onDisconnect: () => void;
}

export default function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (walletId: string) => {
    setIsLoading(walletId);
    setError(null);
    try {
      const pubKey = await connectWallet(walletId);
      setPublicKey(pubKey);
      onConnect(pubKey);
      const bal = await fetchBalance(pubKey);
      setBalance(bal);
    } catch (err: any) {
      console.error('Failed to connect:', err);
      setError(err.message || "Failed to connect wallet.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleDisconnect = () => {
    setPublicKey(null);
    setBalance(null);
    setError(null);
    onDisconnect();
  };

  if (publicKey) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-start">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-inner">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 uppercase tracking-wider">Connected Wallet</p>
            <p className="font-mono text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
              {publicKey.slice(0, 6)}...{publicKey.slice(-6)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:border-l border-slate-100 dark:border-slate-700 sm:pl-6">
          <div className="text-left sm:text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 uppercase tracking-wider">Balance</p>
            <p className="font-bold text-lg text-slate-900 dark:text-slate-100">
              {balance ? `${parseFloat(balance).toFixed(2)} XLM` : 'Loading...'}
            </p>
          </div>
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-2 p-3 sm:px-4 sm:py-2 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 bg-slate-50 hover:bg-red-50 dark:bg-slate-700/50 dark:hover:bg-red-900/20 rounded-xl transition-all font-medium"
            title="Disconnect Wallet"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Disconnect</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full gap-4">
      {error && (
        <div className="flex items-center gap-2 p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
          <AlertCircle size={16} />
          <span className="font-medium">{error}</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
        <button
          onClick={() => handleConnect(FREIGHTER_ID)}
          disabled={isLoading !== null}
          className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Wallet className="transition-transform group-hover:scale-110" size={24} />
          {isLoading === FREIGHTER_ID ? 'Connecting...' : 'Connect Freighter'}
        </button>
        
        <button
          onClick={() => handleConnect(ALBEDO_ID)}
          disabled={isLoading !== null}
          className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-8 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold text-lg transition-all shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Wallet className="transition-transform group-hover:scale-110" size={24} />
          {isLoading === ALBEDO_ID ? 'Connecting...' : 'Connect Albedo'}
        </button>
      </div>
    </div>
  );
}
