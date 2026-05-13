export interface CharacterSetWithReferences {
  id: string;
  name: string;
  description?: string | null;
  samplePrompts?: string[];
  createdAt: Date;
  updatedAt: Date;
  references: {
    id: string;
    cloudStoragePath: string;
    order: number;
    originalName: string;
    uploadedAt: Date;
  }[];
}

export interface GenerationWithImages {
  id: string;
  aspectRatio: string;
  createdAt: Date;
  characterSet?: {
    id: string;
    name: string;
  } | null;
  images: {
    id: string;
    prompt: string;
    cloudStoragePath: string;
    order: number;
    generatedAt: Date;
    url?: string; // Signed URL for display
  }[];
}

export type AspectRatio = '16:9' | '1:1' | '9:16' | '4:3';

export const MAX_PROMPTS = 20;

export interface ImageGenerationRequest {
  prompts: string[];
  characterSetId?: string;
  aspectRatio: AspectRatio;
}

export interface ImageGenerationProgress {
  current: number;
  total: number;
  status: 'generating' | 'complete' | 'error';
  generatedImages?: Array<{
    prompt: string;
    url: string;
  }>;
  error?: string;
}
