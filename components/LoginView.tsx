
import React, { useState } from 'react';
import { TacticalLogo } from '../App';

interface LoginViewProps {
  onLogin: (user: string, pass: string) => void;
  totalFiles: number;
  imageCount: number;
  videoCount: number;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, totalFiles }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onLogin(username, password);
    } catch (e) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center overflow-hidden font-sans">
      {/* Background Decorativo Cyber */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="relative w-full max-w-lg px-6 z-10">
        <div className="flex flex-col items-center mb-12">
          <TacticalLogo size="40" pulsing={true} />
          <div className="mt-10 text-center">
            <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              M.I.R.A.<span className="text-blue-500 not-italic ml-2">PRO</span>
            </h1>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.25em] mt-6">MAPEAMENTO DE INTELIGÊNCIA E RECONHECIMENTO AÉREO</p>
            
            {/* O identificador ASINT foi removido do centro superior conforme solicitado */}
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Matrícula Operacional</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="seu login" 
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-sm font-black text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all uppercase" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Código de Acesso</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="sua senha" 
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-sm font-black text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all" 
              />
            </div>
            
            {error && <p className="text-red-500 text-[9px] font-black uppercase text-center animate-pulse">Acesso Negado: Verifique Credenciais</p>}

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-2xl transition-all border border-white/10 active:scale-95">
              Autenticar Operação
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center text-[8px] font-black text-slate-600 uppercase tracking-widest">
            <span>ATIVOS NA BASE: {totalFiles}</span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></span>
              ESTAÇÃO ONLINE
            </span>
          </div>
        </div>
        
        <p className="mt-16 text-center text-[9px] text-slate-800 font-black uppercase tracking-[0.6em]">ASINT / PMCE - TECNOLOGIA OPERACIONAL</p>
      </div>
    </div>
  );
};

export default LoginView;
