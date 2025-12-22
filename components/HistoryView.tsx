
import React, { useState, useMemo } from 'react';
import { DroneMedia } from '../types';

interface HistoryViewProps {
  mediaList: DroneMedia[];
  onSelect: (media: DroneMedia) => void;
  onDelete: (id: string) => void;
  isDarkMode: boolean;
}

const HistoryView: React.FC<HistoryViewProps> = ({ mediaList, onSelect, onDelete, isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [filterGps, setFilterGps] = useState<'all' | 'geolocated' | 'none'>('all');

  const filteredItems = useMemo(() => {
    return mediaList.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || m.type === filterType;
      const matchesGps = filterGps === 'all' || (filterGps === 'geolocated' ? m.hasGps : !m.hasGps);
      return matchesSearch && matchesType && matchesGps;
    }).sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
  }, [mediaList, searchTerm, filterType, filterGps]);

  return (
    <div className={`flex-1 w-full h-full p-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-500 transition-colors ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto">
        <header className={`flex justify-between items-end mb-10 border-b pb-8 transition-colors ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
          <div>
            <h2 className={`text-3xl font-black tracking-tighter uppercase italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Log de Ativos <span className="text-blue-500">Táticos</span></h2>
            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mt-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Repositório Central de Inteligência Geográfica</p>
          </div>
          <div className={`border px-6 py-3 rounded-2xl flex items-center space-x-4 transition-colors ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}`}>
             <span className={`text-[10px] font-black uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Base: <span className="text-blue-500">{mediaList.length}</span></span>
             <span className={`${isDarkMode ? 'text-slate-700' : 'text-slate-200'}`}>|</span>
             <span className={`text-[10px] font-black uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>GPS Sync: <span className="text-emerald-500">{mediaList.filter(m => m.hasGps).length}</span></span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <input 
            type="text" 
            placeholder="PESQUISAR ATIVO..." 
            className={`border rounded-xl px-6 py-4 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className={`border rounded-xl px-6 py-4 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="all">TODOS OS TIPOS</option>
            <option value="image">📸 FOTOGRAFIAS</option>
            <option value="video">🎥 VÍDEOS</option>
          </select>
          <select 
            className={`border rounded-xl px-6 py-4 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            value={filterGps}
            onChange={(e) => setFilterGps(e.target.value as any)}
          >
            <option value="all">SINAL (GERAL)</option>
            <option value="geolocated">ONLINE (GPS OK)</option>
            <option value="none">OFFLINE (SEM GPS)</option>
          </select>
        </div>

        <div className={`rounded-[2.5rem] border overflow-hidden shadow-2xl transition-colors ${isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200'}`}>
          <table className="w-full text-left">
            <thead>
              <tr className={`text-[9px] font-black uppercase tracking-widest border-b ${isDarkMode ? 'bg-slate-950 text-slate-500 border-white/5' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                <th className="p-6">Thumbnail</th>
                <th className="p-6">Identificação / Timestamp</th>
                <th className="p-6">Coordenadas</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Ação Analítica</th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-white/5' : 'divide-slate-100'}`}>
              {filteredItems.map(item => (
                <tr key={item.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                  <td className="p-6">
                    <div className={`w-20 h-12 rounded-lg overflow-hidden border group-hover:scale-105 transition-transform cursor-pointer ${isDarkMode ? 'bg-black border-white/10' : 'bg-slate-200 border-slate-300'}`} onClick={() => onSelect(item)}>
                      <img src={item.previewUrl} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="p-6">
                    <p className={`text-[11px] font-black uppercase truncate max-w-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</p>
                    <p className={`text-[9px] font-bold uppercase mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{item.timestamp}</p>
                  </td>
                  <td className="p-6">
                    {item.hasGps ? (
                      <span className="text-[10px] font-mono text-blue-500 font-bold">{item.latitude?.toFixed(5)} (Y), {item.longitude?.toFixed(5)} (X)</span>
                    ) : (
                      <span className="text-[9px] font-black text-orange-500/50 uppercase italic">Offline</span>
                    )}
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${item.hasGps ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : (isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400')}`}>
                      {item.hasGps ? '● Sincronizado' : '○ Pendente'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => onSelect(item)} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${isDarkMode ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white' : 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                        <span>Análise</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
