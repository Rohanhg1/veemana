import { useState } from 'react';
import { connectWallet } from '../utils/contract';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const [wallet, setWallet] = useState(null);
  const { userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      const data = await connectWallet();
      if (data) setWallet(data.address);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout?.();
    navigate('/login');
  };

  const roleIcon = userRole === 'admin'
    ? 'admin_panel_settings'
    : userRole === 'auditor'
    ? 'policy'
    : 'public';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-40">
      {/* Search */}
      <div className="relative w-80">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
          search
        </span>
        <input
          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400 outline-none transition-all"
          placeholder="Search Transaction Hash or Scheme ID..."
          type="text"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* NODE ONLINE badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
          <div className="h-2 w-2 rounded-full bg-green-500 pulse-dot" />
          <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider">Node Online</span>
        </div>

        {/* Role badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
          <span className="material-symbols-outlined text-[16px] text-blue-600">{roleIcon}</span>
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
            {userRole || 'unknown'}
          </span>
        </div>

        {/* Wallet connect */}
        <button
          onClick={handleConnect}
          title="Connect MetaMask"
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
          {wallet && (
            <span className="text-xs font-bold text-blue-600 font-mono">
              {wallet.slice(0, 6)}...{wallet.slice(-4)}
            </span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
        </button>

        {/* Avatar */}
        <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-slate-200">
          <img
            alt="User Profile"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-mBh76YKRBCke1D3Z_2upq_1Glh_y2Wl_nQKWELrp712KLjb86wRX7Bu1M3NCXaMDShiFN5X9P_ZIoeYEKrrmEn-U4nh9BW1-ptRtN2LtmrggYg1zSN4nDoeNfV352N3Yp2dhn8WBIDv3jrTNPbq895VwI8dJ_WNPgqlmBopKboWgUoatdKTU8XTJ2x7N6Wv_HOO-nFr3hhkMPmAJf8HVv8RoPoY2SSJR7vfOCH98DhrWQE4bcX2jDDYEvAfGwiFHx0F1SzNzwmo"
          />
        </div>
      </div>
    </header>
  );
}
