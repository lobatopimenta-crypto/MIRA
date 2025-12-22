
import React from 'react';
import { User } from '../types';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  activeTab: string;
  onTabChange: (tab: any) => void;
  onLogout: () => void;
  isDarkMode: boolean;
}

const DrawerMenu: React.FC<DrawerMenuProps> = ({ isOpen, onClose, currentUser, activeTab, onTabChange, onLogout, isDarkMode }) => {
  const menuItems = [
    { id: 'map', label: 'Operações (Mapa)', icon: '🗺️', roles: ['ADMIN', 'OPERATOR', 'AUDITOR'] },
    { id: 'history', label: 'Log de Ativos', icon: '📋', roles: ['ADMIN', 'OPERATOR', 'AUDITOR'] },
    { id: 'reports', label: 'Relatórios de Missão', icon: '📊', roles: ['ADMIN', 'OPERATOR', 'AUDITOR'] },
    { id: 'admin', label: 'Gestão de Efetivo', icon: '🛡️', roles: ['ADMIN'] },
    { id: 'audit', label: 'Auditoria (Black Box)', icon: '💾', roles: ['ADMIN'] },
  ];

  const filteredItems = menuItems.filter(item => currentUser && item.roles.includes(currentUser.role));

  return (
    <>
      <div 
        className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      <div className={`fixed inset-y-0 left-0 z-[110] w-80 shadow-2xl transform transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
        <div className={`p-8 border-b flex items-center justify-between ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-blue-900/40">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
            </div>
            <h2 className="text-xl font-black tracking-tighter uppercase">Menu</h2>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/5 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className={`mb-8 p-4 rounded-[1.5rem] border transition-colors ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-[8px] font-black uppercase tracking-[0.3em] mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Operador Autenticado</p>
            <p className="text-sm font-black uppercase text-blue-500 truncate">{currentUser?.name}</p>
            <p className={`text-[10px] font-bold uppercase mt-0.5 tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{currentUser?.role === 'ADMIN' ? 'GESTOR' : 'OPERADOR'} - ASINT</p>
          </div>

          <nav className="space-y-2">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => { onTabChange(item.id); onClose(); }}
                className={`w-full flex items-center p-4 rounded-2xl transition-all border ${
                  activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40 border-blue-400' 
                  : (isDarkMode ? 'hover:bg-white/5 text-slate-400 hover:text-white border-transparent' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900 border-transparent')
                }`}
              >
                <span className="text-lg mr-4">{item.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className={`p-6 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
          {/* Identificador ASINT/PMCE Estilizado conforme solicitado */}
          <div className="mb-6 flex justify-center">
            <div className={`px-8 py-2.5 rounded-full border backdrop-blur-md shadow-lg flex items-center justify-center transition-all ${isDarkMode ? 'bg-slate-950/40 border-blue-500/20' : 'bg-slate-100/80 border-blue-500/20'}`}>
              <span className="text-lg font-black tracking-[0.2em] uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400 drop-shadow-sm">
                ASINT / PMCE
              </span>
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center p-4 rounded-2xl bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-600/30 group font-black text-[10px] uppercase tracking-[0.3em]"
          >
            <svg className="w-4 h-4 mr-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Encerrar Sessão
          </button>
          <p className={`text-[8px] text-center font-black uppercase tracking-[0.4em] mt-6 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Protocolo ASINT/PMCE 2025</p>
        </div>
      </div>
    </>
  );
};

export default DrawerMenu;
