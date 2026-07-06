'use client';

import { useState, useEffect } from 'react';
import { connectWallet, fetchBalance, checkFreighterInstalled } from '@/utils/stellar';
import { Wallet, LogOut, Download } from 'lucide-react';

interface WalletConnectProps {
  onConnect: (publicKey: string) => void;
  onDisconnect: () => void;
}

export default function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    checkFreighterInstalled().then((installed) => {
      setIsInstalled(installed);
    });
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const pubKey = await connectWallet();
      if (pubKey) {
        setPublicKey(pubKey);
        onConnect(pubKey);
        const bal = await fetchBalance(pubKey);
        setBalance(bal);
      }
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setPublicKey(null);
    setBalance(null);
    onDisconnect();
  };

  if (!isInstalled) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30">
        <p className="text-red-800 dark:text-red-300 mb-5 text-center font-semibold text-lg">
          Freighter Wallet is not installed.
        </p>
        <a
          href="https://www.freighter.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-lg shadow-red-600/20"
        >
          <Download size={20} />
          Install Freighter
        </a>
      </div>
    );
  }

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
    <div className="flex justify-center w-full">
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
      >
        <Wallet className="transition-transform group-hover:scale-110" size={24} />
        {isLoading ? 'Connecting...' : 'Connect Freighter Wallet'}
      </button>
    </div>
  );
}
