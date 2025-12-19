
import React from 'react';
import { DroneMedia } from '../types';

interface ReportsViewProps {
  mediaList: DroneMedia[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ mediaList }) => {
  const imagesCount = mediaList.filter(m => m.type === 'image').length;
  const videosCount = mediaList.filter(m => m.type === 'video').length;
  const gpsCount = mediaList.filter(m => m.hasGps).length;
  const obsCount = mediaList.filter(m => m.observation && m.observation.trim().length > 0).length;

  const getPercentage = (count: number) => {
    if (mediaList.length === 0) return 0;
    return (count / mediaList.length) * 100;
  };

  return (
    <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex items-center">
          <span className="text-3xl mr-4">📊</span>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Relatórios</h2>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mt-1">Mapeamento de Inteligência e Reconhecimento Aéreo</p>
          </div>
        </header>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Arquivos Totais', val: mediaList.length, color: 'blue' },
            { label: 'Precisão GPS', val: `${getPercentage(gpsCount).toFixed(0)}%`, color: 'emerald' },
            { label: 'Vídeos Registrados', val: videosCount, color: 'indigo' },
            { label: 'Obs. Registradas', val: obsCount, color: 'fuchsia' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</span>
              <span className={`text-4xl font-black text-${stat.color}-600 tracking-tighter`}>{stat.val}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tight">Distribuição de Dados</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Foto</span>
                  <span className="text-xs font-black text-slate-900">{imagesCount}</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${getPercentage(imagesCount)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sensoriamento Vídeo</span>
                  <span className="text-xs font-black text-slate-900">{videosCount}</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${getPercentage(videosCount)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tight">Status de Geolocalização</h3>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="70" 
                    fill="transparent" 
                    stroke="#10b981" 
                    strokeWidth="12" 
                    strokeDasharray={440} 
                    strokeDashoffset={440 - (440 * getPercentage(gpsCount)) / 100} 
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900">{getPercentage(gpsCount).toFixed(0)}%</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase">GPS Sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tight">Observações Consolidadas do Terreno</h3>
          {mediaList.filter(m => m.observation && m.observation.trim().length > 0).length === 0 ? (
            <p className="text-sm text-gray-400 italic font-black uppercase tracking-widest text-center py-8">Vazio Operacional</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mediaList.filter(m => m.observation && m.observation.trim().length > 0).map((m, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-blue-600 uppercase mb-1">{m.name}</p>
                  <p className="text-xs text-slate-600 italic">"{m.observation}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
