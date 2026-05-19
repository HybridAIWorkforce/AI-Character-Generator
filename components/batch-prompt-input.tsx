'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileText, Trash2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MAX_PROMPTS } from '@/lib/types';

interface BatchPromptInputProps {
  prompts: string[];
  onPromptsChange: (prompts: string[]) => void;
}

export function BatchPromptInput({ prompts, onPromptsChange }: BatchPromptInputProps) {
  const [inputText, setInputText] = useState(prompts.join('\n'));

  // Sync inputText with prompts prop when it changes
  useEffect(() => {
    setInputText(prompts.join('\n'));
  }, [prompts]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    onPromptsChange(lines);
  };

  const handleClear = () => {
    setInputText('');
    onPromptsChange([]);
  };

  return (
    <Card className="bg-slate-800/50 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <div>
              <CardTitle className="text-white">Batch Prompts</CardTitle>
              <CardDescription className="text-purple-200">
                Enter prompts (one per line) for batch generation
              </CardDescription>
            </div>
          </div>
          {prompts.length > 0 && (
            <Badge
              variant="secondary"
              className={prompts.length > MAX_PROMPTS
                ? 'bg-red-500/20 text-red-300'
                : 'bg-purple-500/20 text-purple-300'
              }
            >
              {prompts.length > MAX_PROMPTS && <AlertTriangle className="w-3 h-3 mr-1" />}
              {prompts.length}/{MAX_PROMPTS}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompts" className="text-white">Prompts</Label>
          <Textarea
            id="prompts"
            value={inputText}
            onChange={handleTextChange}
            placeholder={`A hero standing on a mountain peak
A close-up portrait with determination
An action scene with dramatic lighting
...`}
            className="bg-slate-700 border-purple-500/20 text-white min-h-[300px] font-mono text-sm"
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-purple-300">
            Each line will generate one image. Empty lines are ignored.
          </p>
          {prompts.length > 0 && (
            <Button
              onClick={handleClear}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
