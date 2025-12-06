'use client';
import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, LucideImagePlus } from 'lucide-react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface Photo {
    id: number;
    url: string;
    caption: string;
    file: File;
}

const PhotoGalleryOrganizer: React.FC<{ getFiles: (files: File[]) => void }> = ({ getFiles }) => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [draggedItem, setDraggedItem] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file upload
    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>): void => {
        const files = Array.from(e.target.files || []);
        const newPhotos: Photo[] = files.map((file, index) => ({
            id: Date.now() + index,
            url: URL.createObjectURL(file),
            caption: file.name.split('.')[0],
            file: file
        }));
        if (photos.length === 0) {
            setPhotos(newPhotos);
            getFiles(files);
        } else {
            // filter out duplicate files
            const prev = photos.map(photo => photo.file);
            const existingKeys = new Set(prev.map(f => `${f.name}-${f.size}`));
            const uniqueFiles = files.filter(f => !existingKeys.has(`${f.name}-${f.size}`));
            console.log('Unique Files:', [...prev, ...uniqueFiles]);
            getFiles([...prev, ...uniqueFiles]);

            // Add only unique photos to state
            const uniqueNewPhotos = newPhotos.filter(photo => !existingKeys.has(`${photo.file.name}-${photo.file.size}`));
            setPhotos(exist => [...exist, ...uniqueNewPhotos]);
        }
    };

    // Delete photo
    const deletePhoto = (id: number): void => {
        setPhotos(prev => prev.filter(photo => photo.id !== id));
        getFiles(photos.filter(photo => photo.id !== id).map(photo => photo.file));
    };

    // Drag handlers
    const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number): void => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number): void => {
        e.preventDefault();
        if (draggedItem === null || draggedItem === index) return;

        const newPhotos = [...photos];
        const draggedPhoto = newPhotos[draggedItem];
        newPhotos.splice(draggedItem, 1);
        newPhotos.splice(index, 0, draggedPhoto);

        setPhotos(newPhotos);
        setDraggedItem(index);
        getFiles(newPhotos.map(photo => photo.file));
    };

    const handleDragEnd = (): void => {
        setDraggedItem(null);
    };

    return (
        <div className="w-full h-auto overflow-y-auto border rounded-2xl p-4 bg-slate-50 ">
            <div className="w-full h-full">
                {/* Gallery Grid */}
                {photos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-6 bg-white hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => fileInputRef.current?.click()}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <Upload size={20} />
                        <h1 className="mt-2 text-sm font-semibold text-slate-700">Add Photos</h1>
                    </div>
                ) : (
                    <div className='w-full h-full flex flex-col sm:flex-col md:flex-row sm:justify-center md:items-center gap-2'>
                        <div className="w-full max-w-[450px] mb-2 sm:mb-0">
                            {
                                photos.filter((_, index) => index === 0).map((photo, index) => (
                                    <div
                                        key={photo.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`group relative bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl cursor-move`}
                                    >
                                        {/* Action Buttons */}
                                        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon-sm"
                                                variant="destructive"
                                                onClick={() => deletePhoto(photo.id)}
                                            >
                                                <X />
                                            </Button>
                                        </div>

                                        {/* Image */}
                                        <div className="aspect-square overflow-hidden bg-slate-100">
                                            <Image
                                                src={photo.url}
                                                alt={photo.caption}
                                                width={400}
                                                height={400}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        </div>
                                        {/* Order Badge */}
                                        {index === 0 && <div className="absolute bottom-2 right-2 bg-slate-800/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                                            main
                                        </div>}
                                    </div>
                                ))
                            }
                        </div>
                        <div className="w-full">
                            <div className="w-full flex-1 grid max-[380px]:grid-cols-1 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 overflow-y-auto p-1">
                                {photos.filter((_, index) => index !== 0).map((photo, index) => (
                                    <div
                                        key={photo.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index + 1)}
                                        onDragOver={(e) => handleDragOver(e, index + 1)}
                                        onDragEnd={handleDragEnd}
                                        className={`group relative h-auto min-h-[80px] bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl cursor-move justify-items-center`}
                                    >
                                        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => deletePhoto(photo.id)}
                                                className='w-3 h-5'
                                            >
                                                <X size={12} />
                                            </Button>
                                        </div>

                                        <div className="aspect-square overflow-hidden bg-slate-100">
                                            <Image
                                                src={photo.url}
                                                alt={photo.caption}
                                                width={400}
                                                height={400}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex flex-col h-auto min-h-[80px] items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-3 bg-white hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => fileInputRef.current?.click()}>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                            <LucideImagePlus size={20} />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Add Photos</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhotoGalleryOrganizer;