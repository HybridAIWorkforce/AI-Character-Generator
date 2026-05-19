'use client';

import { useState } from 'react';
import { CharacterSetManager } from './character-set-manager';
import { CompactCharacterSelector } from './compact-character-selector';
import { BatchPromptInput } from './batch-prompt-input';
import { ImageGenerationControls } from './image-generation-controls';
import { GenerationGallery } from './generation-gallery';
import { GenerationResultsDisplay } from './generation-results-display';
import { CharacterSetWithReferences, AspectRatio } from '@/lib/types';
import { Camera, Sparkles, History } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabValue = 'create' | 'generate' | 'history';

interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  order: number;
}

export function ImageCreator() {
  const [selectedCharacterSet, setSelectedCharacterSet] = useState<CharacterSetWithReferences | null>(null);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<TabValue>('create');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentGenerationId, setCurrentGenerationId] = useState<string>('');

  const handleCharacterSetSelect = (characterSet: CharacterSetWithReferences | null) => {
    setSelectedCharacterSet(characterSet);
    if (characterSet && characterSet.samplePrompts && characterSet.samplePrompts.length > 0) {
      setPrompts(characterSet.samplePrompts);
    } else {
      setPrompts([]);
    }
  };

  const handleGenerationComplete = (images: GeneratedImage[], generationId: string) => {
    setGeneratedImages(images);
    setCurrentGenerationId(generationId);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Custom Tab Navigation */}
      <div className="grid w-full max-w-md mx-auto grid-cols-3 bg-slate-800/50 border border-purple-500/20 rounded-md p-1">
        <button
          onClick={() => setActiveTab('create')}
          className={cn(
            'inline-flex items-center justify-center rounded-sm px-3 py-2 text-sm font-medium transition-all',
            'hover:bg-purple-500/10',
            activeTab === 'create' ? 'bg-purple-500/20 text-white' : 'text-slate-300'
          )}
          aria-label="Create character sets"
        >
          <Camera className="w-4 h-4 mr-2" />
          Create
        </button>
        <button
          onClick={() => setActiveTab('generate')}
          className={cn(
            'inline-flex items-center justify-center rounded-sm px-3 py-2 text-sm font-medium transition-all',
            'hover:bg-purple-500/10',
            activeTab === 'generate' ? 'bg-purple-500/20 text-white' : 'text-slate-300'
          )}
          aria-label="Generate images"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            'inline-flex items-center justify-center rounded-sm px-3 py-2 text-sm font-medium transition-all',
            'hover:bg-purple-500/10',
            activeTab === 'history' ? 'bg-purple-500/20 text-white' : 'text-slate-300'
          )}
          aria-label="View generation history"
        >
          <History className="w-4 h-4 mr-2" />
          History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'create' && (
        <div className="space-y-6 mt-6">
          <CharacterSetManager
            selectedCharacterSet={selectedCharacterSet}
            onSelect={handleCharacterSetSelect}
          />
        </div>
      )}

      {activeTab === 'generate' && (
        <div className="space-y-5 mt-6 max-w-2xl mx-auto">
          {/* Step 1: Character Set */}
          <CompactCharacterSelector
            selectedCharacterSet={selectedCharacterSet}
            onSelect={handleCharacterSetSelect}
          />

          {/* Step 2: Prompts */}
          <BatchPromptInput prompts={prompts} onPromptsChange={setPrompts} />

          {/* Step 3: Generate */}
          <ImageGenerationControls
            prompts={prompts}
            characterSetId={selectedCharacterSet?.id}
            characterSetName={selectedCharacterSet?.name}
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
            onGenerationComplete={handleGenerationComplete}
          />

          {/* Results */}
          {generatedImages.length > 0 && (
            <GenerationResultsDisplay
              images={generatedImages}
              generationId={currentGenerationId}
            />
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="mt-6">
          <GenerationGallery key={refreshTrigger} />
        </div>
      )}
    </div>
  );
}
