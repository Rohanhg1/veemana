import React from 'react';
import { useAuth } from '../context/AuthContext';
import { REAL_DATA, VILLAGES } from '../data/realData';
import { jsPDF } from 'jspdf';

export default function AuditExport() {
  const { activeDomain } = useAuth();
  const flaggedTxs = VILLAGES.filter(v => v.domain === activeDomain && (v.allocated - v.received > 0));

  const handleExportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,";
    csv += "Village Name,State,Domain,Allocated (INR),Received (INR),Deficit (INR),Transaction Hash\n";
    flaggedTxs.forEach(v => {
      csv += `"${v.name}","${v.state}","${v.domain}",${v.allocated},${v.received},${v.allocated - v.received},"${v.txHash}"\n`;
    });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `ClearLedger_AuditExport_${activeDomain}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20); doc.text(`Official Audit Export: ${activeDomain}`, 14, 22);
    doc.setFontSize(10);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text("Transactions showing discrepancies between allocation and ground receipt.", 14, 36);
    let y = 50;
    flaggedTxs.forEach((tx, idx) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(12); doc.setTextColor(220, 38, 38);
      doc.text(`Incident #${idx + 1}: ${tx.name}, ${tx.state}`, 14, y);
      doc.setFontSize(10); doc.setTextColor(0, 0, 0); y += 6;
      doc.text(`Allocated: INR ${Number(tx.allocated).toLocaleString('en-IN')} | Received: INR ${Number(tx.received).toLocaleString('en-IN')}`, 14, y); y += 6;
      doc.text(`Missing Funds: INR ${Number(tx.allocated - tx.received).toLocaleString('en-IN')}`, 14, y); y += 6;
      doc.text(`Tx Hash: ${tx.txHash}`, 14, y); y += 15;
    });
    doc.save(`AuditExport_${activeDomain}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Audit Data Export</h2>
          <p className="text-sm text-slate-500 mt-1">Export official transaction logs for {activeDomain}.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">table</span>
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Export PDF Report
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Records</p>
          <p className="text-3xl font-black text-slate-900">{flaggedTxs.length}</p>
        </div>
        <div className="bg-white border border-red-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Deficit</p>
          <p className="text-2xl font-black text-red-700 font-mono">
            ₹ {Number(flaggedTxs.reduce((a, v) => a + (v.allocated - v.received), 0)).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Domain</p>
          <p className="text-xl font-black text-blue-700">{activeDomain}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {['Village', 'State', 'Allocated (₹)', 'Received (₹)', 'Deficit (₹)', 'Tx Hash'].map(h => (
                <th key={h} className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {flaggedTxs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-sm">
                  <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">check_circle</span>
                  No discrepancies found in {activeDomain} domain.
                </td>
              </tr>
            ) : (
              flaggedTxs.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 text-sm font-semibold text-slate-800">{row.name}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{row.state}</td>
                  <td className="px-5 py-4 text-sm font-mono font-bold text-blue-700">{Number(row.allocated).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-4 text-sm font-mono font-bold text-green-700">{Number(row.received).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-4 text-sm font-mono font-bold text-red-700">{Number(row.allocated - row.received).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-4 text-xs font-mono text-slate-400">{row.txHash}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
