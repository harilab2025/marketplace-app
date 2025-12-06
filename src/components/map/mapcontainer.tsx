'use client';

import { useEffect, useRef, useState } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls, ScaleLine, FullScreen, ZoomToExtent } from 'ol/control';
import { MVT } from 'ol/format';
import 'ol/ol.css';

interface MapComponentProps {
    className?: string;
}

const MapContainer: React.FC<MapComponentProps> = ({ className = '' }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<Map | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        try {
            // Base map layer (OpenStreetMap sebagai fallback)
            const baseLayer = new TileLayer({
                source: new XYZ({
                    url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    attributions: '© OpenStreetMap contributors'
                }),
                opacity: 0.3
            });

            // Coba beberapa alternatif URL untuk Vector Tile Layer
            const vectorTileUrls = 'https://geoservices.big.go.id/rbi/rest/services/Hosted/Rupabumi_Indonesia/VectorTileServer/tile/{z}/{y}/{x}.pbf';


            // Vector Tile Layer untuk Rupabumi Indonesia
            const vectorTileLayer = new VectorTileLayer({
                source: new VectorTileSource({
                    format: new MVT(),
                    url: vectorTileUrls,
                    attributions: '© Badan Informasi Geospasial (BIG)'
                })
            });

            // Inisialisasi peta dengan view Indonesia
            const map = new Map({
                target: mapRef.current,
                layers: [baseLayer, vectorTileLayer],
                view: new View({
                    center: fromLonLat([118.0, -2.0]), // Koordinat tengah Indonesia
                    zoom: 5,
                    minZoom: 3,
                    maxZoom: 18
                }),
                controls: defaultControls().extend([
                    new ScaleLine(),
                    new FullScreen(),
                    new ZoomToExtent({
                        extent: fromLonLat([95, -11]).concat(fromLonLat([141, 6])) // Extent Indonesia
                    })
                ])
            });

            mapInstanceRef.current = map;

            // Handle loading state untuk vector tiles
            let vectorTileErrorCount = 0;
            const maxErrorCount = 5;

            vectorTileLayer.getSource()?.on('tileloadstart', () => {
                setLoading(true);
            });

            vectorTileLayer.getSource()?.on('tileloadend', () => {
                setLoading(false);
                vectorTileErrorCount = 0; // Reset error count on successful load
            });

            vectorTileLayer.getSource()?.on('tileloaderror', (event) => {
                vectorTileErrorCount++;
                console.error('Vector tile load error:', event);

                if (vectorTileErrorCount >= maxErrorCount) {
                    console.warn('Too many vector tile errors, switching to WMS fallback');
                    setError('Vector tiles tidak dapat diload, beralih ke mode fallback');
                    vectorTileLayer.setVisible(false);
                }
                setLoading(false);
            });

            setLoading(false);

        } catch (err) {
            console.error('Error initializing map:', err);
            setError('Gagal menginisialisasi peta');
            setLoading(false);
        }

        // Cleanup
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setTarget(undefined);
            }
        };
    }, []);
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
                <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* Map Info Panel */}
            <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-3 rounded shadow-lg max-w-sm">
                <h3 className="font-bold text-sm mb-1">Rupabumi Indonesia</h3>
                <p className="text-xs text-gray-600">
                    Peta dasar Indonesia dari Badan Informasi Geospasial (BIG)
                </p>
            </div>
        </div>
    );
};
export default MapContainer;