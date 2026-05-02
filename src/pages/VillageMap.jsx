import React, { useMemo, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MAP_VILLAGES } from '../data/realData';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
// Real India geocode dataset: 4,425 cities/towns with lat/lng
// Source: GeoNames via github.com/lutangar/cities.json (filtered to IN)
import INDIA_GEOCODES from '../data/india_geocodes.json';

// ─── Build fast lookup map on first load ────────────────────────────────────
// key = lowercase city name → { lat, lng }
const GEOCODE_MAP = {};
for (const city of INDIA_GEOCODES) {
  const key = city.name.toLowerCase().trim();
  if (!GEOCODE_MAP[key]) {
    GEOCODE_MAP[key] = { lat: city.lat, lng: city.lng };
  }
}

// State-level fallback centroids
const STATE_COORDS = {
  'karnataka':      { lat: 15.3173, lng: 75.7139 },
  'bihar':          { lat: 25.0961, lng: 85.3131 },
  'punjab':         { lat: 31.1471, lng: 75.3412 },
  'maharashtra':    { lat: 19.7515, lng: 75.7139 },
  'rajasthan':      { lat: 27.0238, lng: 74.2179 },
  'uttar pradesh':  { lat: 26.8467, lng: 80.9462 },
  'tamil nadu':     { lat: 11.1271, lng: 78.6569 },
  'gujarat':        { lat: 22.2587, lng: 71.1924 },
  'madhya pradesh': { lat: 22.9734, lng: 78.6569 },
  'west bengal':    { lat: 22.9868, lng: 87.8550 },
  'andhra pradesh': { lat: 15.9129, lng: 79.7400 },
  'telangana':      { lat: 18.1124, lng: 79.0193 },
  'odisha':         { lat: 20.9517, lng: 85.0985 },
  'kerala':         { lat: 10.8505, lng: 76.2711 },
  'jharkhand':      { lat: 23.6102, lng: 85.2799 },
  'assam':          { lat: 26.2006, lng: 92.9376 },
  'haryana':        { lat: 29.0588, lng: 76.0856 },
  'uttarakhand':    { lat: 30.0668, lng: 79.0193 },
  'chhattisgarh':   { lat: 21.2787, lng: 81.8661 },
  'himachal pradesh':{ lat: 31.1048, lng: 77.1734 },
  'delhi':          { lat: 28.7041, lng: 77.1025 },
};

function lookupCoords(village, state) {
  // 1. Try exact city name match
  const cityKey = (village || '').toLowerCase().trim();
  if (cityKey && GEOCODE_MAP[cityKey]) return GEOCODE_MAP[cityKey];

  // 2. Try partial prefix match (e.g. "Kolar" matches "Kolar Gold Fields")
  if (cityKey.length > 3) {
    const match = Object.keys(GEOCODE_MAP).find(k => k.startsWith(cityKey) || cityKey.startsWith(k));
    if (match) return GEOCODE_MAP[match];
  }

  // 3. Fall back to state centroid
  const stateKey = (state || '').toLowerCase().trim();
  return STATE_COORDS[stateKey] || null;
}

// ─── Icon Factory ────────────────────────────────────────────────────────────
const createIcon = (color, shadow) => new L.DivIcon({
  className: 'custom-div-icon',
  html: `<span style="background-color:${color};width:18px;height:18px;display:block;left:-9px;top:-9px;position:relative;border-radius:50%;border:2.5px solid #fff;box-shadow:0 2px 8px ${shadow || color}99;" />`,
  iconSize: [18, 18],
});

const ICONS = {
  flagged:  createIcon('#ef4444', '#ef4444'),
  pending:  createIcon('#f59e0b', '#f59e0b'),
  approved: createIcon('#22c55e', '#22c55e'),
  verified: createIcon('#22c55e', '#22c55e'),
};

// ─── Status helpers ───────────────────────────────────────────────────────────
function txStatus(tx) {
  if (tx.flagged || tx.status === 'frozen')    return 'flagged';
  if (tx.status === 'approved' || Number(tx.signaturesReceived) > 0) return 'approved';
  return 'pending';
}

const STATUS_LABELS = {
  flagged:  { label: 'Flagged / Frozen', color: '#ef4444', textCls: 'text-red-600' },
  pending:  { label: 'Pending Auditor Approval', color: '#f59e0b', textCls: 'text-amber-600' },
  approved: { label: 'Auditor Approved',  color: '#22c55e', textCls: 'text-green-600' },
  verified: { label: 'Verified',           color: '#22c55e', textCls: 'text-green-600' },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function VillageMap() {
  const { activeDomain } = useAuth();
  const { transactions } = useTransactions();

  // Build live pin layer from transactions submitted by admin
  const liveVillages = useMemo(() => {
    return transactions
      .map(tx => {
        const coords = lookupCoords(tx.village || tx.toEntity, tx.state || tx.fromEntity);
        if (!coords) return null;
        return {
          name:      tx.village || tx.toEntity || 'Unknown',
          state:     tx.state   || tx.fromEntity || '',
          domain:    tx.domain  || tx.scheme || activeDomain,
          status:    txStatus(tx),
          allocated: Number(tx.amount) || 0,
          received:  txStatus(tx) === 'approved' ? Number(tx.amount) : 0,
          purpose:   tx.purpose || '',
          timestamp: tx.timestamp || '',
          isLive:    true,
          lat: coords.lat,
          lng: coords.lng,
        };
      })
      .filter(Boolean);
  }, [transactions, activeDomain]);

  // Merge: static data filtered by domain + all live transactions
  const staticFiltered = MAP_VILLAGES.filter(v => v.domain === activeDomain);
  const allVillages = [...staticFiltered, ...liveVillages.filter(v => v.domain === activeDomain)];

  const flaggedCount  = allVillages.filter(v => v.status === 'flagged').length;
  const pendingCount  = allVillages.filter(v => v.status === 'pending').length;
  const approvedCount = allVillages.filter(v => v.status === 'approved' || v.status === 'verified').length;
  const totalAllocated = allVillages.reduce((a, c) => a + (c.allocated || 0), 0);

  const handleExportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,Village Name,State,Domain,Status,Allocated,Received,Lat,Lng\n";
    allVillages.forEach(v => {
      csv += `"${v.name}","${v.state}","${v.domain}","${v.status}",${v.allocated},${v.received},${v.lat},${v.lng}\n`;
    });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `ClearLedger_GeoReport_${activeDomain}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 130px)' }}>
      {/* Header */}
      <div className="flex justify-between items-end mb-5 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Geographic Audit Map</h2>
          <p className="text-sm text-slate-500 mt-1">
            Live monitoring of <strong>{activeDomain}</strong> fund deployments —&nbsp;
            <span className="text-amber-600 font-semibold">{liveVillages.filter(v => v.domain === activeDomain).length} live pins</span> from submitted transactions
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Geographic Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 flex-1 min-h-0">
        {/* Stats sidebar */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5 pb-3 border-b border-slate-100">
              {activeDomain} Statistics
            </h3>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Villages Mapped</p>
                <p className="text-3xl font-black text-slate-900">{allVillages.length}</p>
                {liveVillages.filter(v => v.domain === activeDomain).length > 0 && (
                  <p className="text-[10px] text-amber-600 font-bold mt-0.5">
                    +{liveVillages.filter(v => v.domain === activeDomain).length} from live submissions
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Allocated</p>
                <p className="text-xl font-black text-blue-700 font-mono">
                  ₹ {Number(totalAllocated).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-3">Status Breakdown</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-xs text-slate-600">Approved / Verified</span>
                    </div>
                    <span className="text-xs font-bold text-green-700">{approvedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="text-xs text-slate-600">Pending Auditor</span>
                    </div>
                    <span className="text-xs font-bold text-amber-700">{pendingCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-xs text-slate-600">Flagged</span>
                    </div>
                    <span className="text-xs font-bold text-red-700">{flaggedCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex-shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Map Legend</p>
            {[
              ['#22c55e', 'Approved / Verified', 'Auditor has signed'],
              ['#f59e0b', 'Pending', 'Awaiting auditor signature'],
              ['#ef4444', 'Flagged / Frozen', 'Suspicious — frozen'],
            ].map(([color, label, desc]) => (
              <div key={label} className="flex items-start gap-2 mb-3">
                <span className="w-3 h-3 rounded-full border-2 border-white shadow-sm mt-0.5 flex-shrink-0"
                  style={{ backgroundColor: color }} />
                <div>
                  <p className="text-xs font-bold text-slate-700">{label}</p>
                  <p className="text-[10px] text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="md:col-span-3 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0" style={{ minHeight: 400 }}>
          <MapContainer
            center={[21.1458, 79.0882]}
            zoom={5}
            style={{ height: "100%", width: "100%", minHeight: 400 }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {allVillages.map((village, idx) => (
              <Marker
                key={`${village.name}-${idx}`}
                position={[village.lat, village.lng]}
                icon={ICONS[village.status] || ICONS.pending}
              >
                <Popup>
                  <div className="p-1 min-w-[200px]">
                    {/* Status header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: STATUS_LABELS[village.status]?.color || '#f59e0b' }} />
                      <h4 className="font-bold text-sm text-slate-900">{village.name}, {village.state}</h4>
                    </div>

                    {/* Live badge */}
                    {village.isLive && (
                      <span className="inline-block text-[9px] font-bold uppercase bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full mb-2">
                        ● Live Transaction
                      </span>
                    )}

                    <div className="text-xs space-y-1.5">
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Domain</span>
                        <span className="font-bold text-slate-800">{village.domain}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Status</span>
                        <span className={`font-bold uppercase text-[10px] ${STATUS_LABELS[village.status]?.textCls}`}>
                          {STATUS_LABELS[village.status]?.label || village.status}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Allocated</span>
                        <span className="font-bold text-slate-800">₹{Number(village.allocated).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Received</span>
                        <span className={`font-bold ${village.received < village.allocated ? 'text-red-600' : 'text-green-600'}`}>
                          ₹{Number(village.received).toLocaleString('en-IN')}
                        </span>
                      </div>
                      {village.purpose && (
                        <div className="flex justify-between border-t border-slate-100 pt-1">
                          <span className="text-slate-500">Purpose</span>
                          <span className="font-medium text-slate-700 max-w-[120px] text-right">{village.purpose}</span>
                        </div>
                      )}
                      {village.timestamp && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Submitted</span>
                          <span className="text-slate-600">{village.timestamp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
