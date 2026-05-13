'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  order: number;
}

interface GenerationResultsDisplayProps {
  images: GeneratedImage[];
  generationId: string;
}

export function GenerationResultsDisplay({
  images,
  generationId,
}: GenerationResultsDisplayProps) {
  const [downloadingAll, setDownloadingAll] = useState(false);
  const { toast } = useToast();

  // Format date as DDMonYYYY (e.g., 26Nov2025)
  const formatDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();
    return `${day}${month}${year}`;
  };

  const handleDownloadSingle = async (image: GeneratedImage) => {
    try {
      const filename = `${String(image.order).padStart(3, '0')}_${formatDate()}.png`;
      const downloadUrl = `/api/images/download?imageId=${image.id}&filename=${encodeURIComponent(filename)}`;
      
      // Open download in new window/tab to bypass iframe restrictions
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        title: 'Downloaded',
        description: `Image ${image.order} downloaded successfully`,
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to download image',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    const dateStr = formatDate();

    try {
      // Download each image sequentially
      for (const image of images) {
        const filename = `${String(image.order).padStart(3, '0')}_${dateStr}.png`;
        const downloadUrl = `/api/images/download?imageId=${image.id}&filename=${encodeURIComponent(filename)}`;
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Small delay between downloads to prevent browser blocking
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      toast({
        title: 'Success',
        description: `Downloaded all ${images.length} images`,
      });
    } catch (error) {
      console.error('Error downloading all images:', error);
      toast({
        title: 'Error',
        description: 'Failed to download some images',
        variant: 'destructive',
      });
    } finally {
      setDownloadingAll(false);
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <Card className="bg-slate-800/50 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-400" />
            <div>
              <CardTitle className="text-white">Generated Images</CardTitle>
              <CardDescription className="text-purple-200">
                {images.length} image{images.length !== 1 ? 's' : ''} generated successfully
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={handleDownloadAll}
            disabled={downloadingAll}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloadingAll ? 'Downloading...' : 'Download All'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images
            .sort((a, b) => a.order - b.order)
            .map((image) => (
              <div key={image.id} className="space-y-2">
                <div className="relative aspect-square bg-slate-700/50 rounded-lg overflow-hidden group">
                  <Image
                    src={image.url}
                    alt={image.prompt}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl bg-slate-900 border-purple-500/20">
                        <DialogHeader>
                          <DialogTitle className="text-white">
                            Image {String(image.order).padStart(3, '0')}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="relative aspect-square bg-slate-800 rounded-lg overflow-hidden">
                            <Image
                              src={image.url}
                              alt={image.prompt}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-purple-300 font-semibold">Prompt:</p>
                            <p className="text-sm text-white bg-slate-800 p-3 rounded">
                              {image.prompt}
                            </p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      className="w-full bg-purple-500 hover:bg-purple-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadSingle(image);
                      }}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono text-purple-400">
                    {String(image.order).padStart(3, '0')}_{formatDate()}.png
                  </p>
                  <p className="text-xs text-purple-300 line-clamp-2">{image.prompt}</p>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
