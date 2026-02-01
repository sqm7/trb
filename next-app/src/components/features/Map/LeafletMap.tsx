'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import osmtogeojson from 'osmtogeojson';
import { Search, Layers, Upload, Loader2, Map as MapIcon, Building } from 'lucide-react';

// Fix Leaflet default icon issue
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Map Styles
const MAP_STYLES = {
    cartoDark: {
        name: '暗色風格 (CartoDB)',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    },
    osmDefault: {
        name: '標準地圖 (OSM)',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    },
    googleHybrid: {
        name: '衛星影像 (Google)',
        url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        attribution: '&copy; Google'
    }
};

// Component to handle map moves for Overpass loading
function MapEvents({ onMoveEnd }: { onMoveEnd: () => void }) {
    const map = useMapEvents({
        moveend: () => onMoveEnd(),
    });
    return null;
}

export default function LeafletMap() {
    const [style, setStyle] = useState<keyof typeof MAP_STYLES>('cartoDark');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [markers, setMarkers] = useState<{ lat: number; lng: number; name: string }[]>([]);
    const [showBuildings, setShowBuildings] = useState(false);
    const [isLoadingBuildings, setIsLoadingBuildings] = useState(false);
    const [geoJsonData, setGeoJsonData] = useState<any>(null);
    const mapRef = useRef<L.Map | null>(null);

    // Load OSM Buildings via Overpass API
    const loadBuildings = async () => {
        if (!mapRef.current || !showBuildings) return;

        const map = mapRef.current;
        if (map.getZoom() < 15) return; // Too zoomed out

        setIsLoadingBuildings(true);
        const bounds = map.getBounds();
        const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
        const query = `[out:json][timeout:25];(way["building"](${bbox});relation["building"](${bbox}););out body;>;out skel qt;`;

        try {
            const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            const data = await res.json();
            const geojson = osmtogeojson(data);
            setGeoJsonData(geojson);
        } catch (e) {
            console.error("Failed to load buildings", e);
        } finally {
            setIsLoadingBuildings(false);
        }
    };

    // Address Search
    const handleSearch = async () => {
        if (!searchQuery) return;
        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
            const data = await res.json();
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const latLng = { lat: parseFloat(lat), lng: parseFloat(lon) };

                setMarkers([{ ...latLng, name: display_name }]);
                mapRef.current?.flyTo([latLng.lat, latLng.lng], 17);
            }
        } catch (e) {
            console.error("Search failed", e);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Control Panel (Glassmorphism) */}
            <div className="absolute top-4 left-4 z-[500] w-80 flex flex-col gap-4">

                {/* Search */}
                <div className="bg-zinc-900/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
                    <div className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="輸入地址或地標..."
                                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isSearching ? <Loader2 className="animate-spin h-4 w-4" /> : 'Go'}
                        </button>
                    </div>

                    {/* Style Switcher */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                            <MapIcon className="h-3 w-3" /> 地圖風格
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.entries(MAP_STYLES).map(([key, s]) => (
                                <button
                                    key={key}
                                    onClick={() => setStyle(key as any)}
                                    className={`text-xs p-2 rounded-lg border transition-all ${style === key ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-zinc-800/50 border-transparent text-zinc-400 hover:bg-zinc-800'}`}
                                >
                                    {s.name.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Layer Control */}
                <div className="bg-zinc-900/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-zinc-200">
                            <Building className="h-4 w-4 text-orange-400" />
                            <span>3D 建物模型</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={showBuildings} onChange={(e) => {
                                setShowBuildings(e.target.checked);
                                if (e.target.checked) loadBuildings();
                                else setGeoJsonData(null);
                            }} className="sr-only peer" />
                            <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                    </div>

                    {isLoadingBuildings && (
                        <div className="text-xs text-orange-400 flex items-center gap-2 animate-pulse">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            載入周邊建物資訊...
                        </div>
                    )}

                    <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                            <Upload className="h-4 w-4" />
                            <span>手動上傳 GeoJSON</span>
                        </div>
                        <input
                            type="file"
                            accept=".geojson,.json"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                        try {
                                            setGeoJsonData(JSON.parse(ev.target?.result as string));
                                        } catch (err) {
                                            alert('Invalid GeoJSON');
                                        }
                                    };
                                    reader.readAsText(file);
                                }
                            }}
                            className="block w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-cyan-400 hover:file:bg-zinc-700"
                        />
                    </div>
                </div>

            </div>

            <MapContainer
                center={[25.0478, 121.5318]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                // @ts-ignore
                ref={mapRef}
            >
                <TileLayer
                    url={MAP_STYLES[style].url}
                    attribution={MAP_STYLES[style].attribution}
                />

                <MapEvents onMoveEnd={() => showBuildings && loadBuildings()} />

                {markers.map((m, i) => (
                    <Marker key={i} position={[m.lat, m.lng]}>
                        <Popup>{m.name}</Popup>
                    </Marker>
                ))}

                {/* GeoJSON Layer (Buildings or Uploaded) */}
                {geoJsonData && (
                    // @ts-ignore - Dynamic import makes type checking hard for react-leaflet components
                    <DynamicGeoJSON data={geoJsonData} />
                )}
            </MapContainer>
        </div>
    );
}

// Wrapper to handle GeoJSON updates properly
import { GeoJSON } from 'react-leaflet';
function DynamicGeoJSON({ data }: { data: any }) {
    return <GeoJSON key={JSON.stringify(data).slice(0, 100)} data={data} style={{
        color: "#f97316",
        weight: 1,
        opacity: 0.7,
        fillColor: "#fdba74",
        fillOpacity: 0.2
    }} />;
}
