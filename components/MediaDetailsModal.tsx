
import React, { useState, useEffect, useRef } from 'react';
import { DroneMedia } from '../types';
import { reverseGeocode, searchAddress, geocodeAddress } from '../services/exifService';

interface MediaDetailsModalProps {
  media: DroneMedia;
  onClose: () => void;
  onUpdate: (updated: DroneMedia) => void;
  onDelete: () => void;
  onDownload: () => void;
  isDarkMode: boolean;
  fullscreenOnly?: boolean; 
}

const MediaDetailsModal: React.FC<MediaDetailsModalProps> = ({ 
  media, 
  onClose, 
  onUpdate, 
  onDelete, 
  onDownload,
  isDarkMode,
  fullscreenOnly = false
}) => {
  const [address, setAddress] = useState(media.address || '');
  const [observation, setObservation] = useState(media.observation || '');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showFullImage, setShowFullImage] = useState(fullscreenOnly);
  const searchTimeout = useRef<any>(null);

  useEffect(() => {
    const fetchAddress = async () => {
      if (media.hasGps && media.latitude && media.longitude && !media.address) {
        setIsLoadingAddress(true);
        const resolvedAddress = await reverseGeocode(media.latitude, media.longitude);
        if (resolvedAddress) setAddress(resolvedAddress);
        setIsLoadingAddress(false);
      }
    };
    fetchAddress();
  }, [media]);

  const handleAddressChange = (val: string) => {
    if (isAddressLocked) return;
    setAddress(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (val.length > 3) {
      searchTimeout.current = setTimeout(async () => {
        const res = await searchAddress(val);
        setSuggestions(res);
      }, 800);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (s: string) => {
    if (isAddressLocked) return;
    setAddress(s);
    setSuggestions([]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    let updatedMedia = { ...media, address, observation };

    // Se o ativo não tem GPS e um endereço foi inserido/alterado, tentamos geocodificar
    if (!media.hasGps && address && address !== media.address) {
      const coords = await geocodeAddress(address);
      if (coords) {
        updatedMedia.latitude = coords.lat;
        updatedMedia.longitude = coords.lng;
        updatedMedia.hasGps = true;
      }
    }

    onUpdate(updatedMedia);
    setIsSaving(false);
    onClose();
  };

  const isAddressLocked = media.hasGps && !!media.address;

  if (showFullImage) {
    return (
      <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-3xl flex flex-col animate-in fade-in duration-300">
        <header className="flex justify-between items-center px-10 py-6 border-b border-white/10 bg-black/40">
          <div className="flex items-center space-x-6">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{media.name} - <span className="text-blue-500">{media.timestamp}</span></h2>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.4em] mt-1">Ampliação Tática de Ativo</p>
            </div>
          </div>
          <button onClick={() => fullscreenOnly ? onClose() : setShowFullImage(false)} className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-all hover:rotate-90"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg></button>
        </header>
        <div className="flex-1 flex items-center justify-center overflow-hidden p-8">
          {media.type === 'video' ? <video src={media.videoUrl} controls autoPlay className="max-w-full max-h-full rounded-[3rem] shadow-2xl border-4 border-white/5" /> : <img src={media.previewUrl} className="max-w-full max-h-full object-contain rounded-[3rem] shadow-2xl border-4 border-white/5" />}
        </div>
        <footer className="flex justify-center p-10 space-x-6 bg-black/40 border-t border-white/5">
           <button onClick={onDownload} className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all">Download</button>
           <button onClick={() => fullscreenOnly ? onClose() : setShowFullImage(false)} className="bg-white/10 hover:bg-white/20 text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all">Retornar à Central</button>
        </footer>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
      <div className={`border rounded-[3.5rem] w-full max-w-7xl h-full flex flex-col overflow-hidden shadow-2xl transition-colors ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}`}>
        <header className={`p-8 border-b flex items-center justify-between shrink-0 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
           <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-lg">
                 <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              </div>
              <div>
                 <h2 className={`text-2xl font-black uppercase tracking-tighter italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{media.name} - <span className="text-blue-500">{media.timestamp}</span></h2>
                 <p className={`text-[10px] font-black uppercase tracking-[0.4em] mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Central de Inteligência Operacional M.I.R.A.</p>
              </div>
           </div>
           <div className="flex items-center space-x-4">
              <button onClick={() => setShowFullImage(true)} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isDarkMode ? 'bg-white/5 text-blue-400' : 'bg-slate-100 text-blue-600'}`}>Ampliar</button>
              <button onClick={onClose} className={`p-4 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/5 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg></button>
           </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className={`flex-1 flex flex-col p-8 overflow-hidden ${isDarkMode ? 'bg-black/20' : 'bg-slate-50'}`}>
             <div className="flex-1 rounded-[2.5rem] overflow-hidden border shadow-inner relative group bg-black/40 border-white/10">
                <img src={media.previewUrl} className="w-full h-full object-contain" />
             </div>
             <div className={`mt-6 grid grid-cols-2 gap-6 p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-950/50 border-white/5' : 'bg-white border-slate-200'}`}>
                <div className="flex flex-col">
                    <span className={`text-[8px] font-black uppercase tracking-widest mb-1.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Latitude (Y)</span>
                    <span className={`text-sm font-mono font-bold tracking-tighter ${media.hasGps ? 'text-blue-500' : 'text-orange-500 italic'}`}>{media.latitude?.toFixed(7) || 'PENDENTE'}</span>
                </div>
                <div className="flex flex-col border-l pl-6 border-white/10">
                    <span className={`text-[8px] font-black uppercase tracking-widest mb-1.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Longitude (X)</span>
                    <span className={`text-sm font-mono font-bold tracking-tighter ${media.hasGps ? 'text-blue-500' : 'text-orange-500 italic'}`}>{media.longitude?.toFixed(7) || 'PENDENTE'}</span>
                </div>
             </div>
          </div>

          <div className={`w-full lg:w-[540px] border-l p-10 flex flex-col overflow-y-auto custom-scrollbar transition-colors ${isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100'}`}>
             <div className="space-y-12 flex-1">
                <div className="space-y-4 relative">
                   <div className="flex justify-between items-center px-1">
                      <label className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Localização Estruturada</label>
                      {isLoadingAddress && <span className="text-[7px] text-blue-500 font-black animate-pulse uppercase">Geocodificando...</span>}
                      {isAddressLocked && <span className="text-[7px] text-emerald-500 font-black uppercase border border-emerald-500/20 px-2.5 py-1 rounded-lg bg-emerald-500/5">GPS Ativo</span>}
                   </div>
                   <textarea value={address} onChange={(e) => handleAddressChange(e.target.value)} readOnly={isAddressLocked} placeholder={media.hasGps ? "Sincronizando coordenadas..." : "Insira o endereço para geocodificação..."} className={`w-full border rounded-[1.5rem] p-6 text-[11px] font-bold outline-none h-32 resize-none transition-all leading-relaxed ${isAddressLocked ? (isDarkMode ? 'bg-slate-800/50 border-emerald-500/10 text-slate-400' : 'bg-slate-50 border-emerald-500/10 text-slate-500') : (isDarkMode ? 'bg-slate-950 border-white/10 text-white focus:ring-2 focus:ring-blue-600' : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500')}`} />
                   {!isAddressLocked && suggestions.length > 0 && (
                     <div className={`absolute top-full left-0 right-0 z-[1200] mt-3 rounded-2xl border shadow-2xl overflow-hidden ${isDarkMode ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'}`}>
                        {suggestions.map((s, idx) => (
                          <div key={idx} onClick={() => selectSuggestion(s)} className={`p-4 text-[10px] font-bold cursor-pointer border-b last:border-0 ${isDarkMode ? 'hover:bg-blue-600/20 text-slate-300 border-white/5' : 'hover:bg-blue-50 text-slate-700 border-slate-100'}`}>{s}</div>
                        ))}
                     </div>
                   )}
                </div>
                <div className="space-y-4">
                   <label className={`text-[9px] font-black uppercase tracking-widest px-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Observações Táticas</label>
                   <textarea value={observation} onChange={(e) => setObservation(e.target.value)} placeholder="Relatório de missão, alvos ou anomalias..." className={`w-full border rounded-[1.5rem] p-6 text-[11px] font-bold outline-none h-80 resize-none transition-all leading-relaxed ${isDarkMode ? 'bg-slate-950 border-white/10 text-white focus:ring-2 focus:ring-blue-600' : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500'}`} />
                </div>
             </div>
             <div className={`mt-10 pt-10 border-t space-y-4 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={onDownload} className="py-4 bg-slate-800 text-blue-400 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-700 transition-all">Download</button>
                  <button onClick={onDelete} className="py-4 bg-red-600/10 text-red-500 rounded-2xl font-black text-[9px] uppercase tracking-widest border border-red-600/20 hover:bg-red-600 hover:text-white transition-all">Deletar Ativo</button>
                </div>
                <button onClick={handleSave} disabled={isSaving} className={`w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-3 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                  <span>Salvar Dados de Missão</span>
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetailsModal;
