
import React, { useState, useMemo } from 'react';
import { DroneMedia } from '../types';

interface HistoryViewProps {
  mediaList: DroneMedia[];
  onSelect: (media: DroneMedia) => void;
  onDelete: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ mediaList, onSelect, onDelete, onDeleteMultiple }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [filterGps, setFilterGps] = useState<'all' | 'geolocated' | 'none'>('all');
  const [filterFolder, setFilterFolder] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasConfirmedCheckbox, setHasConfirmedCheckbox] = useState(false);

  const folders = useMemo(() => {
    const set = new Set<string>();
    mediaList.forEach(m => set.add(m.folder || 'Geral'));
    return Array.from(set);
  }, [mediaList]);

  const filteredItems = useMemo(() => {
    const items = mediaList.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || m.type === filterType;
      const matchesGps = filterGps === 'all' || (filterGps === 'geolocated' ? m.hasGps : !m.hasGps);
      const matchesFolder = filterFolder === 'all' || (m.folder || 'Geral') === filterFolder;
      
      let matchesDateFilter = true;
      if (filterDate && m.timestamp) {
          const mDate = m.timestamp.split(' ')[0].replace(/:/g, '-');
          matchesDateFilter = mDate === filterDate;
      }

      return matchesSearch && matchesType && matchesGps && matchesFolder && matchesDateFilter;
    });

    return items.sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || 0).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });
  }, [mediaList, searchTerm, filterType, filterGps, filterFolder, filterDate, sortOrder]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  const handleDeleteTrigger = () => {
    if (selectedIds.size === 0) return;
    setShowConfirmModal(true);
    setHasConfirmedCheckbox(false);
  };

  const executeBulkDelete = () => {
    if (hasConfirmedCheckbox) {
      onDeleteMultiple(Array.from(selectedIds));
      setSelectedIds(new Set());
      setShowConfirmModal(false);
    }
  };

  const downloadFile = (media: DroneMedia) => {
    const link = document.createElement('a');
    link.href = media.previewUrl;
    link.download = `${media.name}-${media.id.substring(0, 4)}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-y-auto relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
          <div className="flex items-center">
            <span className="text-3xl mr-4">📋</span>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Histórico</h2>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">Log completo de ativos geográficos</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
             <div className="bg-white px-5 py-2 rounded-2xl shadow-sm border border-gray-100">
               <span className="text-[10px] font-black text-slate-400 uppercase mr-3 tracking-widest">Base de Dados</span>
               <span className="text-xl font-black text-blue-600">{mediaList.length} itens</span>
             </div>
             {selectedIds.size > 0 && (
               <button 
                onClick={handleDeleteTrigger}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-900/20 transition-all transform active:scale-95"
               >
                 Excluir Selecionados ({selectedIds.size})
               </button>
             )}
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="flex flex-col">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Pesquisar</label>
            <input 
              type="text" 
              placeholder="Buscar..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Data Específica</label>
            <input 
              type="date" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Tipo de Dado</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="all">Todos os tipos</option>
              <option value="image">Foto</option>
              <option value="video">Vídeo</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Sinal GPS</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
              value={filterGps}
              onChange={(e) => setFilterGps(e.target.value as any)}
            >
              <option value="all">Sinal (Todos)</option>
              <option value="geolocated">Localizado</option>
              <option value="none">Offline</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Pasta</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
              value={filterFolder}
              onChange={(e) => setFilterFolder(e.target.value)}
            >
              <option value="all">Pastas (Todas)</option>
              {folders.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100">
                  <th className="px-6 py-4 w-10">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      checked={filteredItems.length > 0 && selectedIds.size === filteredItems.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Thumbnail</th>
                  <th 
                    className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest cursor-pointer hover:text-blue-600 transition-colors select-none"
                    onClick={toggleSort}
                  >
                    <div className="flex items-center">
                        Nome / Data
                        <svg className={`w-3 h-3 ml-2 transition-transform ${sortOrder === 'newest' ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Pasta</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Geoposicionamento</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Registro Completo</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center text-gray-400 font-medium italic font-black uppercase tracking-widest">
                      Nenhum ativo localizado
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((m) => (
                    <tr key={m.id} className={`hover:bg-blue-50/40 transition-colors group ${selectedIds.has(m.id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                          checked={selectedIds.has(m.id)}
                          onChange={() => toggleSelect(m.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-20 h-12 bg-slate-200 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative group-hover:scale-105 transition-transform duration-300">
                          {m.type === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800">
                               <svg className="w-5 h-5 text-white/40" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                            </div>
                          ) : (
                            <img src={m.previewUrl} className="w-full h-full object-cover" alt="" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-900 truncate max-w-[200px]">{m.name}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">REF: {m.id.substring(0,8)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                          <span className="text-[9px] font-black text-slate-600 uppercase bg-slate-100 px-3 py-1 rounded-full border border-slate-200">{m.folder || 'Geral'}</span>
                      </td>
                      <td className="px-6 py-4">
                        {m.hasGps ? (
                          <div className="flex flex-col">
                            <span className="text-[10px] font-mono font-black text-blue-600">{m.latitude?.toFixed(5)}, {m.longitude?.toFixed(5)}</span>
                            <span className="text-[8px] text-green-500 font-black uppercase tracking-widest flex items-center">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                              📍 Ativo Online
                            </span>
                          </div>
                        ) : (
                          <span className="text-[9px] text-orange-400 font-black uppercase tracking-tighter italic">⚠️ Sinal Offline</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black text-slate-600 uppercase">
                          {m.timestamp || '---'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <button 
                            onClick={() => onSelect(m)}
                            className="p-2 hover:bg-white rounded-xl text-blue-600 transition-all border border-transparent hover:border-blue-100 hover:shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          </button>
                          <button 
                            onClick={() => downloadFile(m)}
                            className="p-2 hover:bg-white rounded-xl text-slate-500 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                          </button>
                          <button 
                            onClick={() => onDelete(m.id)}
                            className="p-2 hover:bg-white rounded-xl text-slate-300 hover:text-red-600 transition-all border border-transparent"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl max-w-md w-full border border-red-100 flex flex-col items-center">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2 text-center">Protocolo de Exclusão</h3>
            <p className="text-sm text-slate-500 text-center mb-8 font-medium">Confirma a remoção permanente de <span className="font-black text-red-600">{selectedIds.size} ativos</span>?</p>
            
            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-8 flex items-center">
               <input 
                type="checkbox" 
                id="confirm-delete" 
                className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 mr-4"
                checked={hasConfirmedCheckbox}
                onChange={(e) => setHasConfirmedCheckbox(e.target.checked)}
               />
               <label htmlFor="confirm-delete" className="text-xs font-black text-slate-600 uppercase tracking-widest cursor-pointer">Sim, confirmo a exclusão definitiva</label>
            </div>

            <div className="grid grid-cols-2 w-full gap-4">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={executeBulkDelete}
                disabled={!hasConfirmedCheckbox}
                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${hasConfirmedCheckbox ? 'bg-red-600 text-white shadow-xl shadow-red-900/30 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                Executar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
