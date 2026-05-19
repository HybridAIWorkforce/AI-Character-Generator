/**
 * Image generation service using OpenAI DALL-E 3
 * This module handles communication with OpenAI's image generation API
 */

import { AspectRatio } from './types';
import fs from 'fs';
import path from 'path';

// Map aspect ratios to DALL-E 3 supported sizes
const aspectRatioDimensions: Record<AspectRatio, string> = {
  '16:9': '1792x1024', // Landscape
  '1:1': '1024x1024',  // Square
  '9:16': '1024x1792', // Portrait
  '4:3': '1024x1024',  // Closest to 4:3
};

export interface GenerateImageOptions {
  prompt: string;
  aspectRatio: AspectRatio;
  referenceImageUrls?: string[]; // URLs of reference images for character consistency
}

/**
 * Load OpenAI API key from auth secrets
 */
function getOpenAIApiKey(): string {
  try {
    const secretsPath = path.join(process.env.HOME || '~', '.config', 'abacusai_auth_secrets.json');
    const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf-8'));
    return secrets.openai?.secrets?.api_key?.value;
  } catch (error) {
    throw new Error('OpenAI API key not found. Please configure it first.');
  }
}

/**
 * Generate an image using OpenAI DALL-E 3
 */
export async function generateImage(
  options: GenerateImageOptions
): Promise<Buffer> {
  const { prompt, aspectRatio, referenceImageUrls } = options;
  const size = aspectRatioDimensions[aspectRatio];
  const apiKey = getOpenAIApiKey();

  // Enhance prompt with reference image context if provided
  let enhancedPrompt = prompt;
  if (referenceImageUrls && referenceImageUrls.length > 0) {
    enhancedPrompt = `${prompt}. Maintain consistency with the character style and appearance from the reference images. Keep the same facial features, clothing style, and overall aesthetic.`;
  }

  try {
    // Call OpenAI DALL-E 3 API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: size,
        quality: 'standard', // 'standard' or 'hd'
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0]?.url;

    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI API');
    }

    // Download the generated image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download generated image: ${imageResponse.statusText}`);
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error(
      `Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Batch generate images with progress tracking
 */
export async function batchGenerateImages(
  prompts: string[],
  aspectRatio: AspectRatio,
  referenceImageUrls?: string[],
  onProgress?: (current: number, total: number) => void
): Promise<Buffer[]> {
  const results: Buffer[] = [];
  const total = prompts.length;

  for (let i = 0; i < total; i++) {
    const imageBuffer = await generateImage({
      prompt: prompts[i],
      aspectRatio,
      referenceImageUrls,
    });

    results.push(imageBuffer);

    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  return results;
}
