'use client';

import { useEffect, useRef, useState } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import TileWMS from 'ol/source/TileWMS';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls, ScaleLine, FullScreen, ZoomToExtent } from 'ol/control';
import 'ol/ol.css';
import BaseEvent from 'ol/events/Event';
interface AlternativeMapComponentProps {
    className?: string;
}

const AlternativeMapComponent: React.FC<AlternativeMapComponentProps> = ({ className = '' }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<Map | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeSource, setActiveSource] = useState<'osm' | 'big-wms' | 'big-xyz'>('osm');

    useEffect(() => {
        if (!mapRef.current) return;

        try {
            // Base layer - OpenStreetMap
            const osmLayer = new TileLayer({
                source: new XYZ({
                    url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    attributions: '© OpenStreetMap contributors'
                }),
                visible: true
            });

            // BIG Layer sebagai WMS
            const bigWMSLayer = new TileLayer({
                source: new TileWMS({
                    url: 'https://geoservices.big.go.id/rbi/rest/services/Hosted/Rupabumi_Indonesia/MapServer/WMSServer',
                    params: {
                        'LAYERS': '0',
                        'TILED': true,
                        'FORMAT': 'image/png',
                        'TRANSPARENT': true
                    },
                    attributions: '© Badan Informasi Geospasial (BIG)',
                    crossOrigin: 'anonymous'
                }),
                visible: false,
                opacity: 0.8
            });

            // BIG Layer sebagai XYZ tiles
            const bigXYZLayer = new TileLayer({
                source: new XYZ({
                    url: 'https://geoservices.big.go.id/rbi/rest/services/Hosted/Rupabumi_Indonesia/MapServer/tile/{z}/{y}/{x}',
                    attributions: '© Badan Informasi Geospasial (BIG)',
                    crossOrigin: 'anonymous',
                    maxZoom: 18
                }),
                visible: false,
                opacity: 0.8
            });

            // Inisialisasi peta
            const map = new Map({
                target: mapRef.current,
                layers: [osmLayer, bigWMSLayer, bigXYZLayer],
                view: new View({
                    center: fromLonLat([118.0, -2.0]),
                    zoom: 5,
                    minZoom: 3,
                    maxZoom: 18
                }),
                controls: defaultControls().extend([
                    new ScaleLine(),
                    new FullScreen(),
                    new ZoomToExtent({
                        extent: fromLonLat([95, -11]).concat(fromLonLat([141, 6]))
                    })
                ])
            });

            mapInstanceRef.current = map;

            // Event listeners untuk monitoring loading
            const handleTileLoadStart = () => setLoading(true);
            const handleTileLoadEnd = () => setLoading(false);
            const handleTileLoadError = (event: BaseEvent | Event): void => {
                console.error('Tile load error:', event);
                setError('Gagal memuat beberapa tiles. Coba beralih ke sumber lain.');
                setLoading(false);
            };

            // Attach event listeners ke semua layers
            [osmLayer, bigWMSLayer, bigXYZLayer].forEach(layer => {
                const source = layer.getSource();
                if (source) {
                    source?.on('tileloadstart', handleTileLoadStart);
                    source?.on('tileloadend', handleTileLoadEnd);
                    source?.on(['tileloaderror'], handleTileLoadError);
                }
            });

            setLoading(false);

        } catch (err) {
            console.error('Error initializing map:', err);
            setError('Gagal menginisialisasi peta');
            setLoading(false);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setTarget(undefined);
            }
        };
    }, []);

    // Fungsi untuk beralih sumber peta
    const switchSource = (source: 'osm' | 'big-wms' | 'big-xyz') => {
        if (!mapInstanceRef.current) return;

        const layers = mapInstanceRef.current.getLayers().getArray();
        const [osmLayer, bigWMSLayer, bigXYZLayer] = layers;

        // Sembunyikan semua layer
        osmLayer.setVisible(false);
        bigWMSLayer.setVisible(false);
        bigXYZLayer.setVisible(false);

        // Tampilkan layer yang dipilih
        switch (source) {
            case 'osm':
                osmLayer.setVisible(true);
                break;
            case 'big-wms':
                osmLayer.setVisible(true); // Keep OSM as base
                bigWMSLayer.setVisible(true);
                break;
            case 'big-xyz':
                osmLayer.setVisible(true); // Keep OSM as base
                bigXYZLayer.setVisible(true);
                break;
        }

        setActiveSource(source);
        setError(null);
    };

    return (
        <div className={`relative ${className}`}>
            <div
                ref={mapRef}
                className="w-full h-full bg-gray-100"
                style={{ minHeight: '400px' }}
            />

            {loading && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-gray-700">Memuat peta...</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="mt-1 text-xs underline hover:no-underline"
                    >
                        Tutup
                    </button>
                </div>
            )}

            {/* Source Switcher Panel */}
            <div className="absolute top-4 left-4 bg-white bg-opacity-95 p-4 rounded-lg shadow-lg max-w-xs">
                <h3 className="font-bold text-sm mb-3">Sumber Peta</h3>
                <div className="space-y-2">
                    <button
                        onClick={() => switchSource('osm')}
                        className={`w-full px-3 py-2 text-sm rounded transition-colors ${activeSource === 'osm'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        OpenStreetMap
                    </button>
                    <button
                        onClick={() => switchSource('big-wms')}
                        className={`w-full px-3 py-2 text-sm rounded transition-colors ${activeSource === 'big-wms'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        BIG WMS Server
                    </button>
                    <button
                        onClick={() => switchSource('big-xyz')}
                        className={`w-full px-3 py-2 text-sm rounded transition-colors ${activeSource === 'big-xyz'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        BIG XYZ Tiles
                    </button>
                </div>

                <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                    <p><strong>Status:</strong> {
                        activeSource === 'osm' ? 'OpenStreetMap (Stabil)' :
                            activeSource === 'big-wms' ? 'BIG WMS (Overlay)' :
                                'BIG XYZ Tiles (Eksperimental)'
                    }</p>
                </div>
            </div>

            {/* Info Panel */}
            <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-3 rounded shadow-lg max-w-sm">
                <h3 className="font-bold text-sm mb-1">Peta Indonesia</h3>
                <p className="text-xs text-gray-600 mb-2">
                    {activeSource === 'osm' && 'Menggunakan OpenStreetMap sebagai base map'}
                    {activeSource === 'big-wms' && 'Data BIG melalui WMS Server dengan base OSM'}
                    {activeSource === 'big-xyz' && 'Data BIG melalui XYZ Tiles dengan base OSM'}
                </p>

                <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>Koordinat Pusat:</strong> 118°E, 2°S</p>
                    <p><strong>Zoom:</strong> 3-18</p>
                    <p><strong>Proyeksi:</strong> Web Mercator</p>
                </div>
            </div>

            {/* Instructions */}
            <div className="absolute top-4 right-4 bg-yellow-50 border border-yellow-200 p-3 rounded shadow-lg max-w-xs text-xs">
                <h4 className="font-semibold text-yellow-800 mb-1">💡 Tips:</h4>
                <ul className="text-yellow-700 space-y-1">
                    <li>• Jika BIG tiles tidak loading, gunakan OpenStreetMap</li>
                    <li>• WMS Server mungkin lebih lambat tapi lebih stabil</li>
                    <li>• XYZ Tiles lebih cepat jika tidak ada masalah CORS</li>
                </ul>
            </div>
        </div>
    );
};

export default AlternativeMapComponent;