
import React, { useMemo } from 'react';
import { DroneMedia } from '../types';

interface SidebarProps {
  mediaList: DroneMedia[];
  onSelect: (media: DroneMedia) => void;
  onDelete: (media: DroneMedia) => void;
  onAnalyze: (media: DroneMedia) => void;
  onBulkDelete: (ids: string[]) => void;
  selectedId?: string;
  filterText: string;
  setFilterText: (text: string) => void;
  gpsFilter: 'all' | 'ok' | 'missing';
  setGpsFilter: (status: 'all' | 'ok' | 'missing') => void;
  isOpen: boolean;
  onToggle: () => void;
  onFilesSelected: (files: FileList | File[]) => void;
  isDarkMode: boolean;
  stats: { total: number; images: number; videos: number; noGps: number };
  checkedIds: string[];
  onToggleCheck: (id: string) => void;
  onToggleSelectAll: (ids: string[]) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  mediaList, 
  onSelect, 
  onAnalyze,
  onBulkDelete,
  selectedId,
  filterText,
  setFilterText,
  gpsFilter,
  setGpsFilter,
  isOpen,
  onToggle,
  onFilesSelected,
  isDarkMode,
  stats,
  checkedIds,
  onToggleCheck,
  onToggleSelectAll
}) => {
  const filteredList = useMemo(() => {
    return mediaList.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(filterText.toLowerCase());
      const matchesGps = gpsFilter === 'all' || (gpsFilter === 'ok' ? m.hasGps : !m.hasGps);
      return matchesSearch && matchesGps;
    });
  }, [mediaList, filterText, gpsFilter]);

  const allFilteredIds = filteredList.map(m => m.id);
  const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => checkedIds.includes(id));

  return (
    <div className={`relative border-r h-full flex flex-col shadow-2xl z-30 transition-all duration-500 ${isOpen ? 'w-80' : 'w-0'} ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}`}>
      <button onClick={onToggle} className={`absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-12 border shadow-xl rounded-r-xl flex items-center justify-center z-50 transition-colors group ${isDarkMode ? 'bg-slate-900 border-white/5 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
        <svg className={`w-4 h-4 transition-transform ${isDarkMode ? 'text-slate-500 group-hover:text-blue-400' : 'text-slate-400 group-hover:text-blue-600'} ${isOpen ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
      </button>

      <div className={`flex flex-col h-full overflow-hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`p-5 border-b transition-colors ${isDarkMode ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex justify-between items-center mb-3">
            <h2 className={`text-[9px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Gestão de Inventário</h2>
            {checkedIds.length > 0 && (
              <button 
                onClick={() => onBulkDelete(checkedIds)}
                className="bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-red-500/20 transition-all"
              >
                Deletar ({checkedIds.length})
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
             <div className={`p-2 rounded-xl border flex flex-col items-center ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                <span className={`text-[6px] font-black uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Geral</span>
                <span className="text-xs font-black text-blue-500">{stats.total}</span>
             </div>
             <div className={`p-2 rounded-xl border flex flex-col items-center ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                <span className={`text-[6px] font-black uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>S/GPS</span>
                <span className={`text-xs font-black ${stats.noGps > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>{stats.noGps}</span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div 
              tabIndex={0}
              onClick={() => (document.getElementById('sidebar-file-input') as any)?.click()}
              className={`group border-2 border-dashed rounded-2xl p-3 transition-all hover:border-blue-500 hover:bg-blue-50/10 cursor-pointer flex flex-col items-center justify-center outline-none focus:ring-2 focus:ring-blue-500/50 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}
            >
              <div className="text-lg mb-1">📄</div>
              <p className={`text-[8px] font-black uppercase text-center leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Arquivos</p>
              <input type="file" id="sidebar-file-input" multiple className="hidden" onChange={(e) => e.target.files && onFilesSelected(e.target.files)} />
            </div>

            <div 
              tabIndex={0}
              onClick={() => (document.getElementById('sidebar-folder-input') as any)?.click()}
              className={`group border-2 border-dashed rounded-2xl p-3 transition-all hover:border-blue-500 hover:bg-blue-50/10 cursor-pointer flex flex-col items-center justify-center outline-none focus:ring-2 focus:ring-blue-500/50 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}
            >
              <div className="text-lg mb-1">📁</div>
              <p className={`text-[8px] font-black uppercase text-center leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Pasta</p>
              <input 
                type="file" 
                id="sidebar-folder-input" 
                // @ts-ignore
                webkitdirectory="" 
                directory="" 
                multiple 
                className="hidden" 
                onChange={(e) => e.target.files && onFilesSelected(e.target.files)} 
              />
            </div>
          </div>
          <p className={`text-[7px] font-bold uppercase text-center mt-2 opacity-50 tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Dica: CTRL+V para colar mídia</p>
        </div>

        <div className={`p-4 border-b space-y-3 shrink-0 transition-colors ${isDarkMode ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex space-x-1">
            {['all', 'ok', 'missing'].map((s) => (
              <button key={s} onClick={() => setGpsFilter(s as any)} className={`flex-1 py-2 rounded-xl border text-[8px] font-black uppercase transition-all ${gpsFilter === s ? 'bg-blue-600 text-white border-blue-600 shadow-md' : (isDarkMode ? 'bg-white/5 border-white/5 text-slate-500' : 'bg-white border-slate-200 text-slate-400')}`}>
                {s === 'all' ? 'Ver' : s === 'ok' ? 'GPS' : 'S/GPS'}
              </button>
            ))}
          </div>
          <div className="relative">
            <input type="text" placeholder="Filtrar Ativo..." className={`w-full px-4 py-2.5 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`} value={filterText} onChange={(e) => setFilterText(e.target.value)} />
          </div>
          <div className="flex items-center px-1">
            <input 
              type="checkbox" 
              id="select-all-sidebar"
              checked={isAllSelected}
              onChange={() => onToggleSelectAll(allFilteredIds)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
            />
            <label htmlFor="select-all-sidebar" className={`ml-3 text-[9px] font-black uppercase cursor-pointer ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Selecionar Filtrados ({filteredList.length})
            </label>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto custom-scrollbar ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
          <ul className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-slate-100'}`}>
            {filteredList.map(item => (
              <li key={item.id} className={`p-4 flex items-center space-x-4 transition-all group ${selectedId === item.id ? (isDarkMode ? 'bg-blue-600/20' : 'bg-blue-50') : (isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50')}`}>
                <input 
                  type="checkbox" 
                  checked={checkedIds.includes(item.id)}
                  onChange={() => onToggleCheck(item.id)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className={`w-14 h-10 rounded-xl overflow-hidden border shadow-sm flex-shrink-0 cursor-pointer ${isDarkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-200 border-slate-300'}`} onClick={() => onSelect(item)}>
                  <img src={item.previewUrl} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelect(item)}>
                  <p className={`text-[10px] font-black truncate uppercase tracking-tighter ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{item.name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {item.hasGps && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>}
                    <p className={`text-[7px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{item.timestamp}</p>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onAnalyze(item); }} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-white/5 text-slate-500 hover:bg-blue-600 hover:text-white' : 'bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white'}`}>
                   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                </button>
              </li>
            ))}
            {filteredList.length === 0 && (
              <li className="p-12 text-center">
                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Nenhum ativo encontrado</p>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
