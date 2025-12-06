import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import { MVT } from 'ol/format';
import { defaults as defaultControls } from 'ol/control';
import { toast } from 'sonner';
import olms from 'ol-mapbox-style';
import 'ol/ol.css';
import MapControls from './mapcontrol';
import axios from 'axios';
const EnhancedIndonesiaMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const [showVectorLayer, setShowVectorLayer] = useState(true);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create OSM base layer
    const osmLayer = new TileLayer({
      source: new OSM(),
      opacity: 0.3,
    });

    // Create vector tile source for Indonesian Rupabumi
    const vectorTileSource = new VectorTileSource({
      format: new MVT(),
      url: 'https://geoservices.big.go.id/rbi/rest/services/Hosted/Rupabumi_Indonesia/VectorTileServer/tile/{z}/{y}/{x}.pbf',
      maxZoom: 19,
    });

    // Create vector tile layer with enhanced styling
    const vectorTileLayer = new VectorTileLayer({
      source: vectorTileSource,
      opacity: 0.8,
    });

    // Calculate center point from the extent
    const centerX = (10014626.44144775 + 16030647.48977821134) / 2;
    const centerY = (-1567642.22547210427 + 939431.7036822787486) / 2;

    // Create the map instance
    const map = new Map({
      target: mapRef.current,
      layers: [osmLayer, vectorTileLayer],
      view: new View({
        center: [centerX, centerY],
        zoom: 5,
        projection: 'EPSG:3857',
        minZoom: 0,
        maxZoom: 16,
        extent: [10014626.44144775, -1567642.22547210427, 16030647.48977821134, 939431.7036822787486],
      }),
      controls: defaultControls({
        attribution: false,
        zoom: false,
        rotate: false,
      }),
    });

    mapInstanceRef.current = map;
    let stylejsonfix = {}
    const getjsonstyle = axios.get('https://geoservices.big.go.id/rbi/rest/services/Hosted/Rupabumi_Indonesia/VectorTileServer/resources/styles/root.json?f=json')
    getjsonstyle.then((response) => {
      const stylejson = response.data;
      const draftjson = {
        ...stylejson,
        sprite: "https://geoservices.big.go.id/rbi/rest/services/Hosted/Rupabumi_Indonesia/VectorTileServer/resources/sprites/sprite@2x",
        spriteImage: "https://geoservices.big.go.id/rbi/rest/services/Hosted/Rupabumi_Indonesia/VectorTileServer/resources/sprites/sprite@2x.png",
        spriteJson: "https://geoservices.big.go.id/rbi/rest/services/Hosted/Rupabumi_Indonesia/VectorTileServer/resources/sprites/sprite@2x.json",
        glyphs: "https://geoservices.big.go.id/rbi/rest/services/Hosted/Rupabumi_Indonesia/VectorTileServer/resources/fonts/{fontstack}/{range}.pbf",
        sources: {
          esri: {
            type: "vector",
            tiles: ["https://geoservices.big.go.id/rbi/rest/services/Hosted/Rupabumi_Indonesia/VectorTileServer/tile/{z}/{y}/{x}.pbf"]
          }
        }
      }
      stylejsonfix = draftjson;
      olms(map, stylejsonfix).then(() => {
        toast.success('Gaya peta Rupabumi berhasil diambil');
      }).catch((err) => {
        toast.error('Gagal mengambil gaya peta: ' + err.message);
      });
    }).catch((err) => {
      toast.error('Gagal mengambil gaya peta: ' + err.message);
    });
    // Add click handler for map interaction
    map.on('click', (evt) => {
      const coordinate = evt.coordinate;
      toast.info(`Koordinat: ${coordinate[0].toFixed(2)}, ${coordinate[1].toFixed(2)}`);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleZoomIn = () => {
    const view = mapInstanceRef.current?.getView();
    if (view) {
      const currentZoom = view.getZoom() || 0;
      view.animate({ zoom: currentZoom + 1, duration: 300 });
    }
  };

  const handleZoomOut = () => {
    const view = mapInstanceRef.current?.getView();
    if (view) {
      const currentZoom = view.getZoom() || 0;
      view.animate({ zoom: currentZoom - 1, duration: 300 });
    }
  };

  const handleResetView = () => {
    const view = mapInstanceRef.current?.getView();
    if (view) {
      const centerX = (10014626.44144775 + 16030647.48977821134) / 2;
      const centerY = (-1567642.22547210427 + 939431.7036822787486) / 2;
      view.animate({
        center: [centerX, centerY],
        zoom: 5,
        duration: 1000,
      });
      toast.success('Tampilan peta direset ke Indonesia');
    }
  };

  const handleToggleLayers = () => {
    const layers = mapInstanceRef.current?.getLayers();
    if (layers) {
      const vectorLayer = layers.item(1) as VectorTileLayer<VectorTileSource>;
      const currentOpacity = vectorLayer.getOpacity();
      const newOpacity = currentOpacity > 0 ? 0 : 0.8;
      vectorLayer.setOpacity(newOpacity);
      setShowVectorLayer(newOpacity > 0);
      toast.info(newOpacity > 0 ? 'Layer vektor ditampilkan' : 'Layer vektor disembunyikan');
    }
  };

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg shadow-lg"
        style={{ minHeight: '600px' }}
      />

      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
        <h3 className="font-bold text-lg text-gray-800 mb-1">Peta Rupabumi Indonesia</h3>
        <p className="text-sm text-gray-600 mb-2">Badan Informasi Geospasial (BIG)</p>
        <div className="text-xs text-gray-500">
          <p>• Klik pada peta untuk melihat koordinat</p>
          <p>• Gunakan kontrol di kanan untuk navigasi</p>
          <p className={`mt-1 ${showVectorLayer ? 'text-green-600' : 'text-red-600'}`}>
            Layer Vektor: {showVectorLayer ? 'Aktif' : 'Nonaktif'}
          </p>
        </div>
      </div>

      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        onToggleLayers={handleToggleLayers}
      />

      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-600">
        © BIG Indonesia
      </div>
    </div>
  );
};

export default EnhancedIndonesiaMap;