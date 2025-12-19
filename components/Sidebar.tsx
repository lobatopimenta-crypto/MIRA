
import React, { useState, useMemo } from 'react';
import { DroneMedia } from '../types';

interface SidebarProps {
  mediaList: DroneMedia[];
  onSelect: (media: DroneMedia) => void;
  onDelete: (id: string) => void;
  selectedId?: string;
  filterText: string;
  setFilterText: (text: string) => void;
  filterYear: string;
  setFilterYear: (year: string) => void;
  filterMonth: string;
  setFilterMonth: (month: string) => void;
  onFilesDropped: (files: FileList) => void;
  onImportClick: () => void;
  isProcessing: boolean;
  gpsFilter: 'all' | 'ok' | 'missing';
  setGpsFilter: (status: 'all' | 'ok' | 'missing') => void;
}

const months = [
  { val: '01', label: 'Jan' }, { val: '02', label: 'Fev' },
  { val: '03', label: 'Mar' }, { val: '04', label: 'Abr' },
  { val: '05', label: 'Mai' }, { val: '06', label: 'Jun' },
  { val: '07', label: 'Jul' }, { val: '08', label: 'Ago' },
  { val: '09', label: 'Set' }, { val: '10', label: 'Out' },
  { val: '11', label: 'Nov' }, { val: '12', label: 'Dez' }
];

const Sidebar: React.FC<SidebarProps> = ({ 
  mediaList, 
  onSelect, 
  onDelete,
  selectedId,
  filterText,
  setFilterText,
  filterYear,
  setFilterYear,
  filterMonth,
  setFilterMonth,
  onFilesDropped,
  onImportClick,
  isProcessing,
  gpsFilter,
  setGpsFilter
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  
  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());

  // Totais baseados na lista filtrada (exceto o filtro de GPS atual para mostrar o contexto)
  const total = mediaList.length;
  const located = mediaList.filter(m => m.hasGps).length;
  const missingGps = mediaList.filter(m => !m.hasGps).length;

  const groupedMedia = useMemo(() => {
    const groups: Record<string, DroneMedia[]> = {};
    mediaList.forEach(item => {
      const folder = item.folder || 'Geral';
      if (!groups[folder]) groups[folder] = [];
      groups[folder].push(item);
    });
    return groups;
  }, [mediaList]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) onFilesDropped(e.dataTransfer.files);
  };

  const toggleFolder = (folder: string) => {
    setCollapsedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  return (
    <div className="w-80 bg-white border-r h-full flex flex-col shadow-2xl z-30 animate-in slide-in-from-left duration-700">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={onImportClick}
        className={`p-5 border-b cursor-pointer group transition-all duration-300 ${isDragging ? 'bg-blue-50 border-blue-400 border-dashed border-2' : 'bg-slate-50 hover:bg-white'}`}
      >
        <div className={`border-2 border-dashed rounded-[1.5rem] p-6 text-center transition-all duration-500 ${isDragging ? 'border-transparent scale-95' : 'border-slate-200 group-hover:border-blue-400 group-hover:shadow-lg'}`}>
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-500 ${isDragging ? 'bg-blue-500 text-white animate-bounce' : 'bg-white text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 shadow-sm'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-xs font-black text-slate-800 uppercase tracking-tight group-hover:text-blue-600 transition-colors">Importar Ativos</p>
            <p className="text-[9px] text-slate-400 mt-1 uppercase font-black tracking-widest opacity-60">Arraste ou clique para iniciar</p>
          </div>
        </div>
      </div>

      {/* Estatísticas Interativas para Filtro de GPS */}
      <div className="p-4 grid grid-cols-3 gap-2 border-b bg-white">
        <button 
          onClick={() => setGpsFilter('all')}
          className={`text-center p-2 rounded-xl border transition-all ${gpsFilter === 'all' ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-100' : 'border-transparent hover:bg-slate-50'}`}
        >
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1 opacity-60">Total</p>
          <p className={`text-xl font-black transition-colors ${gpsFilter === 'all' ? 'text-blue-600' : 'text-slate-800'}`}>{total}</p>
        </button>
        <button 
          onClick={() => setGpsFilter('ok')}
          className={`text-center border p-2 rounded-xl transition-all ${gpsFilter === 'ok' ? 'bg-emerald-50 border-emerald-200 shadow-sm ring-1 ring-emerald-100' : 'border-transparent hover:bg-slate-50'}`}
        >
          <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mb-1 opacity-60">GPS ON</p>
          <p className={`text-xl font-black transition-transform ${gpsFilter === 'ok' ? 'text-emerald-600 scale-110' : 'text-slate-800'}`}>{located}</p>
        </button>
        <button 
          onClick={() => setGpsFilter('missing')}
          className={`text-center border p-2 rounded-xl transition-all ${gpsFilter === 'missing' ? 'bg-orange-50 border-orange-200 shadow-sm ring-1 ring-orange-100' : 'border-transparent hover:bg-slate-50'}`}
        >
          <p className="text-[9px] text-orange-400 font-black uppercase tracking-widest mb-1 opacity-60">S/ GPS</p>
          <p className={`text-xl font-black transition-transform ${gpsFilter === 'missing' ? 'text-orange-500 scale-110' : 'text-slate-800'}`}>{missingGps}</p>
        </button>
      </div>

      <div className="p-4 border-b bg-slate-50/50 space-y-3">
        <input
          type="text"
          placeholder="Filtrar por nome..."
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm placeholder-slate-300"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <div className="flex gap-2">
          <select 
            className="flex-1 p-2 border border-slate-200 rounded-xl text-[10px] bg-white font-black uppercase shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">Ano</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select 
            className="flex-1 p-2 border border-slate-200 rounded-xl text-[10px] bg-white font-black uppercase shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="">Mês</option>
            {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
        {isProcessing && (
          <div className="p-6 flex flex-col items-center justify-center space-y-3 text-blue-500 bg-blue-50/30 animate-in fade-in">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Indexando Camadas...</span>
          </div>
        )}
        
        {Object.keys(groupedMedia).length === 0 && !isProcessing ? (
          <div className="p-16 text-center animate-in fade-in zoom-in duration-1000">
            <div className="text-slate-200 mb-4 flex justify-center">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">Vazio Operacional.<br/>Nenhum registro encontrado com estes filtros.</p>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            {(Object.entries(groupedMedia) as [string, DroneMedia[]][]).map(([folder, items]) => (
              <div key={folder} className="border-b last:border-b-0">
                <button 
                  onClick={() => toggleFolder(folder)}
                  className={`w-full flex items-center justify-between px-5 py-4 transition-all duration-300 ${collapsedFolders[folder] ? 'bg-slate-50' : 'bg-slate-100/50'}`}
                >
                  <div className="flex items-center space-x-3">
                    <svg className={`w-3.5 h-3.5 text-blue-600 transition-transform duration-500 ${collapsedFolders[folder] ? '-rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{folder}</span>
                  </div>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 shadow-sm">{items.length}</span>
                </button>
                
                {!collapsedFolders[folder] && (
                  <ul className="divide-y divide-slate-50">
                    {items.map((item) => (
                      <li 
                        key={item.id}
                        onClick={() => onSelect(item)}
                        className={`group p-4 flex items-start space-x-4 cursor-pointer transition-all duration-300 relative ${selectedId === item.id ? 'bg-blue-50/80 border-l-4 border-blue-600 shadow-inner' : 'hover:bg-slate-50/50'}`}
                      >
                        <div className={`w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 relative border shadow-sm transition-all duration-500 ${selectedId === item.id ? 'scale-105 shadow-blue-200' : 'group-hover:scale-105'}`}>
                          {item.type === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 relative">
                               <svg className="w-6 h-6 text-white/30" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                               <div className="absolute bottom-1 right-1 bg-red-600 text-[6px] text-white px-1 py-0.5 rounded font-black uppercase tracking-tighter">REC</div>
                            </div>
                          ) : (
                            <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center h-14">
                          <p className={`text-[11px] font-black truncate leading-none mb-1.5 transition-colors ${selectedId === item.id ? 'text-blue-700' : 'text-slate-800 group-hover:text-blue-600'}`}>{item.name}</p>
                          <div className="flex items-center space-x-3 mb-1.5">
                            <span className="text-[9px] text-slate-400 font-bold flex items-center uppercase tracking-tighter">
                              <svg className="w-3 h-3 mr-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              {item.timestamp ? item.timestamp.split(' ')[0].replace(/:/g, '/') : '---'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border transition-all duration-500 ${item.hasGps ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100 group-hover:bg-orange-100'}`}>
                              {item.hasGps ? 'GPS Ativo' : 'Sinal Offline'}
                            </span>
                          </div>
                        </div>
                        
                        <div className={`absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 ${selectedId === item.id ? 'opacity-100 translate-x-0' : 'translate-x-2'}`}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item.id);
                            }}
                            className="bg-white/90 hover:bg-red-50 text-slate-400 hover:text-red-500 p-2 rounded-xl shadow-lg border border-slate-100 transition-all active:scale-90"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
