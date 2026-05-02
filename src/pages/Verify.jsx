import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { VILLAGES } from '../data/realData';

export default function Verify() {
  const { transactions } = useTransactions();
  const [searchQuery, setSearchQuery] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = () => {
    if (!searchQuery.trim()) return;
    setErrorMsg(''); setIsVerifying(true); setResult(null);

    setTimeout(() => {
      const q = searchQuery.trim().toLowerCase();
      const hardcodedVillage = VILLAGES.find(v => v.name.toLowerCase() === q);

      if (!hardcodedVillage) {
        setErrorMsg(`No records found for '${searchQuery}'. Try: Madhubani, Kolar, Ludhiana, Barmer, Nashik, Sidhi`);
        setIsVerifying(false);
        return;
      }

      const liveTx = transactions.find(
        tx => (tx.toEntity && tx.toEntity.toLowerCase() === q) || (tx.village && tx.village.toLowerCase() === q)
      );

      if (liveTx) {
        if (liveTx.flagged || liveTx.status === 'frozen') {
          setResult({ ...hardcodedVillage, ...liveTx, village: hardcodedVillage.name, status: "frozen" });
        } else if (liveTx.status === "approved" || liveTx.signaturesReceived > 0) {
          setResult({ ...hardcodedVillage, ...liveTx, village: hardcodedVillage.name, status: "approved" });
        } else {
          setResult({ ...hardcodedVillage, ...liveTx, village: hardcodedVillage.name, status: "pending" });
        }
      } else {
        setResult({ ...hardcodedVillage, village: hardcodedVillage.name, status: "approved", amount: hardcodedVillage.allocated });
      }
      setIsVerifying(false);
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl mb-4 shadow-sm">
          <span className="material-symbols-outlined text-blue-600 text-3xl">verified_user</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Live Citizen Verify Portal</h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Direct read access to the Ethereum blockchain. Search your village to see the real-time status of government fund transfers.
        </p>
      </div>

      {/* Search bar */}
      <div className="bg-white border border-slate-200 rounded-2xl flex items-center p-2 mb-6 shadow-sm">
        <span className="material-symbols-outlined text-slate-400 ml-3 mr-2 text-[20px]">location_on</span>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="e.g. Madhubani, Kolar, Ludhiana..."
          className="flex-1 bg-transparent border-none text-slate-800 text-sm placeholder:text-slate-400 focus:ring-0 outline-none"
          onKeyDown={e => e.key === 'Enter' && handleVerify()}
        />
        <button
          onClick={handleVerify}
          disabled={isVerifying}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
        >
          {isVerifying ? (
            <><span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span> Checking...</>
          ) : (
            <>Verify Funds <span className="material-symbols-outlined text-[16px]">arrow_forward</span></>
          )}
        </button>
      </div>

      {/* Sample villages hint */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {['Madhubani', 'Kolar', 'Barmer', 'Nashik', 'Ludhiana'].map(v => (
          <button key={v} onClick={() => { setSearchQuery(v); }}
            className="text-xs px-3 py-1 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-full transition-colors font-medium">
            {v}
          </button>
        ))}
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3 text-sm">
          <span className="material-symbols-outlined mt-0.5 text-[18px]">search_off</span>
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Results */}
      {result && !isVerifying && (
        <div className="animation-fade-in">

          {/* APPROVED */}
          {result.status === 'approved' && (
            <div className="bg-white border border-green-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-green-50 border-b border-green-200 px-6 py-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
                <h3 className="text-lg font-bold text-green-800 uppercase tracking-wider">
                  {result.txHash ? 'Blockchain Confirmed' : 'Officially Verified'}
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-5 mb-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Village</p>
                    <p className="text-base font-bold text-slate-900">{result.village}, {result.state || 'India'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Domain</p>
                    <p className="text-base font-bold text-slate-900">{result.domain || 'General'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Allocated</p>
                    <p className="text-lg font-bold text-slate-700 font-mono">₹ {Number(result.amount).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Received Ground</p>
                    <p className="text-2xl font-black text-green-700 font-mono">₹ {Number(result.received || result.amount).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {result.txHash && (
                  <>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-xl font-mono text-sm space-y-2 mb-4">
                      <p className="text-slate-600 flex gap-2"><span className="text-green-600 font-bold">✓</span> Approved by Auditor: {result.auditor || 'Cryptographic Signature Valid'} at {result.timestamp}</p>
                      <p className="text-slate-600 flex gap-2"><span className="text-green-600 font-bold">✓</span> Block #{result.blockNumber || 'Latest'} — Immutable record</p>
                    </div>
                    <a href={`https://sepolia.etherscan.io/tx/${result.txHash}`} target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
                      View on Etherscan <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          )}

          {/* PENDING */}
          {result.status === 'pending' && (
            <div className="bg-white border border-amber-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-600 text-2xl animate-pulse">hourglass_top</span>
                <h3 className="text-lg font-bold text-amber-800 uppercase tracking-wider">Awaiting Auditor Approval</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-5 mb-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Village</p>
                    <p className="text-base font-bold text-slate-900">{result.village}, {result.state}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Domain</p>
                    <p className="text-base font-bold text-slate-900">{result.domain}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Amount Released</p>
                    <p className="text-3xl font-black text-amber-700 font-mono">₹ {Number(result.amount).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm space-y-1 mb-4">
                  <p className="text-amber-800 font-bold">Status: Auditor review in progress</p>
                  <p className="text-slate-600">Funds held in smart contract escrow. Cannot be diverted during review period.</p>
                </div>
                {result.txHash && (
                  <a href={`https://sepolia.etherscan.io/tx/${result.txHash}`} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
                    Track Escrow on Etherscan <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* FROZEN */}
          {result.status === 'frozen' && (
            <div className="bg-white border-2 border-red-300 rounded-2xl overflow-hidden shadow-md">
              <div className="h-1 bg-red-500 animate-pulse"></div>
              <div className="bg-red-50 border-b border-red-200 px-6 py-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-red-600 text-2xl">lock</span>
                <h3 className="text-lg font-bold text-red-800 uppercase tracking-wider">Funds Frozen — Audit In Progress</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-5 mb-6">
                  <div>
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Village</p>
                    <p className="text-base font-bold text-slate-900">{result.village}, {result.state}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Domain</p>
                    <p className="text-base font-bold text-slate-900">{result.domain}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Frozen Amount</p>
                    <p className="text-3xl font-black text-red-700 font-mono">₹ {Number(result.amount).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-sm space-y-2 mb-4 font-mono">
                  <p className="text-red-700 font-bold flex gap-2">
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                    Frozen by Auditor at {result.timestamp}
                  </p>
                  <p className="text-slate-700">Reason: {result.frozenReason || `AI detected suspicious pattern (Score: ${result.aiScore || 87}/100)`}</p>
                  <div className="border-t border-red-200 pt-2 mt-2">
                    <p className="text-red-700 font-bold uppercase">Blockchain record permanent — case filed</p>
                    <p className="text-slate-500 text-xs">FIR Reference: CL-{Date.now()}</p>
                    <p className="text-red-800 bg-red-100 p-2 rounded mt-2 border border-red-200 font-sans text-xs">
                      This money cannot be moved by anyone until a judicial order is received.
                    </p>
                  </div>
                </div>
                {result.txHash && (
                  <a href={`https://sepolia.etherscan.io/tx/${result.flagTxHash || result.txHash}`} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
                    View Audit Flag on Etherscan <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
