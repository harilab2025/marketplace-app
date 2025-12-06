import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Home, Layers } from 'lucide-react';

interface MapControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetView: () => void;
    onToggleLayers: () => void;
}

const MapControls = ({ onZoomIn, onZoomOut, onResetView, onToggleLayers }: MapControlsProps) => {
    return (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
                variant="outline"
                size="icon"
                onClick={onZoomIn}
                className="bg-white/90 backdrop-blur-sm hover:bg-white"
            >
                <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                onClick={onZoomOut}
                className="bg-white/90 backdrop-blur-sm hover:bg-white"
            >
                <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                onClick={onResetView}
                className="bg-white/90 backdrop-blur-sm hover:bg-white"
            >
                <Home className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                onClick={onToggleLayers}
                className="bg-white/90 backdrop-blur-sm hover:bg-white"
            >
                <Layers className="h-4 w-4" />
            </Button>
        </div>
    );
};

export default MapControls;