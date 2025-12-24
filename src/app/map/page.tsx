'use client'

import EnhancedIndonesiaMap from '@/components/map/enhancedindonesiamap';
export default function Page() {
    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-green-50">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Peta Rupabumi Indonesia
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Eksplorasi peta topografi resmi Indonesia menggunakan teknologi Vector Tile dari Badan Informasi Geospasial
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-7xl mx-auto">
                    <div className="h-[600px]">
                        <EnhancedIndonesiaMap />
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg p-6 shadow-lg">
                        <h3 className="font-semibold text-lg mb-2 text-blue-600">Data Resmi</h3>
                        <p className="text-gray-600 text-sm">
                            Menggunakan data vector tile resmi dari Badan Informasi Geospasial Indonesia
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-lg">
                        <h3 className="font-semibold text-lg mb-2 text-green-600">Interaktif</h3>
                        <p className="text-gray-600 text-sm">
                            Zoom, pan, dan klik pada peta untuk mendapatkan informasi koordinat real-time
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-lg">
                        <h3 className="font-semibold text-lg mb-2 text-purple-600">Modern</h3>
                        <p className="text-gray-600 text-sm">
                            Dibangun dengan OpenLayers dan React untuk performa yang optimal
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
