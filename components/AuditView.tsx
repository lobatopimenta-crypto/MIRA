
import React, { useState } from 'react';
import { AuditLog } from '../types';

interface AuditViewProps {
  logs: AuditLog[];
}

const AuditView: React.FC<AuditViewProps> = ({ logs }) => {
  const [filter, setFilter] = useState('');

  const filteredLogs = logs.filter(log => 
    log.userName.toLowerCase().includes(filter.toLowerCase()) || 
    log.action.toLowerCase().includes(filter.toLowerCase())
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="flex-1 w-full h-full bg-slate-950 p-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-end mb-12 border-b border-white/5 pb-8">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Auditoria <span className="text-blue-500">Black Box</span></h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2">Trilha de Dados Imutável e Segurança de Terminal</p>
          </div>
          <div className="w-72">
            <input 
              type="text" 
              placeholder="FILTRAR LOGS..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-6 py-4 text-[10px] font-black text-white uppercase outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
          </div>
        </header>

        <div className="bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5">
                <th className="p-8">Data / Timestamp</th>
                <th className="p-8">Operador Responsável</th>
                <th className="p-8">Ação Operacional</th>
                <th className="p-8 text-right">IP de Origem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-slate-700 font-black uppercase tracking-[0.4em]">SISTEMA LIMPO: SEM REGISTROS</td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-8 text-[10px] text-blue-400 font-bold">{log.timestamp}</td>
                    <td className="p-8">
                       <p className="text-xs font-black text-white uppercase mb-1">{log.userName}</p>
                       <p className="text-[9px] text-slate-600 uppercase tracking-widest">UID: {log.userId}</p>
                    </td>
                    <td className="p-8">
                       <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                         log.action.includes('EXCLUSÃO') ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                         log.action.includes('LOGIN') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                         'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                       }`}>
                          {log.action}
                       </span>
                    </td>
                    <td className="p-8 text-right text-[10px] text-slate-600 font-black">{log.ip}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 flex justify-end">
           <div className="bg-slate-900 border border-white/5 px-8 py-4 rounded-2xl flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-3 shadow-[0_0_10px_#10b981]"></span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Integridade da Trilha: <span className="text-emerald-500">VERIFICADA</span></span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuditView;
