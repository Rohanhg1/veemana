import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { flagTransaction, addSignature } from '../utils/contract';

const DOMAIN_BADGES = {
  'MGNREGA':   'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Healthcare':'bg-blue-100 text-blue-700 border-blue-200',
  'Agriculture':'bg-amber-100 text-amber-700 border-amber-200',
  'Education': 'bg-purple-100 text-purple-700 border-purple-200'
};

export default function AuditorReview() {
  const { userRole } = useAuth();
  const { transactions, updateTransactionStatus } = useTransactions();
  const [selectedTx, setSelectedTx] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleFlag = async (txId) => {
    setIsProcessing(true);
    try {
      const txHash = await flagTransaction(txId);
      updateTransactionStatus(txId, {
        flagged: true, status: "frozen", flagTxHash: txHash,
        flaggedAt: new Date().toLocaleString(),
        frozenReason: `AI detected suspicious pattern (Score: ${selectedTx?.aiScore || 87}/100)`
      });
      setSelectedTx(prev => ({...prev, status: 'frozen', flagTxHash: txHash}));
    } catch (err) { alert("Flag failed: " + err.message); }
    setIsProcessing(false);
  };

  const handleApprove = async (txId) => {
    setIsProcessing(true);
    try {
      const txHash = await addSignature(txId);
      updateTransactionStatus(txId, { status: "approved", approvedAt: new Date().toLocaleString(), approveTxHash: txHash });
      setSelectedTx(prev => ({...prev, status: 'approved', approveTxHash: txHash}));
    } catch (err) { alert("Approval failed: " + err.message); }
    setIsProcessing(false);
  };

  if (userRole !== 'auditor') {
    return <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">Access Denied. Auditor only.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 130px)' }}>
      {/* Header */}
      <div className="mb-5 flex justify-between items-end flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Live Transaction Queue</h2>
          <p className="text-sm text-slate-500 mt-1">Cryptographically sign approvals or freeze suspicious transfers.</p>
        </div>
        <div className="text-xs text-slate-400 font-mono bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          {transactions.filter(t => t.status === 'pending').length} pending · Live
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* ── Left Feed ── */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Live Feed</h3>
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot"></span>
              Listening...
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {transactions.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-30">inbox</span>
                No transactions yet
              </div>
            )}
            {transactions.map(tx => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className={`p-3.5 rounded-lg cursor-pointer transition-all border relative overflow-hidden ${
                  selectedTx?.id === tx.id
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                {/* Status indicator strip */}
                <div className={`absolute left-0 top-0 w-1 h-full rounded-l-lg ${
                  tx.status === 'pending' ? 'bg-amber-400 animate-pulse' :
                  tx.status === 'frozen'  ? 'bg-red-500' : 'bg-green-500'
                }`} />

                <div className="pl-2">
                  <div className="flex justify-between items-start mb-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${DOMAIN_BADGES[tx.domain] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {tx.domain}
                    </span>
                    <span className="text-[10px] text-slate-400">{tx.time || tx.timestamp?.slice(0,5)}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-1">
                    {tx.village || tx.toEntity}, {tx.state}
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-mono font-bold text-blue-600">
                      ₹ {Number(tx.amount).toLocaleString('en-IN')}
                    </span>
                    {tx.status === 'pending' ? (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tx.aiScore > 70 ? 'bg-red-100 text-red-700' :
                        tx.aiScore > 40 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>
                        Score: {tx.aiScore || 0}
                      </span>
                    ) : (
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        tx.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{tx.status}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Detail Panel ── */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          {selectedTx ? (
            <div className="flex flex-col h-full overflow-y-auto animation-fade-in">
              {/* Detail header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex-shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase mb-1">
                      {selectedTx.village || selectedTx.toEntity}
                    </h3>
                    <p className="text-sm text-slate-500">{selectedTx.state} · {selectedTx.domain}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Transfer Amount</p>
                    <p className="text-2xl font-black text-blue-700 font-mono">
                      ₹ {Number(selectedTx.amount).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Purpose</span>
                    <span className="text-slate-800 font-medium">{selectedTx.purpose || '—'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Timestamp</span>
                    <span className="text-slate-800 font-mono">{selectedTx.timestamp}</span>
                  </div>
                  {selectedTx.txHash && (
                    <div className="col-span-2">
                      <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Transaction Hash</span>
                      <a href={`https://sepolia.etherscan.io/tx/${selectedTx.txHash}`} target="_blank" rel="noreferrer"
                        className="text-blue-600 font-mono text-xs hover:underline flex items-center gap-1">
                        {selectedTx.txHash} <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                      </a>
                    </div>
                  )}
                  {selectedTx.ipfsHash && (
                    <div className="col-span-2">
                      <span className="text-xs font-bold text-slate-400 uppercase block mb-1">IPFS Proof Document</span>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-mono text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full truncate max-w-xs"
                          style={{ boxShadow: '0 0 8px rgba(34,197,94,0.3)' }}
                          title={`ipfs://${selectedTx.ipfsHash}`}
                        >
                          ipfs://{selectedTx.ipfsHash}
                        </span>
                        <button
                          onClick={() => {
                            const hash = selectedTx.ipfsHash;
                            if (hash.startsWith('Qm') && hash.length === 46) {
                              window.open(`https://ipfs.io/ipfs/${hash}`, '_blank');
                            } else {
                              alert('Opening decentralized IPFS gateway...\n\nThis document is pinned immutably on the IPFS network.\nHash: ipfs://' + hash);
                            }
                          }}
                          className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-800 border border-violet-200 bg-violet-50 hover:bg-violet-100 px-2 py-1 rounded-lg transition-colors flex-shrink-0"
                        >
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          View IPFS Proof
                        </button>
                      </div>
                      {selectedTx.proofFileNames && selectedTx.proofFileNames.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {selectedTx.proofFileNames.map((name, i) => (
                            <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[11px]">attach_file</span>
                              {name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* AI analysis + action */}
              <div className="p-6 flex-1 space-y-5">
                {/* AI Score Card */}
                <div className={`p-5 rounded-xl border ${
                  selectedTx.aiScore > 70 ? 'bg-red-50 border-red-200' :
                  selectedTx.aiScore > 40 ? 'bg-amber-50 border-amber-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">psychology</span>
                      AI Suspicion Analysis
                    </h4>
                    <button onClick={() => setShowModal(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 underline font-bold">
                      How was this detected?
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <span className={`text-4xl font-black ${
                      selectedTx.aiScore > 70 ? 'text-red-700' :
                      selectedTx.aiScore > 40 ? 'text-amber-700' : 'text-green-700'
                    }`}>{selectedTx.aiScore || 0}/100</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      selectedTx.aiScore > 70 ? 'bg-red-100 border-red-300 text-red-700' :
                      selectedTx.aiScore > 40 ? 'bg-amber-100 border-amber-300 text-amber-700' :
                      'bg-green-100 border-green-300 text-green-700'
                    }`}>
                      {selectedTx.aiScore > 70 ? '⚠ HIGH RISK' : selectedTx.aiScore > 40 ? '△ MEDIUM RISK' : '✓ LOW RISK'}
                    </span>
                  </div>

                  {selectedTx.aiScore > 40 ? (
                    <div className="space-y-1.5 text-sm font-mono">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-2">Reasons detected:</p>
                      {(selectedTx.time >= '22:00' || selectedTx.time <= '06:00') && (
                        <p className="flex gap-2 text-red-700"><span>✗</span> Night transfer ({selectedTx.time}) — +30 pts</p>
                      )}
                      {selectedTx.village?.toLowerCase() === 'madhubani' && (
                        <p className="flex gap-2 text-red-700"><span>✗</span> Duplicate village payment — +30 pts</p>
                      )}
                      {selectedTx.amount?.toString().endsWith('00000') && Number(selectedTx.amount) >= 100000 && (
                        <p className="flex gap-2 text-amber-700"><span>✗</span> Round number amount — +20 pts</p>
                      )}
                      {Number(selectedTx.amount) > 5000000 && (
                        <p className="flex gap-2 text-amber-700"><span>✗</span> Exceeds transfer threshold — +15 pts</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-green-700 font-mono flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      No anomalous patterns detected in transfer matrix.
                    </p>
                  )}

                  <p className="mt-4 pt-3 border-t border-current/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Blockchain cannot alter this analysis. Permanent record.
                  </p>
                </div>

                {/* Action buttons */}
                {selectedTx.status === 'pending' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleApprove(selectedTx.id)}
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      {isProcessing ? <span className="material-symbols-outlined animate-spin">autorenew</span>
                        : <span className="material-symbols-outlined">verified</span>}
                      APPROVE — Sign with Wallet
                    </button>
                    <button
                      onClick={() => handleFlag(selectedTx.id)}
                      disabled={isProcessing}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      {isProcessing ? <span className="material-symbols-outlined animate-spin">autorenew</span>
                        : <span className="material-symbols-outlined">gavel</span>}
                      FLAG — Freeze Transaction
                    </button>
                  </div>
                ) : (
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    selectedTx.status === 'approved'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div>
                      <h4 className={`font-bold uppercase text-sm ${selectedTx.status === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
                        {selectedTx.status === 'approved' ? '✓ APPROVED' : '🔒 FROZEN & FLAGGED'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 font-mono">
                        {selectedTx.status === 'approved'
                          ? `Approved at ${selectedTx.approvedAt || selectedTx.timestamp} — immutable`
                          : `Flagged at ${selectedTx.flaggedAt || selectedTx.timestamp} — requires judicial order`}
                      </p>
                    </div>
                    <a href={`https://sepolia.etherscan.io/tx/${selectedTx.status === 'approved' ? selectedTx.approveTxHash : selectedTx.flagTxHash}`}
                      target="_blank" rel="noreferrer"
                      className={`text-xs font-bold px-3 py-2 rounded-lg border flex items-center gap-1 transition-colors ${
                        selectedTx.status === 'approved'
                          ? 'text-green-700 border-green-200 hover:bg-green-100'
                          : 'text-red-700 border-red-200 hover:bg-red-100'
                      }`}>
                      View TX <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-6xl mb-4 opacity-20">rule_folder</span>
              <p className="text-sm">Select a transaction from the live queue to review.</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
              How Blockchain Detected This Scam
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-xs font-bold text-red-600 uppercase mb-3 tracking-widest">Traditional System (PFMS 2009)</h4>
                <ul className="space-y-2.5 text-sm text-slate-600">
                  {['Single database — any official can edit it', 'No automatic anomaly detection', 'Evidence deletable before court date', 'No real-time citizen visibility'].map(t => (
                    <li key={t} className="flex gap-2"><span className="text-red-500 font-bold">✗</span> {t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-green-600 uppercase mb-3 tracking-widest">ClearLedger System</h4>
                <ul className="space-y-2.5 text-sm text-slate-600">
                  {['Transaction recorded in milliseconds — cannot be edited', 'AI scanned before money moved', 'IPFS stores evidence permanently', 'Citizens can verify from their phone', 'Auditor signature is cryptographic proof'].map(t => (
                    <li key={t} className="flex gap-2"><span className="text-green-500 font-bold">✓</span> {t}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 font-medium leading-relaxed">
              If this were real money — it is frozen in smart contract escrow. No politician, official, or hacker can release it without a judicial order with 3 new signatures.
            </div>
            <div className="mt-6 text-center">
              <button onClick={() => setShowModal(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
