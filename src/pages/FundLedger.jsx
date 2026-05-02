import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';

const GENERATE_LEDGER = () => [
  { id: 1, entity: 'Ministry of Finance',  village: 'Kolar',    amount: 5728000,  txHash: '0x937b...0477', date: '23 Oct 2023', status: 'verified', score: 12, age: 340 },
  { id: 2, entity: 'State Treasury',       village: 'Barmer',   amount: 8900000,  txHash: '0x3f4g...5h6i', date: '24 Oct 2023', status: 'flagged',  score: 85, age: 12  },
  { id: 3, entity: 'Health Dept',          village: 'Nashik',   amount: 9200000,  txHash: '0x2n3o...4p5q', date: '25 Oct 2023', status: 'flagged',  score: 92, age: 4   },
  { id: 4, entity: 'Education Board',      village: 'Sidhi',    amount: 4200000,  txHash: '0x8m9n...0p1q', date: '26 Oct 2023', status: 'flagged',  score: 78, age: 45  },
  { id: 5, entity: 'Agriculture Dept',     village: 'Ludhiana', amount: 12000000, txHash: '0x1e2f...4g5h', date: '27 Oct 2023', status: 'verified', score: 5,  age: 500 }
];

export default function FundLedger() {
  const { userRole, activeDomain } = useAuth();
  const [expandedRow, setExpandedRow] = useState(null);
  const [filterHighRisk, setFilterHighRisk] = useState(false);

  const MOCK_LEDGER = GENERATE_LEDGER();
  const displayData = filterHighRisk ? MOCK_LEDGER.filter(r => r.score > 70) : MOCK_LEDGER;

  const handleGenerateNotice = (row) => {
    const doc = new jsPDF();
    doc.setFontSize(22); doc.setTextColor(220, 38, 38);
    doc.text('OFFICIAL LEGAL NOTICE - AUDIT FLAG', 20, 30);
    doc.setFontSize(12); doc.setTextColor(0, 0, 0);
    doc.text(`Notice Date: ${new Date().toLocaleDateString()}`, 20, 50);
    doc.text(`Regarding Transaction: ${row.txHash}`, 20, 60);
    doc.text(`Entity Involved: ${row.entity}`, 20, 70);
    doc.text(`Recipient Village: ${row.village}`, 20, 80);
    doc.text(`Amount: INR ${Number(row.amount).toLocaleString('en-IN')}`, 20, 90);
    doc.setTextColor(220, 38, 38);
    doc.text(`AI SUSPICION SCORE: ${row.score}/100`, 20, 110);
    doc.text(`WALLET AGE: ${row.age} hours`, 20, 120);
    if (row.age < 48) doc.text(`CRITICAL: Wallet age is less than 48 hours (Ghost Wallet Indicator).`, 20, 130);
    doc.setTextColor(0, 0, 0);
    doc.text('This transaction has been flagged by the ClearLedger AI Audit Node.', 20, 160);
    doc.text('Immediate explanation and documentation are required within 48 hours.', 20, 170);
    doc.save(`LegalNotice_${row.village}_${row.txHash}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Immutable Fund Ledger</h2>
          <p className="text-sm text-slate-500 mt-1">Deep-dive transaction tracing for {activeDomain} funds.</p>
        </div>
        {userRole === 'auditor' && (
          <button
            onClick={() => setFilterHighRisk(!filterHighRisk)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 border ${
              filterHighRisk
                ? 'bg-red-50 border-red-300 text-red-700 shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">filter_alt</span>
            {filterHighRisk ? 'Showing High Risk Only' : 'Filter: High Risk'}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">From Entity</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">To Village</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount (₹)</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tx Hash</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                {userRole === 'auditor' && (
                  <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Wallet Age</th>
                )}
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayData.map(row => (
                <React.Fragment key={row.id}>
                  <tr
                    className={`hover:bg-slate-50 transition-colors cursor-pointer group ${expandedRow === row.id ? 'bg-blue-50/50' : ''}`}
                    onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-slate-800">{row.entity}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{row.village}</td>
                    <td className="px-5 py-4 text-sm font-mono font-bold text-blue-700">
                      {Number(row.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono text-slate-400 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                        {row.txHash}
                        <span className="material-symbols-outlined text-[10px] opacity-0 group-hover:opacity-100">content_copy</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{row.date}</td>

                    {userRole === 'auditor' && (
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          row.age < 48
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                          {row.age}h
                        </span>
                      </td>
                    )}

                    <td className="px-5 py-4">
                      {row.status === 'verified' ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 text-xs font-bold px-2.5 py-1 rounded-full">
                          <span className="material-symbols-outlined text-[12px]">verified</span> Verified
                        </span>
                      ) : row.status === 'flagged' ? (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 border border-red-200 text-xs font-bold px-2.5 py-1 rounded-full">
                          <span className="material-symbols-outlined text-[12px]">warning</span> Flagged
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full">
                          <span className="material-symbols-outlined text-[12px]">schedule</span> Pending
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Expanded row */}
                  {expandedRow === row.id && (
                    <tr className="bg-slate-50 border-b border-slate-200 animation-fade-in">
                      <td colSpan={userRole === 'auditor' ? 7 : 6} className="px-6 py-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="col-span-2">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">AI Node Analysis</h4>
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-xl border flex flex-col items-center justify-center min-w-[80px] ${
                                row.score > 70
                                  ? 'bg-red-50 border-red-200'
                                  : 'bg-green-50 border-green-200'
                              }`}>
                                <span className={`text-2xl font-black ${row.score > 70 ? 'text-red-700' : 'text-green-700'}`}>
                                  {row.score}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Score</span>
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed">
                                {row.score > 70
                                  ? `High risk detected. Fund flow velocity exceeds normal parameters for ${row.village}. Recipient wallet age is unusually low (${row.age}h). Potential ghost wallet structuring.`
                                  : `Normal parameters. Transaction aligns with historical data for ${activeDomain} in ${row.village}.`}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col justify-end gap-3">
                            {userRole === 'auditor' && row.score > 70 && (
                              <button
                                onClick={() => handleGenerateNotice(row)}
                                className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                                Generate Legal Notice
                              </button>
                            )}
                            <button className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                              <span className="material-symbols-outlined text-[16px]">travel_explore</span>
                              View on Etherscan
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
