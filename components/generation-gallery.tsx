'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GenerationWithImages } from '@/lib/types';
import { Download, Image as ImageIcon, Calendar, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function GenerationGallery() {
  const [generations, setGenerations] = useState<GenerationWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGenerations();
  }, []);

  const fetchGenerations = async () => {
    try {
      const response = await fetch('/api/generations');
      if (response.ok) {
        const data = await response.json();
        setGenerations(data ?? []);
      }
    } catch (error) {
      console.error('Error fetching generations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load generation history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (generationId: string, prefix: string) => {
    try {
      const response = await fetch(
        `/api/download?generationId=${generationId}&prefix=${encodeURIComponent(prefix)}`
      );

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${prefix}_images.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'Images downloaded successfully',
      });
    } catch (error) {
      console.error('Error downloading images:', error);
      toast({
        title: 'Error',
        description: 'Failed to download images',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <Card key={i} className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-60" />
                  </div>
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardContent className="py-12">
          <EmptyState
            icon={Sparkles}
            title="No Generations Yet"
            description="Generate some images using the Generate tab to see your creation history here"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {generations.map((generation) => (
        <GenerationCard
          key={generation.id}
          generation={generation}
          onDownload={handleDownload}
        />
      ))}
    </div>
  );
}

function GenerationCard({
  generation,
  onDownload,
}: {
  generation: GenerationWithImages;
  onDownload: (generationId: string, prefix: string) => void;
}) {
  const [downloadPrefix, setDownloadPrefix] = useState('story');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDownloadClick = () => {
    onDownload(generation.id, downloadPrefix);
    setDialogOpen(false);
  };

  // Format date as DDMonYYYY (e.g., 26Nov2025)
  const formatDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();
    return `${day}${month}${year}`;
  };

  const handleDownloadSingleImage = async (image: any) => {
    try {
      const filename = `${String(image.order).padStart(3, '0')}_${formatDate()}.png`;
      const downloadUrl = `/api/images/download?imageId=${image.id}&filename=${encodeURIComponent(filename)}`;
      
      // Open download in new window/tab
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

  return (
    <Card className="bg-slate-800/50 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-400" />
            <div>
              <CardTitle className="text-white">
                {generation.characterSet?.name || 'No Character Set'}
              </CardTitle>
              <CardDescription className="text-purple-200 flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {new Date(generation.createdAt).toLocaleDateString()} •{' '}
                {generation.images.length} image{generation.images.length !== 1 ? 's' : ''} •{' '}
                {generation.aspectRatio}
              </CardDescription>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-500 hover:bg-purple-600">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-purple-500/20">
              <DialogHeader>
                <DialogTitle className="text-white">Download Images</DialogTitle>
                <DialogDescription className="text-purple-200">
                  Download all {generation.images.length} images as a zip file
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prefix" className="text-white">Filename Prefix</Label>
                  <Input
                    id="prefix"
                    value={downloadPrefix}
                    onChange={(e) => setDownloadPrefix(e.target.value)}
                    placeholder="story"
                    className="bg-slate-700 border-purple-500/20 text-white"
                  />
                  <p className="text-xs text-purple-300 mt-1">
                    Images will be named: {downloadPrefix}_001.png, {downloadPrefix}_002.png, etc.
                  </p>
                </div>
                <Button
                  onClick={handleDownloadClick}
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Zip
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {generation.images.map((image) => (
            <div key={image.id} className="space-y-2">
              <div className="relative aspect-square bg-slate-700/50 rounded-lg overflow-hidden group">
                {image.url && (
                  <Image
                    src={image.url}
                    alt={image.prompt}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full"
                      >
                        <ImageIcon className="w-3 h-3 mr-1" />
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
                          {image.url && (
                            <Image
                              src={image.url}
                              alt={image.prompt}
                              fill
                              className="object-contain"
                            />
                          )}
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
                      handleDownloadSingleImage(image);
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
