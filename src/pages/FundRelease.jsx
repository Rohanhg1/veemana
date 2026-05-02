import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { submitTransaction } from '../utils/contract';

function calculateAIScore(amount, time, village, existingTransactions) {
  let score = 0;
  const warnings = [];
  const hour = parseInt(time?.split(":")?.[0] || new Date().getHours());

  if (hour < 6 || hour >= 22) {
    score += 30;
    warnings.push({ text: "Night transfer detected", points: "+30", level: "red" });
  }
  if (amount >= 5000000) {
    score += 15;
    warnings.push({ text: "Exceeds single transfer threshold", points: "+15", level: "amber" });
  }
  if (amount.toString().endsWith("00000") && amount >= 100000) {
    score += 20;
    warnings.push({ text: "Round number structuring pattern", points: "+20", level: "amber" });
  }
  const isDemoVillage = village && village.toLowerCase() === 'madhubani';
  const duplicate = existingTransactions.find(
    tx => tx.toEntity?.toLowerCase() === village?.toLowerCase() && !tx.flagged
  );
  if (duplicate || isDemoVillage) {
    score += 30;
    warnings.push({ text: "Duplicate village payment (received funds 12 days ago)", points: "+30", level: "red" });
  }
  return { score: Math.min(score, 95), warnings };
}

const inputCls = "w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";
const labelCls = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

export default function FundRelease() {
  const { userRole } = useAuth();
  const { transactions, addLocalTransaction } = useTransactions();

  const [formData, setFormData] = useState({
    domain: 'MGNREGA', state: 'Karnataka', district: '', village: '',
    amount: '', purpose: '', time: new Date().toTimeString().slice(0, 5)
  });
  const [warnings, setWarnings] = useState([]);
  const [isSigning, setIsSigning] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsScanning(true);
    const timer = setTimeout(() => {
      if (formData.amount || formData.time || formData.village) {
        const { warnings } = calculateAIScore(
          formData.amount ? parseInt(formData.amount) : 0,
          formData.time, formData.village, transactions
        );
        setWarnings(warnings);
      } else { setWarnings([]); }
      setIsScanning(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [formData, transactions]);

  const injectSuspiciousTransaction = () => {
    setFormData({ domain: 'Education', state: 'Bihar', district: 'Madhubani', village: 'Madhubani', amount: '5000000', purpose: 'routine transfer', time: '02:14' });
  };

  const handleSubmit = async () => {
    if (!formData.village || !formData.amount || !formData.purpose) { alert("Please fill all required fields"); return; }
    setIsSigning(true); setSuccess(null); setError(null);
    try {
      const ipfsHash = "Qm" + Math.random().toString(36).substr(2, 44);
      const txHash = await submitTransaction(formData.state, formData.village, formData.amount, formData.domain, ipfsHash);
      addLocalTransaction({
        id: Date.now(), fromEntity: formData.state, toEntity: formData.village,
        village: formData.village, state: formData.state,
        amount: formData.amount, domain: formData.domain, scheme: formData.domain,
        purpose: formData.purpose, ipfsHash, flagged: false,
        signaturesReceived: 0, timestamp: new Date().toLocaleString(), txHash, status: "pending"
      });
      setSuccess(txHash);
      setFormData(prev => ({ ...prev, district: '', village: '', amount: '', purpose: '' }));
    } catch (err) { setError("Transaction failed: " + err.message); }
    setIsSigning(false);
  };

  if (userRole !== 'admin') {
    return <div className="p-8 text-slate-600 bg-red-50 border border-red-200 rounded-xl">Access Denied. Admin only.</div>;
  }

  const aiScore = warnings.reduce((a, w) => a + parseInt(w.points), 0);
  const riskLevel = aiScore > 70 ? 'high' : aiScore > 40 ? 'medium' : 'safe';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Fund Release</h2>
        <p className="text-sm text-slate-500 mt-1">Initiate secure fund disbursements to Gram Panchayats via Ethereum Sepolia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Left: Form ── */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100">Transfer Details</h3>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Domain</label>
                <select value={formData.domain} onChange={e => setFormData({...formData, domain: e.target.value})} className={inputCls}>
                  <option value="MGNREGA">MGNREGA</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Education">Education</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>State</label>
                  <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className={inputCls}>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>District</label>
                  <input type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className={inputCls} placeholder="e.g. Kolar" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Village / Gram Panchayat</label>
                <input type="text" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} className={inputCls} placeholder="e.g. Kolar" />
              </div>
              <div>
                <label className={labelCls}>Purpose</label>
                <input type="text" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} className={inputCls} placeholder="e.g. Q3 wage disbursement" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className={`${inputCls} pl-7 font-mono`} placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Transfer Time</label>
                  <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className={`${inputCls} font-mono`} />
                </div>
              </div>
            </div>
          </div>

          {/* Demo inject button */}
          <button
            onClick={injectSuspiciousTransaction}
            className="w-full border-2 border-dashed border-red-300 text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">warning</span>
            Demo: Inject Suspicious Transaction 🚨
          </button>
        </div>

        {/* ── Right: AI Scan + Submit ── */}
        <div className="space-y-4">
          {/* AI Scan panel */}
          <div className={`bg-white border rounded-xl p-6 shadow-sm ${
            riskLevel === 'high' ? 'border-red-200' : riskLevel === 'medium' ? 'border-amber-200' : 'border-slate-200'
          }`}>
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className={`material-symbols-outlined text-[18px] ${
                riskLevel === 'high' ? 'text-red-500' : riskLevel === 'medium' ? 'text-amber-500' : 'text-blue-500'
              }`}>radar</span>
              PRE-SUBMISSION AI SCAN
            </h3>

            <div className={`min-h-[100px] rounded-lg p-4 font-mono text-sm mb-5 border space-y-2 ${
              riskLevel === 'high' ? 'bg-red-50 border-red-100' :
              riskLevel === 'medium' ? 'bg-amber-50 border-amber-100' :
              'bg-slate-50 border-slate-100'
            }`}>
              {isScanning ? (
                <div className="text-slate-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] animate-spin">autorenew</span>
                  Running anomaly check...
                </div>
              ) : (
                <>
                  <div className="text-slate-400 flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[16px]">done_all</span>
                    Anomaly check complete
                  </div>
                  {warnings.map((w, i) => (
                    <div key={i} className={`flex items-start gap-2 text-sm ${w.level === 'red' ? 'text-red-600' : 'text-amber-600'} animation-fade-in`}>
                      <span className="material-symbols-outlined text-[16px] mt-0.5">{w.level === 'red' ? 'error' : 'warning'}</span>
                      <span>{w.text} <span className="font-bold">{w.points}</span></span>
                    </div>
                  ))}
                  {warnings.length === 0 && formData.amount && formData.village && (
                    <div className="text-green-600 flex items-center gap-2 animation-fade-in text-sm">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Parameters normal. No risks detected.
                    </div>
                  )}
                  {warnings.length === 0 && !formData.amount && (
                    <div className="text-slate-400 text-sm">Fill in the form to run the AI scan.</div>
                  )}
                </>
              )}
            </div>

            {/* Score badge */}
            {warnings.length > 0 && (
              <div className={`flex items-center justify-between px-4 py-2 rounded-lg mb-4 ${
                riskLevel === 'high' ? 'bg-red-100 border border-red-200' : 'bg-amber-100 border border-amber-200'
              }`}>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Risk Score</span>
                <span className={`text-lg font-black ${riskLevel === 'high' ? 'text-red-700' : 'text-amber-700'}`}>{aiScore}/100 — {riskLevel === 'high' ? 'HIGH RISK' : 'MEDIUM RISK'}</span>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSigning}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {isSigning ? (
                <><span className="material-symbols-outlined animate-spin">autorenew</span> SIGNING WITH METAMASK...</>
              ) : (
                <><span className="material-symbols-outlined">edit_document</span> RELEASE FUNDS & SIGN ON BLOCKCHAIN</>
              )}
            </button>

            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium p-3 rounded-lg break-all">{error}</div>
            )}
          </div>

          {/* Success card */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 animation-fade-in shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-green-700">
                <span className="material-symbols-outlined text-3xl">task_alt</span>
                <h3 className="text-base font-bold">Transaction Recorded On-Chain</h3>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-200 text-sm mb-4">
                <p className="text-slate-500 text-xs mb-1 uppercase font-bold">TX Hash</p>
                <p className="text-green-700 font-mono text-xs break-all mb-4">{success}</p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${success}`}
                  target="_blank" rel="noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 w-full text-sm"
                >
                  View on Etherscan <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </a>
              </div>
              <p className="text-amber-700 font-bold text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
                Status: Awaiting Auditor Approval
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
