'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';

interface GalleryImage {
  id: string;
  prompt: string;
  url: string;
  characterSetName?: string;
}

export function ExampleGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchRecentImages();
  }, []);

  const fetchRecentImages = async () => {
    try {
      const response = await fetch('/api/generations/recent');
      if (response.ok) {
        const data = await response.json();
        setImages(data ?? []);
      }
    } catch (error) {
      console.error('Error fetching recent images:', error);
    } finally {
      setLoaded(true);
    }
  };

  if (!loaded || images.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4 justify-center">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-medium text-purple-300 uppercase tracking-wider">Recent Creations</h3>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {images.slice(0, 6).map((img) => (
          <div
            key={img.id}
            className="group relative aspect-square bg-slate-800/50 rounded-lg overflow-hidden border border-purple-500/10 hover:border-purple-500/30 transition-colors"
          >
            <Image
              src={img.url}
              alt={img.prompt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 33vw, 16vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2">
              <p className="text-[10px] sm:text-xs text-white line-clamp-2 leading-tight">{img.prompt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
