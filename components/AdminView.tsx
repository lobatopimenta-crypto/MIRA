
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface AdminViewProps {
  users: User[];
  onAddUser: (user: User) => void;
  onToggleUser: (id: string) => void;
  onDeleteUser: (id: string) => void;
}

const AdminView: React.FC<AdminViewProps> = ({ users, onAddUser, onToggleUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMatricula, setNewMatricula] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('OPERATOR');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser({
      id: Math.random().toString(36).substr(2, 9),
      name: newName.toUpperCase(),
      matricula: newMatricula.toLowerCase().trim(),
      password: newPassword.trim(),
      role: newRole,
      active: true
    });
    setIsModalOpen(false);
    setNewName('');
    setNewMatricula('');
    setNewPassword('');
    setNewRole('OPERATOR');
  };

  return (
    <div className="flex-1 w-full h-full bg-slate-950 p-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Gestão de <span className="text-blue-500">Efetivo</span></h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2">Controle Central de Operadores e Credenciais</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all border border-white/10"
          >
            Novo Operador
          </button>
        </header>

        <div className="bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5">
                <th className="p-8">Identificação / Matrícula</th>
                <th className="p-8">Cargo Tático</th>
                <th className="p-8">Status</th>
                <th className="p-8 text-right">Comando</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-8">
                     <div className="flex items-center">
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mr-6 border border-white/5 text-blue-400">
                           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        </div>
                        <div>
                           <p className="text-xs font-black text-white uppercase">{user.name}</p>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Matrícula: {user.matricula}</p>
                        </div>
                     </div>
                  </td>
                  <td className="p-8">
                     <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                        {user.role}
                     </span>
                  </td>
                  <td className="p-8">
                     <div className="flex items-center">
                        <span className={`w-2.5 h-2.5 rounded-full mr-3 ${user.active ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-red-500'}`}></span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${user.active ? 'text-emerald-500' : 'text-red-500'}`}>
                           {user.active ? 'Em Serviço' : 'Acesso Revogado'}
                        </span>
                     </div>
                  </td>
                  <td className="p-8 text-right">
                     <button onClick={() => onToggleUser(user.id)} className={`text-[9px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all ${user.active ? 'bg-slate-950 text-red-500 hover:bg-red-600 hover:text-white border border-red-500/30' : 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/20'}`}>
                        {user.active ? 'Revogar Acesso' : 'Autorizar'}
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[500] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="bg-slate-900 rounded-[3rem] p-12 max-w-md w-full border border-white/5 shadow-2xl animate-in zoom-in">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 text-center italic">Novo <span className="text-blue-500">Credenciamento</span></h3>
              <form onSubmit={handleAdd} className="space-y-6">
                 <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Nome Completo do Operador</label>
                    <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="NOME DO AGENTE" className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black text-white uppercase outline-none focus:ring-2 focus:ring-blue-600" />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Matrícula (Login)</label>
                       <input type="text" required value={newMatricula} onChange={e => setNewMatricula(e.target.value)} placeholder="login" className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black text-white lowercase outline-none focus:ring-2 focus:ring-blue-600" />
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Perfil Tático</label>
                       <select value={newRole} onChange={e => setNewRole(e.target.value as any)} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black text-white outline-none focus:ring-2 focus:ring-blue-600">
                          <option value="OPERATOR">OPERADOR</option>
                          <option value="ADMIN">GESTOR</option>
                       </select>
                    </div>
                 </div>

                 <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Código de Acesso (Senha)</label>
                    <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black text-white outline-none focus:ring-2 focus:ring-blue-600" />
                 </div>

                 <div className="flex space-x-4 pt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-slate-800 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancelar</button>
                    <button type="submit" className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/30">Autorizar Acesso</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
