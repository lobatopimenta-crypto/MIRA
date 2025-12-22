
import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import HistoryView from './components/HistoryView';
import ReportsView from './components/ReportsView';
import LoginView from './components/LoginView';
import DrawerMenu from './components/DrawerMenu';
import AdminView from './components/AdminView';
import AuditView from './components/AuditView';
import MediaDetailsModal from './components/MediaDetailsModal';
import { DroneMedia, User, AuditLog } from './types';
import { extractGpsData } from './services/exifService';

type Tab = 'map' | 'history' | 'reports' | 'admin' | 'audit';
type GpsFilterStatus = 'all' | 'ok' | 'missing';

const generateVideoThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.currentTime = 1; 
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
      URL.revokeObjectURL(video.src);
      resolve(thumbnail);
    };
    video.onerror = () => resolve(''); 
  });
};

export const TacticalLogo = ({ size = "16", pulsing = false }: { size?: string, pulsing?: boolean }) => (
  <div className={`relative flex items-center justify-center ${pulsing ? 'animate-pulse' : ''}`} style={{ width: `${parseInt(size) * 4}px`, height: `${parseInt(size) * 4}px` }}>
    <svg className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" stroke="#1e293b" strokeWidth="4" />
      <circle cx="50" cy="50" r="45" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 4" />
      <path d="M50 5 A 45 45 0 0 1 95 50" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 95 A 45 45 0 0 1 5 50" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />
      <defs>
        <pattern id="hexagons" width="10" height="17.32" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
          <path d="M5 0 L10 2.88 L10 8.66 L5 11.54 L0 8.66 L0 2.88 Z" fill="none" stroke="#0891b2" strokeWidth="0.5" opacity="0.3" />
        </pattern>
        <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0891b2" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="35" fill="url(#radarGrad)" stroke="#06b6d4" strokeWidth="2" />
      <circle cx="50" cy="50" r="35" fill="url(#hexagons)" />
      <line x1="50" y1="15" x2="50" y2="85" stroke="#22d3ee" strokeWidth="0.5" />
      <line x1="15" y1="50" x2="85" y2="50" stroke="#22d3ee" strokeWidth="0.5" />
      <line x1="50" y1="5" x2="50" y2="0" stroke="#22d3ee" strokeWidth="4" />
      <line x1="50" y1="100" x2="50" y2="95" stroke="#22d3ee" strokeWidth="4" />
      <line x1="0" y1="50" x2="5" y2="50" stroke="#22d3ee" strokeWidth="4" />
      <line x1="95" y1="50" x2="100" y2="50" stroke="#22d3ee" strokeWidth="4" />
      <g transform="translate(40, 42) scale(0.2)" fill="#22d3ee">
         <path d="M50 0 L60 20 L100 20 L100 30 L60 30 L50 50 L40 30 L0 30 L0 20 L40 20 Z" />
         <circle cx="50" cy="25" r="8" />
         <rect x="45" y="30" width="10" height="20" rx="2" />
      </g>
    </svg>
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [analyzingMedia, setAnalyzingMedia] = useState<DroneMedia | null>(null);
  const [isFullscreenMedia, setIsFullscreenMedia] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<DroneMedia[] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  
  const [users, setUsers] = useState<User[]>(() => {
    const defaultUsers: User[] = [
      { id: '1', name: 'ADMINISTRADOR', matricula: 'admin', password: 'admin', role: 'ADMIN', active: true },
      { id: '2', name: 'GESTOR TÁTICO', matricula: 'gestor', password: 'gestor', role: 'ADMIN', active: true }
    ];
    const saved = localStorage.getItem('mira_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : defaultUsers;
      } catch (e) { return defaultUsers; }
    }
    return defaultUsers;
  });

  const [mediaList, setMediaList] = useState<DroneMedia[]>(() => {
    const saved = localStorage.getItem('mira_media');
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('mira_audit');
    return saved ? JSON.parse(saved) : [];
  });

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => localStorage.setItem('mira_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('mira_media', JSON.stringify(mediaList)), [mediaList]);
  useEffect(() => localStorage.setItem('mira_audit', JSON.stringify(auditLogs)), [auditLogs]);

  const [selectedMedia, setSelectedMedia] = useState<DroneMedia | null>(null);
  const [filterText, setFilterText] = useState('');
  const [gpsFilterStatus, setGpsFilterStatus] = useState<GpsFilterStatus>('all');

  const stats = {
    total: mediaList.length,
    images: mediaList.filter(m => m.type === 'image').length,
    videos: mediaList.filter(m => m.type === 'video').length,
    noGps: mediaList.filter(m => !m.hasGps).length
  };

  const addAuditEntry = (action: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleString('pt-BR'),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      target: "Sistema",
      ip: '192.168.1.' + Math.floor(Math.random() * 255)
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const processFiles = async (inputFiles: FileList | File[]) => {
    const files = Array.from(inputFiles);
    if (files.length === 0) return;
    setIsUploading(true);
    let lastGpsCoords: [number, number] | null = null;
    const newMediaItems: DroneMedia[] = [];

    for (const file of files) {
      try {
        const gps = await extractGpsData(file);
        let preview = '';
        const isVideo = file.type.includes('video');
        
        if (isVideo) {
          preview = await generateVideoThumbnail(file);
        } else {
          preview = URL.createObjectURL(file);
        }

        if (gps.lat && gps.lng) {
          lastGpsCoords = [gps.lat, gps.lng];
        }

        const newMedia: DroneMedia = {
          id: Math.random().toString(36).substr(2, 9) + Date.now(),
          name: file.name,
          type: isVideo ? 'video' : 'image',
          previewUrl: preview,
          videoUrl: isVideo ? URL.createObjectURL(file) : undefined,
          latitude: gps.lat,
          longitude: gps.lng,
          hasGps: gps.lat !== null,
          timestamp: gps.timestamp || new Date(file.lastModified).toLocaleString('pt-BR'),
          address: '',
          observation: ''
        };
        newMediaItems.push(newMedia);
      } catch (e) { console.error(e); }
    }
    
    setMediaList(prev => [...prev, ...newMediaItems]);
    if (lastGpsCoords) setMapCenter(lastGpsCoords);
    setIsUploading(false);
    addAuditEntry(`IMPORTAÇÃO DE ${files.length} ATIVOS`);
  };

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (!isAuthenticated) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          const file = items[i].getAsFile();
          if (file && (file.type.includes('image') || file.type.includes('video'))) files.push(file);
        }
      }
      if (files.length > 0) processFiles(files);
    };
    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [isAuthenticated, activeTab]);

  const updateMedia = (updatedMedia: DroneMedia) => {
    setMediaList(prev => prev.map(m => m.id === updatedMedia.id ? updatedMedia : m));
    if (selectedMedia?.id === updatedMedia.id) setSelectedMedia(updatedMedia);
    if (analyzingMedia?.id === updatedMedia.id) setAnalyzingMedia(updatedMedia);
    addAuditEntry(`ATUALIZAÇÃO DE ATIVO: ${updatedMedia.name}`);
  };

  const deleteMediaBatch = (ids: string[]) => {
    const names = mediaList.filter(m => ids.includes(m.id)).map(m => m.name).join(', ');
    setMediaList(prev => prev.filter(m => !ids.includes(m.id)));
    setCheckedIds(prev => prev.filter(id => !ids.includes(id)));
    addAuditEntry(`EXCLUSÃO DE ${ids.length} ATIVOS: ${names}`);
    setMediaToDelete(null);
    setAnalyzingMedia(null);
    if (selectedMedia && ids.includes(selectedMedia.id)) setSelectedMedia(null);
  };

  const downloadMedia = (media: DroneMedia) => {
    const link = document.createElement('a');
    link.href = media.videoUrl || media.previewUrl;
    link.download = media.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditEntry(`DOWNLOAD DE ATIVO: ${media.name}`);
  };

  const handleLogin = (matricula: string, pass: string) => {
    const user = users.find(u => u.matricula.toLowerCase() === matricula.toLowerCase().trim() && u.password === pass.trim());
    if (user && user.active) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      setActiveTab('map');
    } else {
      throw new Error("Credenciais Inválidas");
    }
  };

  const handleToggleCheck = (id: string) => {
    setCheckedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleToggleSelectAll = (ids: string[]) => {
    const isAllChecked = ids.length > 0 && ids.every(id => checkedIds.includes(id));
    if (isAllChecked) {
      setCheckedIds(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setCheckedIds(prev => Array.from(new Set([...prev, ...ids])));
    }
  };

  if (!isAuthenticated) return <LoginView onLogin={handleLogin} totalFiles={mediaList.length} imageCount={stats.images} videoCount={stats.videos} />;

  return (
    <div className={`flex flex-col h-full w-full transition-colors duration-500 overflow-hidden font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <DrawerMenu isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} currentUser={currentUser} activeTab={activeTab} onTabChange={setActiveTab} onLogout={() => { setIsAuthenticated(false); setCurrentUser(null); }} isDarkMode={isDarkMode} />

      <header className={`h-24 border-b flex items-center justify-between px-8 z-50 shrink-0 shadow-xl relative transition-colors ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center space-x-6">
          <button onClick={() => setIsDrawerOpen(true)} className={`p-3 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-blue-400' : 'bg-slate-100 hover:bg-slate-200 text-blue-600'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16" /></svg>
          </button>
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setActiveTab('map')}>
            <TacticalLogo size="14" pulsing={isUploading} />
            <div className="flex flex-col">
              <h1 className={`text-3xl font-black uppercase tracking-tighter italic leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>M.I.R.A.<span className="text-blue-500 not-italic ml-1">PRO</span></h1>
              <p className={`text-[7px] font-black uppercase tracking-[0.15em] mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>MAPEAMENTO DE INTELIGÊNCIA E RECONHECIMENTO AÉREO</p>
            </div>
          </div>
        </div>

        {/* Identificador ASINT removido do centro superior conforme solicitado */}
        
        <div className="flex items-center space-x-4">
          <div className={`hidden md:flex items-center px-4 py-2 rounded-2xl border space-x-6 mr-4 ${isDarkMode ? 'bg-slate-950/50 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
             <div className="flex flex-col items-center"><span className={`text-[7px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Total</span><span className="text-xs font-black text-blue-500">{stats.total}</span></div>
             <div className="flex flex-col items-center"><span className={`text-[7px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Fotos</span><span className="text-xs font-black text-cyan-500">{stats.images}</span></div>
             <div className="flex flex-col items-center"><span className={`text-[7px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Vídeos</span><span className="text-xs font-black text-indigo-500">{stats.videos}</span></div>
             <div className="flex flex-col items-center"><span className={`text-[7px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>S/GPS</span><span className={`text-xs font-black ${stats.noGps > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>{stats.noGps}</span></div>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-3 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-yellow-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
            {isDarkMode ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative w-full h-full min-h-0">
        {activeTab === 'map' && (
          <div className="flex-1 flex relative w-full h-full">
            <Sidebar 
              mediaList={mediaList} 
              onSelect={(m) => { setAnalyzingMedia(m); setIsFullscreenMedia(false); }} 
              onDelete={(m) => setMediaToDelete([m])} 
              onAnalyze={(m) => { setAnalyzingMedia(m); setIsFullscreenMedia(false); }}
              onBulkDelete={(ids) => setMediaToDelete(mediaList.filter(m => ids.includes(m.id)))}
              selectedId={selectedMedia?.id} filterText={filterText} setFilterText={setFilterText} 
              onFilesSelected={processFiles} isDarkMode={isDarkMode} stats={stats}
              checkedIds={checkedIds} onToggleCheck={handleToggleCheck} onToggleSelectAll={handleToggleSelectAll}
              isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} gpsFilter={gpsFilterStatus} setGpsFilter={setGpsFilterStatus}
            />
            <div className="flex-1 relative h-full">
              <MapView mediaList={mediaList.filter(m => m.name.toLowerCase().includes(filterText.toLowerCase()))} onMarkerClick={(m) => { setAnalyzingMedia(m); setIsFullscreenMedia(false); }} onDelete={(m) => setMediaToDelete([m])} onFullScreen={(m) => { setAnalyzingMedia(m); setIsFullscreenMedia(true); }} onDownload={downloadMedia} onAnalyze={(m) => { setAnalyzingMedia(m); setIsFullscreenMedia(false); }} selectedId={selectedMedia?.id} center={mapCenter} />
            </div>
          </div>
        )}
        {activeTab === 'history' && <div className="flex-1 h-full w-full overflow-hidden"><HistoryView mediaList={mediaList} onSelect={(m) => { setAnalyzingMedia(m); setIsFullscreenMedia(false); }} onDelete={(id) => setMediaToDelete(mediaList.filter(m => m.id === id))} isDarkMode={isDarkMode} /></div>}
        {activeTab === 'reports' && <ReportsView mediaList={mediaList} />}
        {activeTab === 'admin' && <AdminView users={users} onAddUser={(u) => setUsers(p => [...p, u])} onToggleUser={(id) => setUsers(p => p.map(u => u.id === id ? {...u, active: !u.active} : u))} onDeleteUser={() => {}} />}
        {activeTab === 'audit' && <AuditView logs={auditLogs} />}
      </main>

      {analyzingMedia && <MediaDetailsModal media={analyzingMedia} onClose={() => { setAnalyzingMedia(null); setIsFullscreenMedia(false); }} onUpdate={updateMedia} onDelete={() => setMediaToDelete([analyzingMedia])} onDownload={() => downloadMedia(analyzingMedia)} isDarkMode={isDarkMode} fullscreenOnly={isFullscreenMedia} />}

      {mediaToDelete && (
        <div className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-8 animate-in zoom-in duration-300">
           <div className={`p-12 rounded-[3rem] max-w-md w-full text-center shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}`}>
              <div className="w-20 h-20 bg-red-600/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <h3 className={`text-2xl font-black uppercase tracking-tighter mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Protocolo de Exclusão</h3>
              <p className={`text-xs font-medium mb-10 leading-relaxed uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Você está prestes a apagar definitivamente <span className="font-black text-red-500">{mediaToDelete.length} ativo(s)</span>.<br/>Esta ação é irreversível e será auditada.
              </p>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setMediaToDelete(null)} className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>Abortar</button>
                 <button onClick={() => deleteMediaBatch(mediaToDelete.map(m => m.id))} className="py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-900/40">Confirmar</button>
              </div>
           </div>
        </div>
      )}

      {isUploading && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-center justify-center">
          <div className="flex flex-col items-center">
            <TacticalLogo size="24" pulsing={true} />
            <h2 className="text-xl font-black text-white uppercase tracking-widest mt-8 italic text-center">Sincronizando Inteligência...</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
