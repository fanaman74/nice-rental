"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface RoomGalleryProps {
  images: string[];
  roomName: string;
}

export function RoomGallery({ images, roomName }: RoomGalleryProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  function prev() {
    setLightbox((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }

  function next() {
    setLightbox((i) => (i === null ? null : (i + 1) % images.length));
  }

  return (
    <>
      {/* Gallery — Airbnb style: 1 large left + 3 stacked right */}
      <div className="flex gap-2 h-[520px] rounded-2xl overflow-hidden">
        {/* Large hero image — left half */}
        <div
          className="relative flex-1 overflow-hidden cursor-pointer bg-zinc-100"
          onClick={() => setLightbox(0)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[0]}
            alt={`${roomName} — photo 1`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Right column — 3 equal-height stacked images */}
        <div className="flex flex-col gap-2 w-[42%]">
          {images.slice(1, 4).map((src, i) => (
            <div
              key={i}
              className="relative flex-1 overflow-hidden cursor-pointer bg-zinc-100"
              onClick={() => setLightbox(i + 1)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${roomName} — photo ${i + 2}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              {i === 2 && (
                <div className="absolute inset-0 bg-black/20 flex items-end justify-end p-4">
                  <span className="text-white text-sm font-semibold bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
                    View all photos
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 rounded-full p-2 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {lightbox + 1} / {images.length}
          </div>

          {/* Prev */}
          <button
            className="absolute left-4 text-white/70 hover:text-white bg-white/10 rounded-full p-3 transition-colors"
            onClick={(e) => { e.stopPropagation(); prev(); }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Image */}
          <div className="max-w-4xl max-h-[80vh] w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightbox]}
              alt={`${roomName} — photo ${lightbox + 1}`}
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          {/* Next */}
          <button
            className="absolute right-4 text-white/70 hover:text-white bg-white/10 rounded-full p-3 transition-colors"
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </>
  );
}
