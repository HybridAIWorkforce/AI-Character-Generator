'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AspectRatio, MAX_PROMPTS } from '@/lib/types';
import { Sparkles, Loader2, AlertCircle, Check, X, Clock, DollarSign } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: '16:9', label: '16:9 (Landscape)' },
  { value: '1:1', label: '1:1 (Square)' },
  { value: '9:16', label: '9:16 (Portrait)' },
  { value: '4:3', label: '4:3 (Standard)' },
];

const COST_PER_IMAGE = 0.04;

interface ImageProgress {
  prompt: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  image?: { id: string; prompt: string; url: string; order: number };
  error?: string;
}

interface ImageGenerationControlsProps {
  prompts: string[];
  characterSetId?: string;
  characterSetName?: string;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onGenerationComplete: (images: Array<{ id: string; prompt: string; url: string; order: number }>, generationId: string) => void;
}

export function ImageGenerationControls({
  prompts,
  characterSetId,
  characterSetName,
  aspectRatio,
  onAspectRatioChange,
  onGenerationComplete,
}: ImageGenerationControlsProps) {
  const [generating, setGenerating] = useState(false);
  const [imageProgress, setImageProgress] = useState<ImageProgress[]>([]);
  const { toast } = useToast();

  const isOverLimit = prompts.length > MAX_PROMPTS;
  const totalCost = COST_PER_IMAGE * prompts.length;
  const completedCount = imageProgress.filter(p => p.status === 'complete').length;
  const errorCount = imageProgress.filter(p => p.status === 'error').length;
  const progressPercent = imageProgress.length > 0 ? ((completedCount + errorCount) / imageProgress.length) * 100 : 0;

  const handleGenerate = async () => {
    if (prompts.length === 0 || isOverLimit) return;

    const initial: ImageProgress[] = prompts.map(p => ({ prompt: p, status: 'pending' as const }));
    setImageProgress(initial);
    setGenerating(true);
    let genId = '';
    const completedImages: Array<{ id: string; prompt: string; url: string; order: number }> = [];

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompts, characterSetId, aspectRatio }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Generation failed');
      }

      if (!response.body) {
        throw new Error('No response stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              switch (data.type) {
                case 'start':
                  genId = data.generationId;
                  break;
                case 'generating':
                  setImageProgress(prev => prev.map((p, i) =>
                    i === data.current - 1 ? { ...p, status: 'generating' } : p
                  ));
                  break;
                case 'image_complete':
                  setImageProgress(prev => prev.map((p, i) =>
                    i === data.current - 1 ? { ...p, status: 'complete', image: data.image } : p
                  ));
                  completedImages.push(data.image);
                  break;
                case 'image_error':
                  setImageProgress(prev => prev.map((p, i) =>
                    i === data.current - 1 ? { ...p, status: 'error', error: data.error } : p
                  ));
                  break;
                case 'complete':
                  break;
              }
            } catch (e) {
              // Ignore parse errors for partial chunks
            }
          }
        }
      }

      if (completedImages.length > 0) {
        toast({
          title: 'Generation Complete',
          description: `Generated ${completedImages.length} of ${prompts.length} image${prompts.length !== 1 ? 's' : ''} successfully`,
        });
      } else {
        toast({
          title: 'Generation Failed',
          description: 'No images were generated. Please try again.',
          variant: 'destructive',
        });
      }

      onGenerationComplete(completedImages, genId);
    } catch (error) {
      console.error('Error generating images:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate images. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-purple-500/20">
      <CardContent className="p-4 sm:p-6 space-y-5">
        {/* Aspect Ratio */}
        <div className="space-y-2">
          <Label htmlFor="aspectRatio" className="text-white text-sm">Aspect Ratio</Label>
          <Select value={aspectRatio} onValueChange={(v) => onAspectRatioChange(v as AspectRatio)}>
            <SelectTrigger id="aspectRatio" className="bg-slate-700 border-purple-500/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-purple-500/20">
              {ASPECT_RATIOS.map(r => (
                <SelectItem key={r.value} value={r.value} className="text-white">{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary row */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-purple-300">
            <span>Prompts ready:</span>
            <span className={`font-semibold ${isOverLimit ? 'text-red-400' : 'text-white'}`}>
              {prompts.length}{isOverLimit ? ` / ${MAX_PROMPTS} max` : ''}
            </span>
          </div>
          {characterSetId && (
            <div className="flex items-center justify-between text-sm text-purple-300">
              <span>Character set:</span>
              <span className="font-semibold text-green-400 truncate ml-2">{characterSetName || 'Selected'}</span>
            </div>
          )}
        </div>

        {/* Cost Estimate */}
        {prompts.length > 0 && !isOverLimit && (
          <div className="bg-slate-700/50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-3.5 h-3.5 text-green-400" />
              <span className="text-purple-200 font-medium">Cost Estimate</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-300">
                {prompts.length} image{prompts.length !== 1 ? 's' : ''} × $0.04 per image
              </span>
              <span className="font-semibold text-white">~${totalCost.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Prompt limit warning */}
        {isOverLimit && (
          <Alert className="bg-red-500/10 border-red-500/20">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200">
              Maximum {MAX_PROMPTS} prompts per batch. You have {prompts.length} — please remove {prompts.length - MAX_PROMPTS}.
            </AlertDescription>
          </Alert>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={generating || prompts.length === 0 || isOverLimit}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white h-12 text-base"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating {completedCount}/{imageProgress.length}...
            </>
          ) : prompts.length === 0 ? (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Enter prompts to generate
            </>
          ) : isOverLimit ? (
            <>
              <AlertCircle className="w-5 h-5 mr-2" />
              Too many prompts (max {MAX_PROMPTS})
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate {prompts.length} Image{prompts.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>

        {/* Per-image progress */}
        {generating && imageProgress.length > 0 && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-300">Progress</span>
                <span className="text-white font-medium">
                  {completedCount} of {imageProgress.length} complete
                  {errorCount > 0 && <span className="text-red-400 ml-1">({errorCount} failed)</span>}
                </span>
              </div>
              <Progress value={progressPercent} className="bg-slate-700 h-2" />
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {imageProgress.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    item.status === 'generating' ? 'bg-purple-500/10 border border-purple-500/20' :
                    item.status === 'complete' ? 'bg-green-500/5' :
                    item.status === 'error' ? 'bg-red-500/5' :
                    'bg-slate-700/20'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {item.status === 'pending' && <Clock className="w-4 h-4 text-slate-500" />}
                    {item.status === 'generating' && <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />}
                    {item.status === 'complete' && <Check className="w-4 h-4 text-green-400" />}
                    {item.status === 'error' && <X className="w-4 h-4 text-red-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-purple-200 truncate">
                      <span className="text-purple-400 font-mono mr-1.5">#{i + 1}</span>
                      {item.prompt}
                    </p>
                    {item.status === 'error' && item.error && (
                      <p className="text-xs text-red-300 mt-0.5 truncate">{item.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
