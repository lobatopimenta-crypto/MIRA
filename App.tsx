
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import HistoryView from './components/HistoryView';
import ReportsView from './components/ReportsView';
import LoginView from './components/LoginView';
import { DroneMedia } from './types';
import { extractGpsData } from './services/exifService';

type Tab = 'map' | 'history' | 'reports';
type UploadChoice = 'image' | 'video' | 'both' | null;
type GpsFilterStatus = 'all' | 'ok' | 'missing';

const ShieldIcon = () => (
  <svg className="w-9 h-9 mr-3 text-blue-500 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99V6.3L19 9.41V11C19 15.19 16.59 18.83 13 20.2V11.99H12Z"/>
  </svg>
);

const TacticalLogo = ({ size = "12", pulsing = false }: { size?: string, pulsing?: boolean }) => (
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

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [mediaList, setMediaList] = useState<DroneMedia[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<DroneMedia | null>(null);
  const [fullScreenMedia, setFullScreenMedia] = useState<DroneMedia | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [address, setAddress] = useState<string>('');
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  
  const [isManualLocationMode, setIsManualLocationMode] = useState(false);
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [showConfirmManualPoint, setShowConfirmManualPoint] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [isFetchingPendingAddress, setIsFetchingPendingAddress] = useState(false);

  const [manualLatInput, setManualLatInput] = useState('');
  const [manualLngInput, setManualLngInput] = useState('');
  const [quickPasteInput, setQuickPasteInput] = useState('');
  const [addressSearchInput, setAddressSearchInput] = useState('');
  const [addressResults, setAddressResults] = useState<any[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [previewLocation, setPreviewLocation] = useState<{lat: number, lng: number} | null>(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isFolderUpload, setIsFolderUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentProcessingFile, setCurrentProcessingFile] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [showCancelUploadModal, setShowCancelUploadModal] = useState(false);
  
  const cancelUploadRef = useRef(false);
  const currentBatchIdsRef = useRef<string[]>([]);
  
  const [filterText, setFilterText] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [gpsFilterStatus, setGpsFilterStatus] = useState<GpsFilterStatus>('all');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAddress = async () => {
      if (selectedMedia?.latitude && selectedMedia?.longitude) {
        setIsSearchingAddress(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${selectedMedia.latitude}&lon=${selectedMedia.longitude}&zoom=18&addressdetails=1`);
          const data = await res.json();
          if (data.address) {
            const addr = data.address;
            const parts = [addr.road, addr.house_number, addr.suburb || addr.neighbourhood, addr.city || addr.town, addr.state].filter(Boolean);
            setAddress(parts.join(', '));
          } else {
            setAddress('Referência urbana não localizada');
          }
        } catch (e) {
          setAddress('Falha de conexão GIS');
        } finally {
          setIsSearchingAddress(false);
        }
      } else {
        setAddress('');
      }
    };
    fetchAddress();
  }, [selectedMedia?.latitude, selectedMedia?.longitude]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (addressSearchInput.length > 3) {
        performAddressSearch(addressSearchInput);
      } else {
        setAddressResults([]);
      }
    }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [addressSearchInput]);

  const performAddressSearch = async (query: string) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setAddressResults(data);
    } catch (e) {
      console.error("Erro na busca", e);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSelectAddressResult = (res: any) => {
    const lat = parseFloat(res.lat);
    const lng = parseFloat(res.lon);
    setManualLatInput(res.lat);
    setManualLngInput(res.lon);
    setPreviewLocation({ lat, lng });
    setAddressResults([]);
    setAddressSearchInput(res.display_name);
  };

  const handleQuickPaste = (val: string) => {
    setQuickPasteInput(val);
    const match = val.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
    if (match) {
      const lat = match[1];
      const lng = match[2];
      setManualLatInput(lat);
      setManualLngInput(lng);
      setPreviewLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
    }
  };

  const filteredMediaList = useMemo(() => {
    return mediaList.filter(m => {
      const matchesText = m.name.toLowerCase().includes(filterText.toLowerCase());
      let matchesGps = true;
      if (gpsFilterStatus === 'ok') matchesGps = m.hasGps;
      if (gpsFilterStatus === 'missing') matchesGps = !m.hasGps;
      let matchesDate = true;
      if (m.timestamp) {
        const datePart = m.timestamp.split(' ')[0].replace(/-/g, ':'); 
        const [year, month] = datePart.split(':');
        if (filterYear && year !== filterYear) matchesDate = false;
        if (filterMonth && month !== filterMonth) matchesDate = false;
      } else if (filterYear || filterMonth) { matchesDate = false; }
      return matchesText && matchesGps && matchesDate;
    });
  }, [mediaList, filterText, filterYear, filterMonth, gpsFilterStatus]);

  const imagesCount = useMemo(() => mediaList.filter(m => m.type === 'image').length, [mediaList]);
  const videosCount = useMemo(() => mediaList.filter(m => m.type === 'video').length, [mediaList]);

  const handleMarkerSelection = useCallback((m: DroneMedia) => {
    setSelectedMedia(m);
  }, []);

  const downloadFile = (media: DroneMedia) => {
    const link = document.createElement('a');
    link.href = media.previewUrl;
    link.download = `${media.name}-${media.id.substring(0, 4)}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteMedia = useCallback((id: string) => {
    setMediaList(prev => prev.filter(m => m.id !== id));
    if (selectedMedia?.id === id) setSelectedMedia(null);
  }, [selectedMedia]);

  const deleteMultipleMedia = useCallback((ids: string[]) => {
    setMediaList(prev => prev.filter(m => !ids.includes(m.id)));
    if (selectedMedia && ids.includes(selectedMedia.id)) setSelectedMedia(null);
  }, [selectedMedia]);

  const updateObservation = (id: string, text: string) => {
    setMediaList(prev => prev.map(m => m.id === id ? { ...m, observation: text } : m));
    if (selectedMedia?.id === id) setSelectedMedia(prev => prev ? { ...prev, observation: text } : null);
  };

  const onMapClickForLocation = useCallback(async (lat: number, lng: number) => {
    if (isManualLocationMode && selectedMedia) {
      setIsFetchingPendingAddress(true);
      setShowConfirmManualPoint(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await res.json();
        let formattedAddr = 'Referência urbana não identificada';
        if (data.address) {
          const addr = data.address;
          formattedAddr = [
            addr.road,
            addr.house_number,
            addr.suburb || addr.neighbourhood,
            addr.city || addr.town,
            addr.state,
            addr.postcode
          ].filter(Boolean).join(', ');
        }
        setPendingLocation({ lat, lng, address: formattedAddr });
      } catch (e) {
        setPendingLocation({ lat, lng, address: 'Falha ao obter endereço' });
      } finally {
        setIsFetchingPendingAddress(false);
      }
    } else {
      setSelectedMedia(null);
    }
  }, [isManualLocationMode, selectedMedia]);

  const confirmPendingLocation = () => {
    if (pendingLocation && selectedMedia) {
      const targetId = selectedMedia.id;
      setMediaList(prev => prev.map(m => 
        m.id === targetId ? { ...m, latitude: pendingLocation.lat, longitude: pendingLocation.lng, hasGps: true } : m
      ));
      setSelectedMedia(prev => {
        if (prev?.id === targetId) {
          return { ...prev, latitude: pendingLocation.lat, longitude: pendingLocation.lng, hasGps: true };
        }
        return prev;
      });
      setIsManualLocationMode(false);
      setShowConfirmManualPoint(false);
      setPendingLocation(null);
      setPreviewLocation(null);
    }
  };

  const handleManualEntrySubmit = () => {
    const lat = parseFloat(manualLatInput);
    const lng = parseFloat(manualLngInput);
    if (isNaN(lat) || isNaN(lng)) return;
    if (selectedMedia) {
      setMediaList(prev => prev.map(m => 
        m.id === selectedMedia.id ? { ...m, latitude: lat, longitude: lng, hasGps: true } : m
      ));
      setSelectedMedia(prev => prev ? { ...prev, latitude: lat, longitude: lng, hasGps: true } : null);
      setShowManualEntryModal(false);
      setPreviewLocation(null);
    }
  };

  const triggerManualEntry = () => {
    setManualLatInput(selectedMedia?.latitude?.toString() || '');
    setManualLngInput(selectedMedia?.longitude?.toString() || '');
    setQuickPasteInput('');
    setAddressSearchInput('');
    setAddressResults([]);
    setPreviewLocation(null);
    setShowManualEntryModal(true);
  };

  const processFiles = async (inputFiles: FileList | File[]) => {
    const files = Array.from(inputFiles).filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
    if (files.length === 0) return;
    setIsUploading(true);
    cancelUploadRef.current = false;
    currentBatchIdsRef.current = [];
    setUploadProgress({ current: 0, total: files.length });
    const batchSize = 3;
    for (let i = 0; i < files.length; i += batchSize) {
      if (cancelUploadRef.current) break;
      const currentBatch = files.slice(i, i + batchSize);
      const batchResults = await Promise.all(currentBatch.map(async (file) => {
        if (cancelUploadRef.current) return null;
        setCurrentProcessingFile(file.name);
        await new Promise(r => setTimeout(r, 200));
        const isVideo = file.type.includes('video');
        try {
          const gps = await extractGpsData(file);
          const rawTimestamp = gps.timestamp || new Date(file.lastModified).toISOString().replace('T', ' ').split('.')[0];
          let folderName = 'Geral';
          if ((file as any).webkitRelativePath) {
            const parts = (file as any).webkitRelativePath.split('/');
            if (parts.length > 1) folderName = parts[0];
          }
          return {
            id: Math.random().toString(36).substr(2, 9) + Date.now(),
            file,
            name: file.name,
            type: isVideo ? 'video' : 'image',
            previewUrl: URL.createObjectURL(file),
            latitude: gps.lat,
            longitude: gps.lng,
            hasGps: gps.lat !== null,
            timestamp: rawTimestamp,
            observation: '', 
            folder: folderName
          } as DroneMedia;
        } catch { return null; }
      }));
      const validResults = batchResults.filter((r): r is DroneMedia => r !== null);
      if (validResults.length > 0) {
        currentBatchIdsRef.current.push(...validResults.map(r => r.id));
        setMediaList(prev => [...prev, ...validResults]);
      }
      setUploadProgress(prev => ({ ...prev, current: Math.min(prev.total, i + currentBatch.length) }));
    }
    if (!cancelUploadRef.current) setIsUploading(false);
  };

  const handleCancelUpload = (keepPartial: boolean) => {
    cancelUploadRef.current = true;
    setShowCancelUploadModal(false);
    setIsUploading(false);
    
    if (!keepPartial) {
      const idsToRemove = currentBatchIdsRef.current;
      setMediaList(prev => prev.filter(m => !idsToRemove.includes(m.id)));
    }
    currentBatchIdsRef.current = [];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) processFiles(e.target.files);
  };

  const handleUploadCategoryChoice = (choice: UploadChoice) => {
    setShowUploadModal(false);
    if (!choice) return;
    
    requestAnimationFrame(() => {
      const targetRef = isFolderUpload ? folderInputRef : fileInputRef;
      if (targetRef.current) {
        if (choice === 'image') targetRef.current.accept = 'image/*';
        else if (choice === 'video') targetRef.current.accept = 'video/*';
        else targetRef.current.accept = 'image/*,video/*';
        targetRef.current.click();
      }
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedMedia(null);
    setActiveTab('map');
  };

  if (!isAuthenticated) {
    return <LoginView 
              onLogin={() => setIsAuthenticated(true)} 
              totalFiles={mediaList.length} 
              imageCount={imagesCount} 
              videoCount={videosCount} 
            />;
  }

  return (
    <div className={`flex flex-col h-screen bg-slate-50 overflow-hidden font-sans transition-opacity duration-700 ${isUploading ? 'pointer-events-none opacity-90' : 'opacity-100'}`}>
      <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 shadow-2xl z-50 shrink-0 border-b border-slate-800">
        <div className="flex items-center space-x-4 w-1/4">
          <button disabled={isUploading} onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg transition-all text-blue-400 disabled:opacity-30">
            <svg className={`w-6 h-6 transition-transform duration-500 ${isSidebarOpen ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
          </button>
          <div onClick={() => !isUploading && setActiveTab('map')} className="cursor-pointer flex items-center group">
            <TacticalLogo pulsing={isUploading} />
            <div className="hidden sm:block ml-3 overflow-hidden transition-all duration-300">
              <h1 className="text-xl font-black tracking-tighter leading-none flex items-center uppercase text-white group-hover:text-blue-400">M.I.R.A.<span className="ml-2 text-[8px] bg-blue-600 px-1.5 py-0.5 rounded text-white tracking-widest font-black">PRO</span></h1>
              <p className="text-[7px] text-slate-400 font-black uppercase tracking-[0.25em] mt-1.5 leading-tight">Mapeamento de Inteligência e Reconhecimento Aéreo</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="flex items-center">
            <ShieldIcon />
            <span className="text-2xl md:text-[28px] font-black tracking-tight uppercase bg-gradient-to-r from-blue-400 via-blue-200 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              ASINT / PMCE
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 w-1/4">
          <nav className="hidden xl:flex items-center space-x-1 h-full text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2">
            <button disabled={isUploading} onClick={() => setActiveTab('map')} className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeTab === 'map' ? 'text-white bg-blue-600 shadow-lg' : 'hover:text-white hover:bg-slate-800'}`}>Mapa</button>
            <button disabled={isUploading} onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeTab === 'history' ? 'text-white bg-blue-600 shadow-lg' : 'hover:text-white hover:bg-slate-800'}`}>📋 Histórico</button>
            <button disabled={isUploading} onClick={() => setActiveTab('reports')} className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeTab === 'reports' ? 'text-white bg-blue-600 shadow-lg' : 'hover:text-white hover:bg-slate-800'}`}>📊 Relatórios</button>
          </nav>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
          <input type="file" ref={folderInputRef} onChange={handleFileUpload} {...({ webkitdirectory: "", directory: "" } as any)} multiple className="hidden" />
          <div className="flex space-x-2 items-center">
            <button disabled={isUploading} onClick={() => { setIsFolderUpload(true); setShowUploadModal(true); }} className="bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-700 transition-all disabled:opacity-30"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg></button>
            <button disabled={isUploading} onClick={() => { setIsFolderUpload(false); setShowUploadModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-all disabled:opacity-30">Arquivos</button>
            <div className="w-px h-6 bg-slate-700 mx-2"></div>
            <button 
              onClick={handleLogout}
              className="group flex items-center space-x-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-3 py-2 rounded-xl transition-all border border-red-600/30 font-black text-[9px] uppercase tracking-widest"
              title="Encerrar Sessão"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span className="hidden lg:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {isUploading && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl z-[60] flex flex-col items-center justify-center animate-in fade-in duration-500">
            <TacticalLogo size="24" pulsing={true} />
            <div className="mt-12 text-center max-w-md w-full px-6">
              <h3 className="text-2xl font-black text-white uppercase tracking-[0.3em] mb-2">Sincronização de Inteligência</h3>
              <p className="text-blue-400 font-mono text-xs mb-8 truncate max-w-full">{currentProcessingFile || 'Transmitindo ativos...'}</p>
              <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden mb-4 border border-white/10 p-1">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-700" style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}></div>
              </div>
              <button onClick={() => setShowCancelUploadModal(true)} className="mt-12 px-8 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/30 rounded-2xl font-black text-[10px] uppercase transition-all pointer-events-auto">Abortar Operação</button>
            </div>
          </div>
        )}

        {showUploadModal && (
          <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] p-12 max-w-xl w-full shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-white/20 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <div className="text-center mb-10">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Protocolo de Importação</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Selecione a categoria de ativos para processamento GIS</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => handleUploadCategoryChoice('image')} 
                  className="group w-full p-6 bg-slate-50 hover:bg-blue-600 border border-slate-200 hover:border-blue-400 rounded-3xl transition-all duration-300 flex items-center text-left"
                >
                  <div className="w-14 h-14 bg-white group-hover:bg-blue-500 rounded-2xl shadow-sm flex items-center justify-center mr-6 transition-colors">
                    <svg className="w-7 h-7 text-blue-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 group-hover:text-white text-sm uppercase tracking-widest">Imagens Aéreas</h4>
                    <p className="text-[9px] text-slate-400 group-hover:text-blue-100 font-bold uppercase tracking-tighter mt-1">Extração automática de metadados GPS e EXIF</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleUploadCategoryChoice('video')} 
                  className="group w-full p-6 bg-slate-50 hover:bg-red-600 border border-slate-200 hover:border-red-400 rounded-3xl transition-all duration-300 flex items-center text-left"
                >
                  <div className="w-14 h-14 bg-white group-hover:bg-red-500 rounded-2xl shadow-sm flex items-center justify-center mr-6 transition-colors">
                    <svg className="w-7 h-7 text-red-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 group-hover:text-white text-sm uppercase tracking-widest">Sensores de Vídeo</h4>
                    <p className="text-[9px] text-slate-400 group-hover:text-red-100 font-bold uppercase tracking-tighter mt-1">Mapeamento dinâmico e rastreio de telemetria</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleUploadCategoryChoice('both')} 
                  className="group w-full p-6 bg-slate-50 hover:bg-slate-900 border border-slate-200 hover:border-slate-800 rounded-3xl transition-all duration-300 flex items-center text-left"
                >
                  <div className="w-14 h-14 bg-white group-hover:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center mr-6 transition-colors">
                    <svg className="w-7 h-7 text-slate-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 group-hover:text-white text-sm uppercase tracking-widest">Lote de Ativos (Misto)</h4>
                    <p className="text-[9px] text-slate-400 group-hover:text-slate-400 font-bold uppercase tracking-tighter mt-1">Sincronização geral de pastas e múltiplos formatos</p>
                  </div>
                </button>
              </div>

              <div className="flex justify-center mt-10">
                <button 
                  onClick={() => setShowUploadModal(false)} 
                  className="text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-[0.3em] transition-colors flex items-center"
                >
                  <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                  Cancelar Operação
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="flex-1 flex relative">
            {isManualLocationMode && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-500">
                <div className="bg-blue-600 text-white px-8 py-4 rounded-3xl shadow-2xl border border-blue-400 flex items-center space-x-6 backdrop-blur-md bg-opacity-90">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Modo de Atribuição Ativo</span>
                    <span className="text-xs font-bold">Clique no local exato do mapa para registrar o ativo</span>
                  </div>
                  <button onClick={() => { setIsManualLocationMode(false); setShowConfirmManualPoint(false); }} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all border border-white/20">Cancelar</button>
                </div>
              </div>
            )}
            <div className={`transition-all duration-500 ease-in-out h-full overflow-hidden border-r bg-white relative z-40 ${isSidebarOpen ? 'w-80' : 'w-0'}`}>
              <div className={`w-80 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                <Sidebar 
                  mediaList={filteredMediaList} 
                  onSelect={handleMarkerSelection} 
                  onDelete={deleteMedia} 
                  selectedId={selectedMedia?.id} 
                  filterText={filterText} 
                  setFilterText={setFilterText} 
                  filterYear={filterYear} 
                  setFilterYear={setFilterYear} 
                  filterMonth={filterMonth} 
                  setFilterMonth={setFilterMonth} 
                  onFilesDropped={processFiles} 
                  onImportClick={() => { setIsFolderUpload(false); setShowUploadModal(true); }} 
                  isProcessing={isUploading}
                  gpsFilter={gpsFilterStatus}
                  setGpsFilter={setGpsFilterStatus}
                />
              </div>
            </div>
            <div className="flex-1 relative bg-slate-200">
              <MapView 
                mediaList={filteredMediaList} 
                onMarkerClick={handleMarkerSelection} 
                onDelete={deleteMedia} 
                onFullScreen={setFullScreenMedia} 
                onDownload={downloadFile} 
                onMapClick={onMapClickForLocation} 
                selectedId={selectedMedia?.id}
                previewLocation={previewLocation}
                isManualMode={isManualLocationMode}
              />
              {selectedMedia && !isManualLocationMode && (
                <div className="absolute top-6 right-6 z-[45] w-80 bg-white/95 backdrop-blur shadow-2xl rounded-[2.5rem] border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-right-8 duration-500">
                  <div className="p-5 bg-slate-900 text-white flex justify-between items-center shrink-0">
                    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-400">Análise de Alvo</h3>
                    <button onClick={() => setSelectedMedia(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                  <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <div onClick={() => setFullScreenMedia(selectedMedia)} className="aspect-video rounded-3xl overflow-hidden bg-black mb-6 shadow-xl cursor-zoom-in relative group border border-slate-100">
                      {selectedMedia.type === 'video' ? <video src={selectedMedia.previewUrl} className="w-full h-full object-cover" /> : <img src={selectedMedia.previewUrl} className="w-full h-full object-cover" alt="" />}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300"><span className="text-white text-[9px] font-black uppercase tracking-widest bg-blue-600 px-6 py-2 rounded-full">Expandir Visão</span></div>
                    </div>
                    <div className="space-y-4 mb-6">
                      <div className="p-5 bg-slate-900/5 border border-slate-200 rounded-[1.5rem] shadow-sm">
                        <h4 className="text-[9px] font-black text-slate-400 mb-1.5 uppercase tracking-widest flex justify-between items-center">
                          Registro Temporal
                          <span className="text-[8px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-black">DATA DE CRIAÇÃO</span>
                        </h4>
                        <div className="text-[12px] font-black text-slate-800 font-mono tracking-tighter">
                          {selectedMedia.timestamp || 'NÃO CATALOGADO'}
                        </div>
                      </div>
                      <div className="p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] shadow-sm">
                        <h4 className="text-[9px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Endereço</h4>
                        <div className={`text-[10px] font-bold leading-relaxed ${isSearchingAddress ? 'text-blue-500 animate-pulse' : 'text-slate-800'}`}>
                          {isSearchingAddress ? 'Localizando no Servidor...' : address || 'Local sem referência urbana'}
                        </div>
                      </div>
                      <div className="p-5 bg-blue-50/50 rounded-[1.5rem] border border-blue-100 shadow-sm">
                        <h4 className="text-[9px] font-black text-blue-900/40 mb-2 uppercase tracking-widest">Grade de Coordenadas</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div><span className="text-[8px] font-black text-blue-900/60 uppercase block mb-0.5">Latitude</span><span className="text-[11px] font-mono font-black text-blue-700">{selectedMedia.latitude?.toFixed(6) || '---'}</span></div>
                            <div className="border-l border-blue-100 pl-4"><span className="text-[8px] font-black text-blue-900/60 uppercase block mb-0.5">Longitude</span><span className="text-[11px] font-mono font-black text-blue-700">{selectedMedia.longitude?.toFixed(6) || '---'}</span></div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 mb-6">
                      <button onClick={() => downloadFile(selectedMedia)} className="w-full bg-blue-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase shadow-xl hover:bg-blue-500 transition-all">Exportar Ativo</button>
                      <button onClick={triggerManualEntry} className="w-full bg-orange-50 text-orange-600 py-4 rounded-2xl text-[10px] font-black uppercase border border-orange-200 hover:bg-orange-100 transition-all flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                        {selectedMedia.hasGps ? 'Redefinir Ponto' : 'Ponto Manual'}
                      </button>
                    </div>
                    <div className="p-5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm">
                      <h4 className="text-[9px] font-black text-slate-400 mb-3 uppercase tracking-widest text-center">Observações Táticas</h4>
                      <textarea className="w-full h-32 text-xs p-4 bg-slate-50 rounded-xl border border-slate-100 outline-none resize-none text-slate-700 font-medium" placeholder="Relatório de missão..." value={selectedMedia.observation} onChange={(e) => updateObservation(selectedMedia.id, e.target.value)} />
                    </div>
                    <button onClick={() => deleteMedia(selectedMedia.id)} className="w-full mt-8 py-3.5 text-[9px] font-black uppercase text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">Eliminar do Log</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'history' && <HistoryView mediaList={mediaList} onSelect={(m) => { setSelectedMedia(m); setActiveTab('map'); }} onDelete={deleteMedia} onDeleteMultiple={deleteMultipleMedia} />}
        {activeTab === 'reports' && <ReportsView mediaList={mediaList} />}
        {fullScreenMedia && (
          <div className="fixed inset-0 z-[1000] bg-slate-950/98 flex items-center justify-center p-6 backdrop-blur-2xl animate-in fade-in duration-300">
            <button onClick={() => setFullScreenMedia(null)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-all p-2"><svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            <div className="max-w-[95vw] max-h-[90vh] flex flex-col items-center">
              <div className="relative shadow-2xl rounded-[3rem] overflow-hidden border border-white/10 group">
                {fullScreenMedia.type === 'video' ? <video src={fullScreenMedia.previewUrl} controls autoPlay className="max-w-full max-h-[80vh]" /> : <img src={fullScreenMedia.previewUrl} className="max-w-full max-h-[80vh] object-contain" alt="" />}
              </div>
            </div>
          </div>
        )}

        {/* CONTADOR DE ARQUIVOS FLUTUANTE - DINÂMICO CONFORME SIDEBAR */}
        {mediaList.length > 0 && activeTab === 'map' && (
          <div 
            className="absolute bottom-6 z-[40] pointer-events-none transition-all duration-500 ease-in-out animate-in fade-in zoom-in"
            style={{ left: isSidebarOpen ? '336px' : '24px' }}
          >
            <div className="bg-slate-900/90 backdrop-blur-2xl px-5 py-3 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center space-x-5">
              <div className="flex flex-col border-r border-white/5 pr-5">
                <span className="text-[7px] font-black text-blue-400 uppercase tracking-[0.2em] mb-0.5">Sincronia Total</span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-white tabular-nums leading-none tracking-tighter">{mediaList.length}</span>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Arquivos</span>
                </div>
              </div>
              <div className="flex space-x-5">
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-slate-500 uppercase mb-1">Fotos</span>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                    <span className="text-xs font-black text-white/90 leading-none">{imagesCount}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-slate-500 uppercase mb-1">Vídeos</span>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-black text-white/90 leading-none">{videosCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="h-10 bg-slate-900 text-slate-500 text-[9px] flex items-center px-6 justify-between border-t border-slate-800 z-50 uppercase font-black tracking-widest">
        <div className="flex items-center space-x-4"><span className="text-blue-700">M.I.R.A. v1.0.0</span><span className="w-px h-3 bg-slate-800"></span><span>ASINT / PMCE</span></div>
        <div className="flex items-center space-x-2"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span><span className="tracking-[0.15em]">SISTEMA DE INTELIGÊNCIA</span></div>
      </footer>

      {showCancelUploadModal && (
        <div className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-md w-full flex flex-col items-center shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-xl font-black text-slate-900 uppercase mb-4 text-center">Interromper Sincronização?</h3>
            <div className="grid grid-cols-1 w-full gap-3">
              <button onClick={() => handleCancelUpload(true)} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg">Manter Parciais</button>
              <button onClick={() => handleCancelUpload(false)} className="w-full py-5 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase border border-red-100 hover:bg-red-100 transition-all">Descartar Sessão</button>
              <button onClick={() => setShowCancelUploadModal(false)} className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Voltar para Sincronia</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmManualPoint && (
        <div className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-md w-full border border-blue-100 shadow-2xl flex flex-col items-center">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-6 text-center">Confirmar Localização?</h3>
            <div className="w-full space-y-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Endereço Detectado</label>
                {isFetchingPendingAddress ? (
                   <div className="flex items-center space-x-2 animate-pulse">
                     <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                     <span className="text-[10px] font-bold text-blue-600 uppercase">Buscando via Satélite...</span>
                   </div>
                ) : (<p className="text-[10px] font-bold text-slate-800 leading-relaxed">{pendingLocation?.address}</p>)}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                  <label className="text-[8px] font-black text-blue-900/40 uppercase block mb-1">Latitude</label>
                  <span className="text-[11px] font-mono font-black text-blue-700">{pendingLocation?.lat.toFixed(6)}</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                  <label className="text-[8px] font-black text-blue-900/40 uppercase block mb-1">Longitude</label>
                  <span className="text-[11px] font-mono font-black text-blue-700">{pendingLocation?.lng.toFixed(6)}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 w-full gap-4">
              <button onClick={confirmPendingLocation} disabled={isFetchingPendingAddress} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-emerald-500 transition-all disabled:opacity-50">Confirmar Ponto</button>
              <button onClick={() => { setShowConfirmManualPoint(false); setPendingLocation(null); }} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-200 transition-all">Tentar Outro</button>
            </div>
          </div>
        </div>
      )}

      {showManualEntryModal && (
        <div className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-lg w-full flex flex-col items-center border border-blue-100 shadow-2xl animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh] custom-scrollbar">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8 text-center flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg"><svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg></div>
              Atribuição Geo-Tática
            </h3>
            <div className="w-full mb-6 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] relative">
              <label className="text-[9px] font-black text-slate-400 uppercase mb-3 block tracking-widest">A) Localizar Alvo por Endereço</label>
              <input type="text" value={addressSearchInput} onChange={(e) => setAddressSearchInput(e.target.value)} placeholder="Rua, Número, Cidade, Estado..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" />
              {addressResults.length > 0 && (
                <div className="absolute left-6 right-6 top-[85%] z-50 bg-white border border-slate-200 rounded-xl mt-1 shadow-2xl max-h-40 overflow-y-auto custom-scrollbar">
                  {addressResults.map((res, i) => (
                    <button key={i} onClick={() => handleSelectAddressResult(res)} className="w-full text-left p-3 hover:bg-blue-50 text-[10px] font-bold border-b last:border-b-0 border-slate-100">{res.display_name}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="w-full mb-8 p-6 bg-blue-50/40 border border-blue-100 rounded-[2rem]">
              <label className="text-[9px] font-black text-blue-900/50 uppercase mb-3 block tracking-widest">B) Entrada de Coordenadas Manuais</label>
              <div className="mb-4"><input type="text" value={quickPasteInput} onChange={(e) => handleQuickPaste(e.target.value)} placeholder="Colar Grade (ex: -3.71, -38.52)" className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><span className="text-[8px] font-black text-blue-900/40 uppercase ml-1">Latitude</span><input type="text" value={manualLatInput} onChange={(e) => setManualLatInput(e.target.value)} className="w-full bg-white border border-blue-100 rounded-xl px-4 py-2.5 text-xs font-bold font-mono" /></div>
                <div className="space-y-1"><span className="text-[8px] font-black text-blue-900/40 uppercase ml-1">Longitude</span><input type="text" value={manualLngInput} onChange={(e) => setManualLngInput(e.target.value)} className="w-full bg-white border border-blue-100 rounded-xl px-4 py-2.5 text-xs font-bold font-mono" /></div>
              </div>
            </div>
            <div className="w-full space-y-3">
              <button onClick={handleManualEntrySubmit} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-blue-500 transition-all flex items-center justify-center">Confirmar Registro Espacial</button>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setShowManualEntryModal(false); setIsManualLocationMode(true); }} className="py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
                  Ponto Manual no Mapa
                </button>
                <button onClick={() => setShowManualEntryModal(false)} className="py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
