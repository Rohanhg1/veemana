import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MAP_VILLAGES } from '../data/realData';
import { useAuth } from '../context/AuthContext';

const createIcon = (color, shadow) => new L.DivIcon({
  className: 'custom-div-icon',
  html: `<span style="background-color:${color};width:18px;height:18px;display:block;left:-9px;top:-9px;position:relative;border-radius:50%;border:2.5px solid #fff;box-shadow:0 2px 6px ${shadow || color}88;" />`,
  iconSize: [18, 18],
});

const ICONS = {
  flagged: createIcon('#ef4444', '#ef4444'),
  pending: createIcon('#f59e0b', '#f59e0b'),
  verified: createIcon('#22c55e', '#22c55e')
};

export default function VillageMap() {
  const { activeDomain } = useAuth();
  const filteredVillages = MAP_VILLAGES.filter(v => v.domain === activeDomain);

  const handleExportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,Village Name,State,Domain,Status,Allocated,Received,Lat,Lng\n";
    filteredVillages.forEach(v => { csv += `"${v.name}","${v.state}","${v.domain}","${v.status}",${v.allocated},${v.received},${v.lat},${v.lng}\n`; });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `ClearLedger_GeoReport_${activeDomain}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const flaggedCount  = filteredVillages.filter(v => v.status === 'flagged').length;
  const pendingCount  = filteredVillages.filter(v => v.status === 'pending').length;
  const verifiedCount = filteredVillages.filter(v => v.status === 'verified').length;
  const totalAllocated = filteredVillages.reduce((a, c) => a + c.allocated, 0);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 130px)' }}>
      {/* Header */}
      <div className="flex justify-between items-end mb-5 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Geographic Audit Map</h2>
          <p className="text-sm text-slate-500 mt-1">Live monitoring of {activeDomain} fund deployments across India</p>
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
                <p className="text-3xl font-black text-slate-900">{filteredVillages.length}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Allocated</p>
                <p className="text-xl font-black text-blue-700 font-mono">
                  ₹ {(totalAllocated / 1000000).toFixed(2)}M
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-3">Status Breakdown</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      <span className="text-xs text-slate-600">Verified</span>
                    </div>
                    <span className="text-xs font-bold text-green-700">{verifiedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                      <span className="text-xs text-slate-600">Pending</span>
                    </div>
                    <span className="text-xs font-bold text-amber-700">{pendingCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
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
            {[['#22c55e', 'Verified'], ['#f59e0b', 'Pending'], ['#ef4444', 'Flagged']].map(([color, label]) => (
              <div key={label} className="flex items-center gap-2 mb-2 text-xs text-slate-600">
                <span className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }}></span>
                {label}
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
            {filteredVillages.map((village, idx) => (
              <Marker key={idx} position={[village.lat, village.lng]} icon={ICONS[village.status]}>
                <Popup>
                  <div className="p-1 min-w-[180px]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{
                        backgroundColor: village.status === 'flagged' ? '#ef4444' : village.status === 'pending' ? '#f59e0b' : '#22c55e'
                      }}></span>
                      <h4 className="font-bold text-sm text-slate-900">{village.name}, {village.state}</h4>
                    </div>
                    <div className="text-xs space-y-1.5">
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Domain</span>
                        <span className="font-bold text-slate-800">{village.domain}</span>
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
