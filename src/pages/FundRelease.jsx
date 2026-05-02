import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { submitTransaction } from '../utils/contract';

// ─── AI Risk Score ────────────────────────────────────────────────────────────
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

// ─── Simulated IPFS hash generator ───────────────────────────────────────────
function generateIPFSHash(fileName) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let hash = 'Qm';
  const seed = fileName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  for (let i = 0; i < 44; i++) {
    hash += chars[(seed * (i + 7) * 31 + i * 13) % chars.length];
  }
  return hash;
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

  // ── File / IPFS proof state ──
  const [proofFiles, setProofFiles]     = useState([]);   // array of { name, size, type, ipfsHash }
  const [isDragging, setIsDragging]     = useState(false);
  const [hashAnimating, setHashAnimating] = useState(false);
  const fileInputRef = useRef(null);

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

  // ── File handlers ──────────────────────────────────────────────────────────
  const processFiles = (files) => {
    const newFiles = Array.from(files).map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      ipfsHash: generateIPFSHash(f.name + f.size),
    }));
    setProofFiles(prev => [...prev, ...newFiles]);
    setHashAnimating(true);
    setTimeout(() => setHashAnimating(false), 1500);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e) => {
    if (e.target.files.length) processFiles(e.target.files);
  };

  const removeFile = (index) => {
    setProofFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ── Inject demo ────────────────────────────────────────────────────────────
  const injectSuspiciousTransaction = () => {
    setFormData({ domain: 'Education', state: 'Bihar', district: 'Madhubani', village: 'Madhubani', amount: '5000000', purpose: 'routine transfer', time: '02:14' });
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formData.village || !formData.amount || !formData.purpose) {
      alert("Please fill all required fields"); return;
    }
    if (proofFiles.length === 0) {
      alert("⚠️ At least one proof document (receipt or geo-tagged image) is required before releasing funds."); return;
    }
    setIsSigning(true); setSuccess(null); setError(null);
    try {
      // Use first proof file's IPFS hash as primary; append others if multiple
      const primaryHash = proofFiles[0].ipfsHash;
      const allHashes   = proofFiles.map(f => f.ipfsHash).join(',');

      const txHash = await submitTransaction(
        formData.state, formData.village,
        formData.amount, formData.domain,
        primaryHash
      );

      addLocalTransaction({
        id: Date.now(),
        fromEntity: formData.state,
        toEntity:   formData.village,
        village:    formData.village,
        state:      formData.state,
        amount:     formData.amount,
        domain:     formData.domain,
        scheme:     formData.domain,
        purpose:    formData.purpose,
        ipfsHash:   primaryHash,
        allIpfsHashes: allHashes,
        proofFileNames: proofFiles.map(f => f.name),
        flagged:    false,
        signaturesReceived: 0,
        timestamp:  new Date().toLocaleString(),
        txHash,
        status:     "pending"
      });

      setSuccess({ txHash, ipfsHash: primaryHash });
      setFormData(prev => ({ ...prev, district: '', village: '', amount: '', purpose: '' }));
      setProofFiles([]);
    } catch (err) {
      setError("Transaction failed: " + err.message);
    }
    setIsSigning(false);
  };

  if (userRole !== 'admin') {
    return <div className="p-8 text-slate-600 bg-red-50 border border-red-200 rounded-xl">Access Denied. Admin only.</div>;
  }

  const aiScore   = warnings.reduce((a, w) => a + parseInt(w.points), 0);
  const riskLevel = aiScore > 70 ? 'high' : aiScore > 40 ? 'medium' : 'safe';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Fund Release</h2>
        <p className="text-sm text-slate-500 mt-1">
          Initiate secure fund disbursements to Gram Panchayats via Ethereum Sepolia.
          <span className="ml-1 text-amber-600 font-semibold">Documentary proof required before release.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Left: Form + Proof Upload ── */}
        <div className="space-y-4">
          {/* Transfer Details */}
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
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.amount}
                      onChange={e => {
                        // Only allow digits — strip everything else
                        const digits = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({...formData, amount: digits});
                      }}
                      className={`${inputCls} pl-7 font-mono tracking-wide`}
                      placeholder="e.g. 1200000"
                    />
                  </div>
                  {formData.amount && (
                    <p className="text-[11px] text-slate-400 mt-1 font-mono pl-1">
                      = ₹ {Number(formData.amount).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Transfer Time</label>
                  <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className={`${inputCls} font-mono`} />
                </div>
              </div>
            </div>
          </div>

          {/* ── IPFS Proof Upload ───────────────────────────────────────────── */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[18px] text-violet-600">attach_file</span>
              <h3 className="text-sm font-bold text-slate-800">Attach Verified Receipts / Geo-Tagged Imagery</h3>
              <span className="ml-auto text-[10px] font-bold text-red-600 uppercase bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Required</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">Files are hashed and pinned to IPFS — creating an immutable evidence trail before funds move.</p>

            {/* Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-violet-400 bg-violet-50'
                  : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-3xl text-slate-300 mb-2 block">cloud_upload</span>
              <p className="text-sm font-semibold text-slate-500">Drop receipts or geo-tagged images here</p>
              <p className="text-[11px] text-slate-400 mt-1">PDF, JPG, PNG, HEIC — any file accepted</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.heic"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>

            {/* File list + IPFS hashes */}
            {proofFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {proofFiles.map((f, i) => (
                  <div key={i} className={`bg-slate-50 border border-slate-200 rounded-lg p-3 transition-all ${hashAnimating && i === proofFiles.length - 1 ? 'border-violet-300 bg-violet-50' : ''}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-[16px] text-slate-400 flex-shrink-0">
                          {f.type.startsWith('image') ? 'image' : 'picture_as_pdf'}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 truncate">{f.name}</span>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {(f.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(i)}
                        className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                    {/* Glowing IPFS hash pill */}
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[13px] text-green-500">link</span>
                      <span
                        className="text-[10px] font-mono text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full truncate max-w-full"
                        style={{ boxShadow: '0 0 8px rgba(34,197,94,0.35)' }}
                        title={`ipfs://${f.ipfsHash}`}
                      >
                        ipfs://{f.ipfsHash}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {proofFiles.length === 0 && (
              <p className="text-center text-[11px] text-red-500 font-semibold mt-3 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[13px]">warning</span>
                No proof attached — submission will be blocked
              </p>
            )}
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
              riskLevel === 'high'   ? 'bg-red-50 border-red-100' :
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
                    <div key={i} className={`flex items-start gap-2 text-sm ${w.level === 'red' ? 'text-red-600' : 'text-amber-600'}`}>
                      <span className="material-symbols-outlined text-[16px] mt-0.5">{w.level === 'red' ? 'error' : 'warning'}</span>
                      <span>{w.text} <span className="font-bold">{w.points}</span></span>
                    </div>
                  ))}
                  {warnings.length === 0 && formData.amount && formData.village && (
                    <div className="text-green-600 flex items-center gap-2 text-sm">
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

            {/* Proof status indicator */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg mb-4 text-sm font-semibold border ${
              proofFiles.length > 0
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <span className="material-symbols-outlined text-[18px]">
                {proofFiles.length > 0 ? 'verified' : 'block'}
              </span>
              {proofFiles.length > 0
                ? `${proofFiles.length} proof document${proofFiles.length > 1 ? 's' : ''} attached — IPFS hashed`
                : 'No proof attached — submission blocked'}
            </div>

            {/* Score badge */}
            {warnings.length > 0 && (
              <div className={`flex items-center justify-between px-4 py-2 rounded-lg mb-4 ${
                riskLevel === 'high' ? 'bg-red-100 border border-red-200' : 'bg-amber-100 border border-amber-200'
              }`}>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Risk Score</span>
                <span className={`text-lg font-black ${riskLevel === 'high' ? 'text-red-700' : 'text-amber-700'}`}>
                  {aiScore}/100 — {riskLevel === 'high' ? 'HIGH RISK' : 'MEDIUM RISK'}
                </span>
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
              <div className="bg-white p-4 rounded-lg border border-green-200 text-sm mb-4 space-y-3">
                <div>
                  <p className="text-slate-500 text-xs mb-1 uppercase font-bold">TX Hash</p>
                  <p className="text-green-700 font-mono text-xs break-all">{success.txHash}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1 uppercase font-bold">IPFS Proof Hash</p>
                  <p
                    className="text-[11px] font-mono text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-lg break-all"
                    style={{ boxShadow: '0 0 10px rgba(34,197,94,0.3)' }}
                  >
                    ipfs://{success.ipfsHash}
                  </p>
                </div>
                <a
                  href={`https://sepolia.etherscan.io/tx/${success.txHash}`}
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
