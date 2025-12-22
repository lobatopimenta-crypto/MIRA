
import React from 'react';
import { DroneMedia } from '../types';

interface ReportsViewProps {
  mediaList: DroneMedia[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ mediaList }) => {
  const images = mediaList.filter(m => m.type === 'image').length;
  const videos = mediaList.filter(m => m.type === 'video').length;
  const gpsOk = mediaList.filter(m => m.hasGps).length;
  const accuracy = mediaList.length > 0 ? (gpsOk / mediaList.length) * 100 : 0;

  return (
    <div className="flex-1 w-full h-full bg-slate-950 p-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-white/5 pb-8">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Dashboard de <span className="text-blue-500">Missão</span></h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2">Relatório de Inteligência e Eficiência de Coleta</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Volume Total', value: mediaList.length, icon: '📦', color: 'blue' },
            { label: 'Sinal GPS', value: `${accuracy.toFixed(1)}%`, icon: '🛰️', color: 'emerald' },
            { label: 'Vídeos', value: videos, icon: '🎥', color: 'indigo' },
            { label: 'Fotografia', value: images, icon: '📸', color: 'cyan' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center text-center shadow-2xl">
               <span className="text-3xl mb-4">{stat.icon}</span>
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</span>
               <span className={`text-4xl font-black text-${stat.color}-400 tracking-tighter italic`}>{stat.value}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/5 shadow-2xl">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-8 flex items-center">
                 <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                 Distribuição de Ativos
              </h3>
              <div className="space-y-8">
                 <div>
                    <div className="flex justify-between mb-2">
                       <span className="text-[9px] font-black text-slate-500 uppercase">Captação de Imagem</span>
                       <span className="text-[10px] font-black text-white">{images} UNID</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${mediaList.length > 0 ? (images/mediaList.length)*100 : 0}%` }}></div>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between mb-2">
                       <span className="text-[9px] font-black text-slate-500 uppercase">Monitoramento Vídeo</span>
                       <span className="text-[10px] font-black text-white">{videos} UNID</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${mediaList.length > 0 ? (videos/mediaList.length)*100 : 0}%` }}></div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col items-center justify-center">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-10 text-center">Saúde de Geolocalização</h3>
              <div className="relative w-48 h-48">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="80" fill="transparent" stroke="#1e293b" strokeWidth="16" />
                    <circle cx="96" cy="96" r="80" fill="transparent" stroke="#10b981" strokeWidth="16" 
                      strokeDasharray={502} 
                      strokeDashoffset={502 - (502 * accuracy) / 100}
                      className="transition-all duration-1000 shadow-[0_0_20px_#10b981]" 
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white italic">{accuracy.toFixed(0)}%</span>
                    <span className="text-[8px] font-black text-emerald-500 uppercase mt-1">Sincronizado</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
