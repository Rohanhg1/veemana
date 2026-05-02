import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, walletAddress, logout } = useAuth();
  const [networkOk, setNetworkOk] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_chainId' }).then(id => {
        setNetworkOk(id === '0xaa36a7');
      });
      window.ethereum.on('chainChanged', (id) => setNetworkOk(id === '0xaa36a7'));
    }
  }, []);

  const isActive = (path) => location.pathname === path;

  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  const navLink = (to, icon, label, exact = false) => {
    const active = exact ? location.pathname === to : location.pathname.startsWith(to);
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all duration-150 text-sm font-medium ${
          active
            ? 'bg-blue-50 text-blue-700 font-semibold'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
        }`}
      >
        <span className={`material-symbols-outlined text-[20px] ${active ? 'text-blue-600' : 'text-slate-400'}`}>
          {icon}
        </span>
        {label}
      </Link>
    );
  };

  return (
    <aside className="w-64 flex-shrink-0 h-screen bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="px-6 h-16 flex items-center border-b border-slate-200 flex-shrink-0">
        <div>
          <h1 className="text-base font-black text-slate-800 tracking-tight">ClearLedger</h1>
          <p className="text-[10px] text-blue-600 tracking-widest uppercase font-bold leading-tight">Institutional Node</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
        {navLink('/', 'dashboard', 'Dashboard', true)}

        {userRole === 'admin' && navLink('/admin/release', 'send_money', 'Fund Release')}
        {userRole === 'auditor' && navLink('/auditor/review', 'policy', 'Live Review Queue')}

        {navLink('/ledger', 'account_balance', 'Fund Ledger')}
        {navLink('/map', 'map', 'Village Map')}
        {navLink('/report', 'flag', 'Flag & Report')}

        {userRole === 'auditor' && navLink('/export', 'download', 'Audit Export')}

        {navLink('/verify', 'verified_user', 'Verify')}
      </nav>

      {/* Bottom: Wallet + Settings */}
      <div className="border-t border-slate-200 p-4 space-y-2 flex-shrink-0">
        {/* Wallet pill */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
          walletAddress
            ? networkOk ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
            : 'bg-slate-50 border border-slate-200'
        }`}>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
            walletAddress
              ? networkOk ? 'bg-green-500 animate-pulse' : 'bg-amber-500 animate-pulse'
              : 'bg-slate-400'
          }`} />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-none mb-0.5">Wallet</p>
            <p className={`font-mono truncate font-semibold ${
              walletAddress
                ? networkOk ? 'text-green-700' : 'text-amber-700'
                : 'text-slate-400'
            }`}>
              {walletAddress ? (networkOk ? shortAddr : 'Wrong Network') : 'Not Connected'}
            </p>
          </div>
          <span className={`material-symbols-outlined text-[16px] ml-auto ${
            walletAddress && networkOk ? 'text-green-600' : 'text-slate-300'
          }`}>
            {walletAddress && networkOk ? 'sensors' : 'sensors_off'}
          </span>
        </div>

        {/* Settings toggle */}
        <button
          onClick={() => setShowSettings(s => !s)}
          className="w-full flex items-center gap-2 py-2 px-3 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">settings</span>
          Settings
        </button>

        {showSettings && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Session Info</p>
            <div className="text-xs text-slate-600">
              <span className="text-slate-400">Role: </span>
              <span className="font-bold text-slate-800 capitalize">{userRole}</span>
            </div>
            {walletAddress && (
              <div className="text-xs text-slate-600">
                <span className="text-slate-400">Network: </span>
                <span className={`font-bold ${networkOk ? 'text-green-700' : 'text-amber-700'}`}>
                  {networkOk ? 'Sepolia ✓' : 'Wrong Network ⚠'}
                </span>
              </div>
            )}
            <button
              onClick={() => { logout?.(); navigate('/login'); }}
              className="w-full mt-1 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold py-2 px-3 rounded-lg border border-red-200 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[14px]">logout</span>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
