import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const DOMAINS = [
  { id: 'MGNREGA', label: 'Rural Employment (MGNREGA)', icon: 'agriculture' },
  { id: 'Healthcare', label: 'Healthcare (NHM)', icon: 'local_hospital' },
  { id: 'Agriculture', label: 'Agriculture (PM-KISAN)', icon: 'eco' },
  { id: 'Education', label: 'Education (Samagra Shiksha)', icon: 'school' }
];

export default function DomainFilter() {
  const { activeDomain, setActiveDomain } = useAuth();
  const location = useLocation();

  if (location.pathname === '/verify') return null;

  return (
    <div className="h-12 bg-white border-b border-slate-200 flex items-center px-6 gap-3 overflow-x-auto flex-shrink-0">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
        Scheme:
      </span>
      {DOMAINS.map((domain) => (
        <button
          key={domain.id}
          onClick={() => setActiveDomain(domain.id)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
            activeDomain === domain.id
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">{domain.icon}</span>
          {domain.label}
        </button>
      ))}
    </div>
  );
}
