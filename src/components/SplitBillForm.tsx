'use client';

import { useState } from 'react';
import { splitBillTransaction } from '@/utils/stellar';
import { Calculator, Send, Users, CircleDollarSign, CheckCircle2, AlertCircle, ExternalLink, Wallet } from 'lucide-react';

interface SplitBillFormProps {
  payerPublicKey: string;
}

export default function SplitBillForm({ payerPublicKey }: SplitBillFormProps) {
  const [totalXlm, setTotalXlm] = useState<string>('');
  const [numPeople, setNumPeople] = useState<string>('2');
  const [hostAddress, setHostAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parsedTotal = parseFloat(totalXlm) || 0;
  const parsedPeople = parseInt(numPeople) || 1;
  const individualShare = parsedPeople > 0 ? (parsedTotal / parsedPeople) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedTotal <= 0 || parsedPeople < 2 || !hostAddress) {
      setError('Please fill in all fields correctly. Minimum 2 people needed.');
      return;
    }

    setError(null);
    setTxHash(null);
    setIsLoading(true);

    try {
      // The individual share is what the payer needs to send for the split.
      // E.g. Total bill 100 XLM, 4 people. Each pays 25 XLM.
      // So the transaction will send 25 XLM.
      const hash = await splitBillTransaction(payerPublicKey, hostAddress, individualShare);
      setTxHash(hash);
      setTotalXlm('');
      setNumPeople('2');
      setHostAddress('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Transaction failed. Please ensure you have sufficient balance and the host address is valid.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Calculator size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Split Bill Calculator</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Calculate and pay your share instantly.</p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <CircleDollarSign size={16} /> Total Bill (XLM)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.0000001"
                  min="0"
                  value={totalXlm}
                  onChange={(e) => setTotalXlm(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white font-mono text-lg"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">XLM</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Users size={16} /> Number of People
              </label>
              <input
                type="number"
                min="2"
                step="1"
                value={numPeople}
                onChange={(e) => setNumPeople(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white font-mono text-lg"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Wallet size={16} /> Host Wallet Address (Testnet)
            </label>
            <input
              type="text"
              value={hostAddress}
              onChange={(e) => setHostAddress(e.target.value)}
              placeholder="G..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white font-mono"
              required
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The address of the person who paid the total bill.
            </p>
          </div>

          <div className="p-5 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">Your Share (Includes 1% fee)</p>
              <p className="text-3xl font-black text-indigo-900 dark:text-indigo-100 font-mono">
                {individualShare > 0 ? individualShare.toFixed(4) : '0.0000'} <span className="text-lg text-indigo-600/70">XLM</span>
              </p>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-xs text-indigo-500/80 mb-1">Fee breakdown</p>
              <p className="text-xs font-mono text-indigo-700 dark:text-indigo-300">
                Host: {(individualShare * 0.99).toFixed(4)} XLM<br/>
                Fee: {(individualShare * 0.01).toFixed(4)} XLM
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900/50 flex gap-3 items-start">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {txHash && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex flex-col gap-3">
              <div className="flex gap-3 items-start">
                <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-sm font-bold">Transaction Successful!</p>
                  <p className="text-sm mt-1 opacity-90">Your share has been paid.</p>
                </div>
              </div>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-3 py-2 rounded-lg w-fit hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
              >
                View on Stellar Expert <ExternalLink size={14} />
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || individualShare <= 0 || !hostAddress}
            className="w-full group relative flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={20} className="transition-transform group-hover:translate-x-1" />
                Pay Share Now
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
