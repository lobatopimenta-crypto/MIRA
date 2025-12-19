
import React, { useEffect, useRef } from 'react';
import { DroneMedia } from '../types';

// @ts-ignore
const L = window.L;

interface MapViewProps {
  mediaList: DroneMedia[];
  onMarkerClick: (media: DroneMedia) => void;
  onDelete: (id: string) => void;
  onFullScreen: (media: DroneMedia) => void;
  center?: [number, number];
  onDownload: (media: DroneMedia) => void;
  onMapClick?: (lat: number, lng: number) => void;
  selectedId?: string;
  previewLocation?: {lat: number, lng: number} | null;
  isManualMode?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ 
  mediaList, 
  onMarkerClick, 
  onDelete, 
  onFullScreen, 
  center, 
  onDownload, 
  onMapClick, 
  selectedId,
  previewLocation,
  isManualMode = false
}) => {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clusterGroupRef = useRef<any>(null);
  const previewMarkerRef = useRef<any>(null);
  
  const onMapClickRef = useRef(onMapClick);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      zoomControl: false
    }).setView(center || [-3.7172, -38.5283], 11);

    // Zoom no canto inferior direito, acima do seletor de camadas se necessário
    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Esri'
    });

    satelliteLayer.addTo(mapRef.current); 

    const baseMaps = {
      "🗺️ Mapa Urbano": streetLayer,
      "🛰️ Visão Satélite": satelliteLayer
    };

    // Controle de camadas movido para 'bottomright' e 'collapsed: true' para menos poluição
    L.control.layers(baseMaps, {}, { 
      position: 'bottomright', 
      collapsed: true 
    }).addTo(mapRef.current);

    clusterGroupRef.current = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 40,
        spiderfyOnMaxZoom: true,
        disableClusteringAtZoom: 18
    });
    mapRef.current.addLayer(clusterGroupRef.current);

    mapRef.current.on('click', (e: any) => {
      if (onMapClickRef.current) {
        onMapClickRef.current(e.latlng.lat, e.latlng.lng);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    if (isManualMode) {
      containerRef.current.style.cursor = 'crosshair';
      containerRef.current.classList.add('map-targeting-mode');
    } else {
      containerRef.current.style.cursor = '';
      containerRef.current.classList.remove('map-targeting-mode');
    }
  }, [isManualMode]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (previewMarkerRef.current) {
      mapRef.current.removeLayer(previewMarkerRef.current);
      previewMarkerRef.current = null;
    }
    if (previewLocation) {
      const previewIcon = L.divIcon({
        className: 'preview-marker-icon',
        html: `<div style="background-color: #f59e0b; width: 24px; height: 24px; border: 4px solid white; border-radius: 50%; box-shadow: 0 0 20px rgba(245, 158, 11, 0.6); animation: pulse 1.5s infinite;"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      previewMarkerRef.current = L.marker([previewLocation.lat, previewLocation.lng], { icon: previewIcon }).addTo(mapRef.current);
      mapRef.current.setView([previewLocation.lat, previewLocation.lng], 17, { animate: true });
    }
  }, [previewLocation]);

  useEffect(() => {
    if (!mapRef.current || !clusterGroupRef.current) return;
    clusterGroupRef.current.clearLayers();

    const geoMedia = mediaList.filter(m => m.hasGps && m.latitude && m.longitude);
    geoMedia.forEach(m => {
      const isSelected = m.id === selectedId;
      const markerColor = m.type === 'video' ? '#ef4444' : '#2563eb';
      
      const iconHtml = isSelected 
        ? `<div style="background-color: ${markerColor}; width: 26px; height: 26px; border: 5px solid white; border-radius: 50%; box-shadow: 0 0 20px ${markerColor}, 0 0 10px white; transform: scale(1.15);"></div>`
        : `<div style="background-color: ${markerColor}; width: 16px; height: 16px; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`;

      const customIcon = L.divIcon({
        className: `custom-div-icon ${isSelected ? 'active-mira-marker' : ''}`,
        html: iconHtml,
        iconSize: isSelected ? [26, 26] : [16, 16],
        iconAnchor: isSelected ? [13, 13] : [8, 8]
      });

      const marker = L.marker([m.latitude!, m.longitude!], { 
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 0
      });
      
      const tooltipContent = `<div class="p-1 font-black text-[10px] uppercase">${m.name}</div>`;
      marker.bindTooltip(tooltipContent, { direction: 'top', offset: [0, -12], className: 'mira-marker-tooltip' });

      const popupContent = document.createElement('div');
      popupContent.className = 'w-64 overflow-hidden rounded-2xl';
      popupContent.innerHTML = `
        <div class="bg-slate-900 text-white px-4 py-2.5 flex flex-col">
          <span class="text-[8px] font-black uppercase tracking-[0.3em] text-blue-400">${m.type === 'video' ? 'SENSOR DE VÍDEO' : 'SENSOR DE IMAGEM'}</span>
          <span class="text-xs font-black">${m.name}</span>
        </div>
        <div class="p-3 bg-white">
          <div class="relative rounded-xl overflow-hidden mb-3 shadow-md group cursor-pointer" id="popup-img-${m.id}">
             <img src="${m.previewUrl}" class="w-full h-32 object-cover" />
             <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="text-white text-[9px] font-black uppercase tracking-widest bg-blue-600 px-4 py-1.5 rounded-full">Ver tela cheia</span>
             </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button class="inspect-btn w-full bg-slate-800 text-white text-[9px] py-2 rounded-lg font-black uppercase">Inspecionar</button>
            <button class="download-btn w-full bg-slate-100 text-slate-600 text-[9px] py-2 rounded-lg font-black uppercase">Baixar</button>
          </div>
          <button class="delete-btn w-full mt-2 bg-red-50 text-red-500 text-[9px] py-2 rounded-lg font-black uppercase">Excluir</button>
        </div>
      `;
      
      popupContent.querySelector(`#popup-img-${m.id}`)?.addEventListener('click', () => onFullScreen(m));
      popupContent.querySelector('.inspect-btn')?.addEventListener('click', () => onMarkerClick(m));
      popupContent.querySelector('.download-btn')?.addEventListener('click', () => onDownload(m));
      popupContent.querySelector('.delete-btn')?.addEventListener('click', () => onDelete(m.id));

      marker.bindPopup(popupContent, { padding: [0, 0], minWidth: 256 });
      clusterGroupRef.current.addLayer(marker);
    });

    if (geoMedia.length > 0 && !center && !previewLocation) {
      const bounds = L.latLngBounds(geoMedia.map(m => [m.latitude!, m.longitude!]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [mediaList, selectedId]);

  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.setView(center, 18, { animate: true });
    }
  }, [center]);

  return (
    <>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .active-mira-marker {
          z-index: 1000 !important;
        }
        .active-mira-marker div {
          animation: mira-glow 2s infinite ease-in-out;
        }
        @keyframes mira-glow {
          0% { box-shadow: 0 0 5px rgba(255,255,255,0.5); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 10px white; }
          100% { box-shadow: 0 0 5px rgba(255,255,255,0.5); }
        }
        .map-targeting-mode {
          filter: grayscale(0.2) contrast(1.1);
        }
        
        .leaflet-control-layers {
            border-radius: 12px !important;
            border: 1px solid rgba(15, 23, 42, 0.2) !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
            background: rgba(255,255,255,0.9) !important;
            backdrop-filter: blur(4px);
            margin-bottom: 20px !important;
            margin-right: 12px !important;
        }
        .leaflet-control-layers-toggle {
            width: 36px !important;
            height: 36px !important;
            background-size: 20px 20px !important;
        }
        .leaflet-control-layers-list span {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #1e293b;
        }
        .leaflet-control-zoom {
            border: none !important;
            margin-right: 12px !important;
            margin-bottom: 70px !important; /* Acima do seletor de camadas */
        }
        .leaflet-control-zoom-in, .leaflet-control-zoom-out {
            border-radius: 8px !important;
            background: rgba(255,255,255,0.9) !important;
            backdrop-filter: blur(4px) !important;
            color: #1e293b !important;
            border: 1px solid rgba(15, 23, 42, 0.1) !important;
            margin-bottom: 4px !important;
        }
      `}</style>
      <div ref={containerRef} className="w-full h-full z-10 transition-all duration-300" />
    </>
  );
};

export default MapView;
