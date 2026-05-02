import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { connectWallet } from '../utils/contract';
import { motion } from 'framer-motion';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(false);
  const [officialRole, setOfficialRole] = useState('admin');

  const handleWalletLogin = async () => {
    setConnecting(true);
    try {
      const result = await connectWallet();
      if (!result) { setConnecting(false); return; }
      login(officialRole, result.address);
      navigate('/');
    } catch (error) {
      console.error("Wallet connection failed", error);
      alert("You must connect a verified MetaMask wallet to proceed as " + officialRole + ".");
    }
    setConnecting(false);
  };

  const handleCitizenLogin = () => { login('citizen'); navigate('/'); };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center p-8 font-['Public_Sans'] overflow-hidden">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 z-0 opacity-30"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #c7d2fe 1px, transparent 0)', backgroundSize: '32px 32px' }}>
      </div>
      {/* Soft glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-200/30 rounded-full blur-3xl z-0 pointer-events-none"></div>

      {/* Branding */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-center mb-12 relative z-10"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white border border-blue-200 rounded-2xl shadow-md mb-5">
          <span className="material-symbols-outlined text-blue-600 text-3xl">account_balance</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">ClearLedger</h1>
        <p className="text-blue-600 tracking-[0.15em] uppercase font-bold text-xs">Institutional Blockchain Node · Sepolia</p>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full relative z-10">
        {/* Citizen Card */}
        <motion.div
          whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(34,197,94,0.15)' }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-3xl text-green-600">public</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Citizen Portal</h2>
          <p className="text-sm text-slate-500 mb-8 flex-1 leading-relaxed">
            Access the public transparency node. Verify scheme funds allocated vs. received for any Gram Panchayat directly from the blockchain.
          </p>
          <button
            onClick={handleCitizenLogin}
            className="w-full py-3.5 px-6 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition-colors text-sm tracking-wide shadow-sm"
          >
            Enter as Citizen
          </button>
        </motion.div>

        {/* Official Card */}
        <motion.div
          whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(59,130,246,0.15)' }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-3xl text-blue-600">admin_panel_settings</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Official Node</h2>
          <p className="text-sm text-slate-500 mb-5 flex-1 leading-relaxed">
            Government and Audit entry point. Requires an authorized cryptographic signature to access ledger controls.
          </p>

          <div className="w-full mb-4 relative">
            <label className="block text-left text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Clearance Level</label>
            <select
              value={officialRole}
              onChange={e => setOfficialRole(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
            >
              <option value="admin">Government Official (Admin)</option>
              <option value="auditor">Audit Officer (CAG)</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-[calc(50%+6px)] -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>

          <button
            onClick={handleWalletLogin}
            disabled={connecting}
            className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold transition-colors flex items-center justify-center gap-3 text-sm tracking-wide shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse"></div>
            {connecting ? 'Establishing Connection...' : 'Connect Official Wallet'}
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="mt-10 flex items-center gap-2 relative z-10 opacity-60 hover:opacity-100 transition-opacity">
        <span className="material-symbols-outlined text-sm text-slate-400">lock</span>
        <p className="text-[10px] text-slate-400 uppercase tracking-[0.15em] font-mono">
          Secured by Ethereum Sepolia Testnet · All records immutable
        </p>
      </div>
    </div>
  );
}
