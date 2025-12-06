'use client';

import PhotoGalleryOrganizer from "@/components/gallery.photos";

export default function Page() {
    return (
        <PhotoGalleryOrganizer getFiles={(files) => {
            console.log("Uploaded files:", files);
        }} />
    )
}
