
import React, { useState } from 'react';

interface LoginViewProps {
  onLogin: (user: string, pass: string) => void;
  totalFiles: number;
  imageCount: number;
  videoCount: number;
}

const TacticalLogo = ({ size = "24", pulsing = false }: { size?: string, pulsing?: boolean }) => (
  <div className={`relative flex items-center justify-center ${pulsing ? 'animate-pulse' : ''}`} style={{ width: `${parseInt(size) * 4}px`, height: `${parseInt(size) * 4}px` }}>
    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="#1e293b" strokeWidth="2" />
      <circle cx="50" cy="50" r="38" stroke="#334155" strokeWidth="1" />
      <path d="M50 20 L76 35 L76 65 L50 80 L24 65 L24 35 Z" fill="#0ea5e9" fillOpacity="0.1" stroke="#0ea5e9" strokeWidth="0.5" />
      <path d="M50 30 L67 40 L67 60 L50 70 L33 60 L33 40 Z" stroke="#0ea5e9" strokeWidth="0.5" />
      <line x1="50" y1="5" x2="50" y2="25" stroke="#0ea5e9" strokeWidth="2" />
      <line x1="50" y1="75" x2="50" y2="95" stroke="#0ea5e9" strokeWidth="2" />
      <line x1="5" y1="50" x2="25" y2="50" stroke="#0ea5e9" strokeWidth="2" />
      <line x1="75" y1="50" x2="95" y2="50" stroke="#0ea5e9" strokeWidth="2" />
      <circle cx="50" cy="50" r="5" stroke="#0ea5e9" strokeWidth="1" />
    </svg>
  </div>
);

const LoginView: React.FC<LoginViewProps> = ({ onLogin, totalFiles, imageCount, videoCount }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      onLogin(username, password);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900 rounded-full blur-[150px]"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>

      <div className="relative w-full max-w-md px-6 animate-in fade-in zoom-in duration-700">
        {/* Header Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <TacticalLogo size="24" pulsing={true} />
          <div className="mt-6 text-center">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
              M.I.R.A.<span className="text-blue-500 ml-1">PRO</span>
            </h1>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em] mt-3">
              Mapeamento de Inteligência e Reconhecimento Aéreo
            </p>
            <div className="mt-6 inline-flex items-center px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/5">
               <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">ASINT / PMCE</span>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-slate-900/50 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Identificação de Operador</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="NOME DE USUÁRIO"
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-700"
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Chave de Acesso</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-700"
              />
            </div>
            
            {error && (
              <div className="text-center py-2 animate-bounce">
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Credenciais Inválidas</span>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center space-x-3"
            >
              <span>Acessar Terminal</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center space-y-4">
            <button className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-400 transition-colors">Esqueci minha chave</button>
            <div className="h-px w-12 bg-white/5"></div>
            <button className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-colors">Falar com suporte técnico</button>
          </div>
        </div>

        {/* Sync Counter on Login Screen */}
        {totalFiles > 0 && (
          <div className="mt-12 flex justify-center">
            <div className="bg-slate-900/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/5 flex items-center space-x-6">
              <div className="flex flex-col items-center">
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Estação Sync</span>
                <span className="text-lg font-black text-blue-400 leading-none mt-1">{totalFiles}</span>
              </div>
              <div className="h-6 w-px bg-white/5"></div>
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Img</span>
                  <span className="text-xs font-black text-white leading-none mt-1">{imageCount}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Vid</span>
                  <span className="text-xs font-black text-white leading-none mt-1">{videoCount}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 text-center">
           <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.5em]">Segurança de dados monitorada por PMCE</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
