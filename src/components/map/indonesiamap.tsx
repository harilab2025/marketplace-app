import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import { MVT } from 'ol/format';
import { Style, Fill, Stroke, Text } from 'ol/style';
import 'ol/ol.css';

const IndonesiaMap = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<Map | null>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        // Create vector tile source based on your configuration
        const vectorTileSource = new VectorTileSource({
            format: new MVT(),
            url: 'https://kspservices.big.go.id/satupeta/rest/services/Hosted/Rupabumi_Indonesia/VectorTileServer/tile/{z}/{y}/{x}.pbf',
            maxZoom: 19,
        });

        // Create vector tile layer with styling
        const vectorTileLayer = new VectorTileLayer({
            source: vectorTileSource,
            style: new Style({
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 0.8)',
                }),
                stroke: new Stroke({
                    color: '#319FD3',
                    width: 1,
                }),
                text: new Text({
                    font: '12px Calibri,sans-serif',
                    fill: new Fill({
                        color: '#000',
                    }),
                    stroke: new Stroke({
                        color: '#fff',
                        width: 3,
                    }),
                }),
            }),
        });

        // Convert Web Mercator coordinates to geographic coordinates for center calculation
        const centerX = (10014626.44144775 + 16030647.48977821134) / 2;
        const centerY = (-1567642.22547210427 + 939431.7036822787486) / 2;

        // Create the map instance
        const map = new Map({
            target: mapRef.current,
            layers: [vectorTileLayer],
            view: new View({
                center: [centerX, centerY],
                zoom: 5,
                projection: 'EPSG:3857', // Web Mercator projection
                minZoom: 0,
                maxZoom: 16,
            }),
        });

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setTarget(undefined);
                mapInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div className="relative w-full h-full">
            <div
                ref={mapRef}
                className="w-full h-full rounded-lg shadow-lg"
                style={{ minHeight: '500px' }}
            />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <h3 className="font-semibold text-gray-800">Peta Rupabumi Indonesia</h3>
                <p className="text-sm text-gray-600">Badan Informasi Geospasial</p>
            </div>
        </div>
    );
};

export default IndonesiaMap;