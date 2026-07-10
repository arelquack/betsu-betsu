'use client';

import { useState } from 'react';
import WalletConnect from '@/components/WalletConnect';
import SplitBillForm from '@/components/SplitBillForm';
import ActivityFeed from '@/components/ActivityFeed';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  const [payerPublicKey, setPayerPublicKey] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 selection:bg-indigo-500/30 text-slate-900 dark:text-slate-100 font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/40 via-transparent to-purple-100/40 dark:from-indigo-900/20 dark:to-purple-900/20 pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 relative z-10">
        <header className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium text-sm mb-4">
            <Sparkles size={16} />
            <span>Stellar Testnet MVP - Orange Belt</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Betsu-Betsu (別々)
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            The frictionless way to split bills on Web3. Instant, transparent, and powered by Soroban Smart Contracts.
          </p>
        </header>

        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <ActivityFeed />
          
          <WalletConnect 
            onConnect={(key) => setPayerPublicKey(key)} 
            onDisconnect={() => setPayerPublicKey(null)} 
          />

          {payerPublicKey ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
              <SplitBillForm payerPublicKey={payerPublicKey} />
            </div>
          ) : (
            <div className="bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-8 text-center sm:py-16">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="text-indigo-600 dark:text-indigo-400 rotate-90 sm:rotate-0" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Connect your wallet to start</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Connect your Freighter or Albedo wallet to calculate your share and pay instantly with XLM.
              </p>
            </div>
          )}
        </div>
        
        <footer className="mt-20 text-center text-sm text-slate-500 dark:text-slate-500">
          <p>Built for the Stellar Monthly Challenge — Orange Belt</p>
        </footer>
      </div>
    </main>
  );
}
