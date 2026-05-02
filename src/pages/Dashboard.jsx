import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { REAL_DATA } from '../data/realData';

// Reusable stat card
function StatCard({ label, value, sub, icon, accent = 'blue' }) {
  const accents = {
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   val: 'text-blue-700'   },
    green:  { bg: 'bg-green-50',  icon: 'text-green-600',  val: 'text-green-700'  },
    red:    { bg: 'bg-red-50',    icon: 'text-red-600',    val: 'text-red-700'    },
    amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',  val: 'text-amber-700'  },
    slate:  { bg: 'bg-slate-50',  icon: 'text-slate-500',  val: 'text-slate-800'  },
  };
  const c = accents[accent] || accents.blue;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <div className={`p-2 rounded-lg ${c.bg}`}>
          <span className={`material-symbols-outlined text-[18px] ${c.icon}`}>{icon}</span>
        </div>
      </div>
      <p className={`text-3xl font-black ${c.val}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { userRole, activeDomain } = useAuth();
  const { transactions } = useTransactions();
  const navigate = useNavigate();

  const domainData = REAL_DATA.schemes[activeDomain];

  const pendingTxs  = transactions.filter(t => t.status === 'pending');
  const approvedTxs = transactions.filter(t => t.status === 'approved');
  const flaggedTxs  = transactions.filter(t => t.status === 'frozen' || t.status === 'flagged');
  const totalAmount = transactions.reduce((a, b) => a + Number(b.amount || 0), 0);

  const stateData = Object.entries(domainData.states).map(([state, flaggedAmount]) => ({
    name: state.replace(/([A-Z])/g, ' $1').trim(),
    flagged: flaggedAmount
  }));

  const utilData = [
    { name: 'Utilised', value: domainData.utilisation },
    { name: 'Pending/Gap', value: parseFloat((100 - domainData.utilisation).toFixed(1)) }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {userRole === 'admin' ? 'Fund Release & Scaling Hub'
              : userRole === 'auditor' ? 'Live AI Audit Dashboard'
              : 'Institutional Data Hub'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {userRole === 'admin' ? 'Manage domain deployments and track pending approvals.'
              : userRole === 'auditor' ? 'Monitor high-risk alerts and review pending queue.'
              : 'Overview of public fund disbursements and blockchain integrity.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scheme:</span>
          <span className="text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            {activeDomain}
          </span>
          <span className="text-[10px] text-slate-400 ml-2">Source: {domainData.source}</span>
        </div>
      </div>

      {/* Action button */}
      {userRole === 'admin' && (
        <div className="flex">
          <button
            onClick={() => navigate('/admin/release')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">send_money</span>
            Release New Fund Transfer
          </button>
        </div>
      )}
      {userRole === 'auditor' && (
        <div className="flex">
          <button
            onClick={() => navigate('/auditor/review')}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">policy</span>
            Review Pending Queue ({pendingTxs.length})
          </button>
        </div>
      )}

      {/* ── ADMIN metric cards ── */}
      {userRole === 'admin' && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Released (Session)"
            value={`₹${(totalAmount / 100000).toFixed(1)}L`}
            icon="payments"
            accent="blue"
          />
          <StatCard
            label="Pending Approvals"
            value={pendingTxs.length}
            icon="hourglass_top"
            accent="amber"
            sub="Awaiting auditor sign-off"
          />
          <StatCard
            label="Approved Transfers"
            value={approvedTxs.length}
            icon="task_alt"
            accent="green"
          />
          <StatCard
            label="Flagged by Auditors"
            value={flaggedTxs.length}
            icon="gavel"
            accent="red"
          />
        </div>
      )}

      {/* ── AUDITOR metric cards ── */}
      {userRole === 'auditor' && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="High Risk Alerts (Score > 70)"
            value={pendingTxs.filter(t => t.aiScore > 70).length}
            icon="warning"
            accent="red"
          />
          <StatCard
            label="Total Pending Review"
            value={pendingTxs.length}
            icon="pending_actions"
            accent="amber"
          />
          <StatCard
            label="Session Approved"
            value={approvedTxs.length}
            icon="verified"
            accent="green"
          />
          <StatCard
            label="Session Flagged"
            value={flaggedTxs.length}
            icon="lock"
            accent="red"
          />
        </div>
      )}

      {/* ── CITIZEN metric cards ── */}
      {userRole === 'citizen' && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Allocated (FY 2023-24)"
            value={`₹${Number(domainData.allocated).toLocaleString('en-IN')} Cr`}
            icon="payments"
            accent="blue"
            sub="CAG Budget Report"
          />
          <StatCard
            label="Reached Ground"
            value={`₹${Number(domainData.reached).toLocaleString('en-IN')} Cr`}
            icon="account_tree"
            accent="green"
            sub={`${domainData.utilisation}% utilisation`}
          />
          <StatCard
            label="Flagged Leakage"
            value={`₹${Number(domainData.flagged).toLocaleString('en-IN')} Cr`}
            icon="gavel"
            accent="red"
          />
          <StatCard
            label="Live Pending"
            value={pendingTxs.length}
            icon="pending_actions"
            accent="amber"
          />
        </div>
      )}

      {/* ── Auditor priority queue preview ── */}
      {userRole === 'auditor' && pendingTxs.length > 0 && (
        <div className="bg-white border border-red-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-red-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              High Priority Reviews
            </h3>
            <button
              onClick={() => navigate('/auditor/review')}
              className="text-xs font-bold text-red-600 hover:text-red-800 underline underline-offset-2"
            >
              View all →
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingTxs.sort((a, b) => b.aiScore - a.aiScore).slice(0, 3).map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{tx.village || tx.toEntity}, {tx.state}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    AI Score: <span className={`font-bold ${tx.aiScore > 70 ? 'text-red-600' : 'text-amber-600'}`}>{tx.aiScore}/100</span>
                    {' '}· ₹{Number(tx.amount).toLocaleString('en-IN')}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/auditor/review')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  Review Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Admin recent transactions ── */}
      {userRole === 'admin' && transactions.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Recent Transactions You Submitted</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {transactions.slice(0, 3).map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{tx.village || tx.toEntity}, {tx.state}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{tx.domain} · ₹{Number(tx.amount).toLocaleString('en-IN')}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  tx.status === 'pending'  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : tx.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {tx.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h4 className="text-sm font-bold text-slate-800 mb-1">State-wise Misappropriation Analysis</h4>
          <p className="text-xs text-slate-500 mb-6">Flagged funds distribution across heavily audited states</p>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}Cr`} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#1e293b', fontSize: 12 }}
                  formatter={(value) => [`₹${value} Cr`, 'Flagged']}
                />
                <Bar dataKey="flagged" radius={[4, 4, 0, 0]} name="Flagged Amount">
                  {stateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.flagged > 100 ? '#ef4444' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h4 className="text-sm font-bold text-slate-800 mb-1">National Utilisation</h4>
          <p className="text-xs text-slate-500 mb-2">Allocated vs Reached</p>
          <div className="relative" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={utilData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#e2e8f0" />
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#1e293b', fontSize: 12 }}
                  formatter={(value) => [`${value}%`]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-800">{domainData.utilisation}%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Utilised</span>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-slate-600">Reached Ground</span>
              </div>
              <span className="font-bold text-slate-800">₹{Number(domainData.reached).toLocaleString('en-IN')} Cr</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                <span className="text-slate-600">Fund Gap</span>
              </div>
              <span className="font-bold text-red-600">
                ₹{Number(domainData.allocated - domainData.reached).toLocaleString('en-IN')} Cr
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
