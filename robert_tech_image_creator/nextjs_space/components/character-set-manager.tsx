'use client';

import { useState, useEffect } from 'react';
import { CharacterSetWithReferences } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, Users, Image as ImageIcon, Sparkles } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CharacterSetManagerProps {
  selectedCharacterSet: CharacterSetWithReferences | null;
  onSelect: (characterSet: CharacterSetWithReferences | null) => void;
  compact?: boolean;
}

export function CharacterSetManager({
  selectedCharacterSet,
  onSelect,
  compact = false,
}: CharacterSetManagerProps) {
  const [characterSets, setCharacterSets] = useState<CharacterSetWithReferences[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [characterSetToDelete, setCharacterSetToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchCharacterSets();
  }, []);

  const fetchCharacterSets = async () => {
    try {
      const response = await fetch('/api/character-sets');
      if (response.ok) {
        const data = await response.json();
        setCharacterSets(data ?? []);
      }
    } catch (error) {
      console.error('Error fetching character sets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load character sets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFiles = [...referenceFiles];
      newFiles[index] = file;
      setReferenceFiles(newFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || referenceFiles.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a name and at least one reference image',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (description) formData.append('description', description);
      
      referenceFiles.forEach((file, index) => {
        if (file) formData.append(`reference${index + 1}`, file);
      });

      const response = await fetch('/api/character-sets', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newCharacterSet = await response.json();
        setCharacterSets((prev) => [newCharacterSet, ...prev]);
        toast({
          title: 'Success',
          description: 'Character set created successfully',
        });
        setName('');
        setDescription('');
        setReferenceFiles([]);
        setDialogOpen(false);
      } else {
        throw new Error('Failed to create character set');
      }
    } catch (error) {
      console.error('Error creating character set:', error);
      toast({
        title: 'Error',
        description: 'Failed to create character set',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!characterSetToDelete) return;

    try {
      const response = await fetch(`/api/character-sets/${characterSetToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCharacterSets((prev) => prev.filter((cs) => cs.id !== characterSetToDelete));
        if (selectedCharacterSet?.id === characterSetToDelete) {
          onSelect(null);
        }
        toast({
          title: 'Success',
          description: 'Character set deleted successfully',
        });
      } else {
        throw new Error('Failed to delete character set');
      }
    } catch (error) {
      console.error('Error deleting character set:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete character set',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setCharacterSetToDelete(null);
    }
  };

  const getReferenceImageUrls = async (characterSet: CharacterSetWithReferences) => {
    const urls = await Promise.all(
      characterSet.references.map(async (ref) => {
        const response = await fetch('/api/images/signed-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cloudStoragePath: ref.cloudStoragePath }),
        });
        const data = await response.json();
        return data.url;
      })
    );
    return urls;
  };

  return (
    <Card className="bg-slate-800/50 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <div>
              <CardTitle className="text-white">Character Sets</CardTitle>
              <CardDescription className="text-purple-200">
                {compact ? 'Select a character set' : 'Manage your character reference sets'}
              </CardDescription>
            </div>
          </div>
          {!compact && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-500 hover:bg-purple-600">
                  <Upload className="w-4 h-4 mr-2" />
                  New Set
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-purple-500/20 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white">Create Character Set</DialogTitle>
                  <DialogDescription className="text-purple-200">
                    Upload up to 3 reference images for character consistency
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Hero Character"
                      className="bg-slate-700 border-purple-500/20 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-white">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe this character set..."
                      className="bg-slate-700 border-purple-500/20 text-white"
                      rows={3}
                    />
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-1.5">
                    <p className="text-sm font-medium text-blue-300">Tips for better character consistency:</p>
                    <ul className="text-xs text-blue-200/80 space-y-1 list-disc list-inside">
                      <li>Use <strong>high-resolution</strong> images (at least 512×512 px)</li>
                      <li>Include <strong>varied angles</strong>: close-up, mid-shot, and full body</li>
                      <li>Ensure <strong>consistent lighting</strong> and clear facial features</li>
                      <li>Avoid heavily filtered, blurry, or stylized images</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Reference Images (1-3)</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {[0, 1, 2].map((index) => (
                        <div key={index} className="space-y-2">
                          <Label
                            htmlFor={`ref-${index}`}
                            className="cursor-pointer block aspect-square bg-slate-700/50 border-2 border-dashed border-purple-500/30 rounded-lg hover:border-purple-500/50 transition-colors relative overflow-hidden"
                          >
                            {referenceFiles[index] ? (
                              <div className="relative w-full h-full">
                                <Image
                                  src={URL.createObjectURL(referenceFiles[index])}
                                  alt={`Reference ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full">
                                <ImageIcon className="w-8 h-8 text-purple-400 mb-2" />
                                <span className="text-xs text-purple-300">Upload #{index + 1}</span>
                              </div>
                            )}
                          </Label>
                          <Input
                            id={`ref-${index}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, index)}
                            className="hidden"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      className="border-purple-500/20"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={uploading}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      {uploading ? 'Creating...' : 'Create Set'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-800/30 rounded-lg p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="aspect-square rounded" />
                  <Skeleton className="aspect-square rounded" />
                  <Skeleton className="aspect-square rounded" />
                </div>
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : characterSets.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No Character Sets Yet"
            description="Create your first character set with reference images to start generating consistent stories"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {characterSets.map((set) => (
              <CharacterSetCard
                key={set.id}
                characterSet={set}
                isSelected={selectedCharacterSet?.id === set.id}
                onSelect={() => onSelect(selectedCharacterSet?.id === set.id ? null : set)}
                onDelete={() => {
                  setCharacterSetToDelete(set.id);
                  setDeleteDialogOpen(true);
                }}
                getReferenceImageUrls={getReferenceImageUrls}
                hideDelete={compact}
              />
            ))}
          </div>
        )}
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-purple-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Character Set?</AlertDialogTitle>
            <AlertDialogDescription className="text-purple-200">
              This action cannot be undone. This will permanently delete the character set and all its reference images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-purple-500/20">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function CharacterSetCard({
  characterSet,
  isSelected,
  onSelect,
  onDelete,
  getReferenceImageUrls,
  hideDelete,
}: {
  characterSet: CharacterSetWithReferences;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  getReferenceImageUrls: (set: CharacterSetWithReferences) => Promise<string[]>;
  hideDelete?: boolean;
}) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    getReferenceImageUrls(characterSet).then(setImageUrls);
  }, [characterSet, getReferenceImageUrls]);

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected
          ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20'
          : 'bg-slate-700/50 border-purple-500/20 hover:border-purple-500/40'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-white">{characterSet.name}</h3>
            {characterSet.description && (
              <p className="text-xs text-purple-300 mt-1">{characterSet.description}</p>
            )}
          </div>
          {!hideDelete && (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative aspect-square bg-slate-600/50 rounded overflow-hidden">
              <Image
                src={url}
                alt={`Reference ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="text-xs text-purple-300">
          {characterSet.references.length} reference{characterSet.references.length !== 1 ? 's' : ''}
        </div>
      </CardContent>
    </Card>
  );
}
