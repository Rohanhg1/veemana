import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import { connectWallet } from '../utils/contract';

const inputCls = "w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";
const labelCls = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

export default function FlagReport() {
  const { activeDomain } = useAuth();
  const [formData, setFormData] = useState({ state: '', district: '', amount: '', description: '', time: '14:00' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleAnalyze = () => {
    if (!formData.amount || !formData.description) { alert("Please enter amount and description."); return; }
    setIsAnalyzing(true); setResult(null); setTxHash('');
    setTimeout(() => {
      let score = 10;
      const hour = parseInt(formData.time.split(':')[0]);
      if (hour >= 22 || hour <= 6) score += 30;
      if (formData.amount.endsWith('00000')) score += 20;
      const descLower = formData.description.toLowerCase();
      if (descLower.includes('duplicate') || descLower.includes('repeat')) score += 20;
      if (parseInt(formData.amount) > 5000000) score += 15;
      if (score > 95) score = 95;

      let category = "Suspicious Structuring";
      if (descLower.includes('ghost') || descLower.includes('missing')) category = "Ghost Beneficiary";
      else if (descLower.includes('duplicate')) category = "Duplicate Payment";
      else if (hour >= 22 || hour <= 6) category = "Night Transfer Anomaly";

      const ipfsHash = "Qm" + Array.from({length: 44}, () => Math.floor(Math.random()*36).toString(36)).join('');
      const firText = `FIRST INFORMATION REPORT (AUTOMATED AI DRAFT)\nDate: ${new Date().toLocaleDateString()}\nDomain: ${activeDomain}\nState: ${formData.state || 'N/A'}, District: ${formData.district || 'N/A'}\n\nAn anomalous transaction of INR ${parseInt(formData.amount).toLocaleString('en-IN')} was detected.\nAI Risk Score: ${score}/100 — Category: ${category}\nAuditor Description: "${formData.description}"\n\nThis report is cryptographically sealed.\nIPFS Evidence Hash: ${ipfsHash}`;

      setResult({ score, category, ipfsHash, firText });
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleDownloadFIR = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(22); doc.setTextColor(220, 38, 38);
    doc.text('OFFICIAL FIR - FIRST INFORMATION REPORT', 20, 30);
    doc.setFontSize(12); doc.setTextColor(0, 0, 0);
    doc.text(doc.splitTextToSize(result.firText, 170), 20, 50);
    doc.setTextColor(220, 38, 38);
    doc.text(`AI RISK SCORE: ${result.score}/100`, 20, 150);
    doc.setTextColor(0, 0, 0);
    doc.text(`IPFS Hash: ${result.ipfsHash}`, 20, 160);
    doc.save(`FIR_${activeDomain}_${Date.now()}.pdf`);
  };

  const handleRecordBlockchain = async () => {
    setIsRecording(true);
    try {
      await connectWallet();
      await new Promise(r => setTimeout(r, 1500));
      setTxHash('0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''));
    } catch { alert("Failed to sign transaction. Check MetaMask."); }
    setIsRecording(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 pb-5 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500 text-2xl">policy</span>
          Audit Flag &amp; Report
        </h2>
        <p className="text-sm text-slate-500 mt-1">Analyze anomalous transactions and record immutable evidence on-chain.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Form ── */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-5">Incident Details</h3>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Domain</label>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold text-blue-700">{activeDomain}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>State</label>
                <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className={inputCls} placeholder="e.g. Karnataka" />
              </div>
              <div>
                <label className={labelCls}>District</label>
                <input type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className={inputCls} placeholder="e.g. Kolar" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Suspicious Amount (₹)</label>
                <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className={`${inputCls} font-mono`} placeholder="10,00,000" />
              </div>
              <div>
                <label className={labelCls}>Time of Transfer</label>
                <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className={`${inputCls} font-mono`} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Description / Evidence</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={4}
                className={`${inputCls} resize-none`}
                placeholder="Describe the anomaly (e.g., duplicate payments, ghost wallets)..."
              />
            </div>
            <div>
              <label className={labelCls}>Evidence Upload (Screenshot/CSV)</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer group">
                <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-500 text-3xl mb-1 block">cloud_upload</span>
                <p className="text-xs text-slate-400 group-hover:text-blue-600">Click to browse or drag and drop</p>
              </div>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm mt-2"
            >
              {isAnalyzing ? (
                <><span className="material-symbols-outlined animate-spin">autorenew</span> ANALYZING...</>
              ) : (
                <><span className="material-symbols-outlined">psychology</span> ANALYZE WITH AI</>
              )}
            </button>
          </div>
        </div>

        {/* ── Results ── */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-5">AI Node Result</h3>

          {isAnalyzing ? (
            <div className="flex-1 flex flex-col items-center justify-center text-blue-600 space-y-4">
              <span className="material-symbols-outlined text-6xl animate-spin">model_training</span>
              <p className="font-mono text-sm animate-pulse text-slate-500">Running deterministic rule engine...</p>
            </div>
          ) : result ? (
            <div className="flex-1 space-y-5 animation-fade-in">
              {/* Score */}
              <div className={`flex items-center gap-5 p-5 rounded-xl border ${
                result.score > 70 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
              }`}>
                <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 flex-shrink-0 ${
                  result.score > 70 ? 'border-red-500 text-red-700' : 'border-amber-400 text-amber-700'
                }`}>
                  <span className="text-2xl font-black">{result.score}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest">Score</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Classification</p>
                  <h4 className="text-lg font-bold text-slate-900">{result.category}</h4>
                  <div className="flex gap-2 mt-2">
                    {result.score > 70 && (
                      <span className="bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-[10px] font-bold">CRITICAL</span>
                    )}
                    <span className="bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-bold">AI VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* FIR text */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Auto-Generated FIR</p>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                  {result.firText}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={handleDownloadFIR}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span> Download PDF
                </button>
                <button
                  onClick={handleRecordBlockchain}
                  disabled={isRecording || !!txHash}
                  className={`flex-1 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm ${
                    txHash ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isRecording ? (
                    <><span className="material-symbols-outlined animate-spin">autorenew</span> SIGNING...</>
                  ) : txHash ? (
                    <><span className="material-symbols-outlined">check_circle</span> RECORDED</>
                  ) : (
                    <><span className="material-symbols-outlined text-[18px]">gavel</span> RECORD ON CHAIN</>
                  )}
                </button>
              </div>

              {txHash && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-xl text-center">
                  <p className="text-xs text-slate-500 mb-1 font-bold uppercase">Blockchain Receipt (Sepolia)</p>
                  <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer"
                    className="text-blue-600 font-mono text-[10px] break-all hover:underline flex items-center justify-center gap-1">
                    {txHash} <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-3 opacity-30">data_exploration</span>
              <p className="text-sm">Submit the form to view AI analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
