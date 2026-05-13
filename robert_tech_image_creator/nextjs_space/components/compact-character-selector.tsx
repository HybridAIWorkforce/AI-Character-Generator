'use client';

import { useState, useEffect } from 'react';
import { CharacterSetWithReferences } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Check, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface CompactCharacterSelectorProps {
  selectedCharacterSet: CharacterSetWithReferences | null;
  onSelect: (characterSet: CharacterSetWithReferences | null) => void;
}

export function CompactCharacterSelector({ selectedCharacterSet, onSelect }: CompactCharacterSelectorProps) {
  const [characterSets, setCharacterSets] = useState<CharacterSetWithReferences[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState<Record<string, string[]>>({});

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCharacterSet && !imageUrls[selectedCharacterSet.id]) {
      fetchReferenceImages(selectedCharacterSet);
    }
  }, [selectedCharacterSet, imageUrls]);

  const fetchReferenceImages = async (set: CharacterSetWithReferences) => {
    try {
      const urls = await Promise.all(
        set.references.map(async (ref) => {
          const response = await fetch('/api/images/signed-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cloudStoragePath: ref.cloudStoragePath }),
          });
          const data = await response.json();
          return data.url;
        })
      );
      setImageUrls(prev => ({ ...prev, [set.id]: urls }));
    } catch (error) {
      console.error('Error fetching reference images:', error);
    }
  };

  const handleSelect = (value: string) => {
    if (value === 'none') {
      onSelect(null);
    } else {
      const set = characterSets.find(s => s.id === value);
      if (set) onSelect(set);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-purple-500/20">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-white">Character Set</span>
          {characterSets.length === 0 && !loading && (
            <span className="text-xs text-purple-300 ml-auto">Create one in the Create tab</span>
          )}
        </div>
        <Select
          value={selectedCharacterSet?.id || 'none'}
          onValueChange={handleSelect}
          disabled={loading || characterSets.length === 0}
        >
          <SelectTrigger className="bg-slate-700 border-purple-500/20 text-white">
            <SelectValue placeholder={loading ? 'Loading...' : 'Select a character set...'} />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-purple-500/20">
            <SelectItem value="none" className="text-purple-300">
              No character set (freestyle)
            </SelectItem>
            {characterSets.map(set => (
              <SelectItem key={set.id} value={set.id} className="text-white">
                {set.name} ({set.references.length} ref{set.references.length !== 1 ? 's' : ''})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Selected set preview strip */}
        {selectedCharacterSet && (
          <div className="flex items-center gap-3 p-2.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <div className="flex -space-x-2 flex-shrink-0">
              {(imageUrls[selectedCharacterSet.id] || []).map((url, i) => (
                <div key={i} className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-slate-800">
                  <Image src={url} alt={`Reference ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
              {!imageUrls[selectedCharacterSet.id] && (
                <div className="flex gap-1">
                  {Array.from({ length: selectedCharacterSet.references.length }).map((_, i) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-slate-600 animate-pulse" />
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{selectedCharacterSet.name}</p>
              {selectedCharacterSet.description && (
                <p className="text-xs text-purple-300 truncate">{selectedCharacterSet.description}</p>
              )}
            </div>
            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
          </div>
        )}

        {!selectedCharacterSet && !loading && characterSets.length > 0 && (
          <div className="flex items-center gap-2 p-2 text-xs text-yellow-300/80">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Without a character set, images won't maintain character consistency</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
