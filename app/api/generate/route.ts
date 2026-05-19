import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateImage } from '@/lib/image-generation';
import { uploadFile, getSignedDownloadUrl } from '@/lib/s3';
import { AspectRatio, MAX_PROMPTS } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { prompts, characterSetId, aspectRatio } = body;

  if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
    return NextResponse.json({ error: 'Prompts array is required' }, { status: 400 });
  }

  if (prompts.length > MAX_PROMPTS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_PROMPTS} prompts allowed per batch` },
      { status: 400 }
    );
  }

  if (!aspectRatio) {
    return NextResponse.json({ error: 'Aspect ratio is required' }, { status: 400 });
  }

  try {
    // Get reference image URLs before streaming
    let referenceImageUrls: string[] | undefined;
    if (characterSetId) {
      const characterSet = await prisma.characterSet.findUnique({
        where: { id: characterSetId },
        include: { references: { orderBy: { order: 'asc' } } },
      });

      if (!characterSet) {
        return NextResponse.json({ error: 'Character set not found' }, { status: 404 });
      }

      referenceImageUrls = await Promise.all(
        characterSet.references.map((ref: any) =>
          getSignedDownloadUrl(ref.cloudStoragePath, 7200)
        )
      );
    }

    // Create generation record
    const generation = await prisma.generation.create({
      data: {
        characterSetId: characterSetId || null,
        aspectRatio,
      },
    });

    // SSE streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: any) => {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch (e) {
            // Client disconnected
          }
        };

        send({ type: 'start', generationId: generation.id, total: prompts.length });

        for (let i = 0; i < prompts.length; i++) {
          const prompt = prompts[i];
          send({ type: 'generating', current: i + 1, total: prompts.length, prompt });

          try {
            const imageBuffer = await generateImage({
              prompt,
              aspectRatio: aspectRatio as AspectRatio,
              referenceImageUrls,
            });

            const fileName = `generations/${generation.id}/image-${i + 1}-${Date.now()}.png`;
            const cloudStoragePath = await uploadFile(imageBuffer, fileName, 'image/png');

            const generatedImage = await prisma.generatedImage.create({
              data: {
                generationId: generation.id,
                prompt,
                cloudStoragePath,
                order: i + 1,
              },
            });

            const url = await getSignedDownloadUrl(cloudStoragePath, 3600);

            send({
              type: 'image_complete',
              current: i + 1,
              total: prompts.length,
              image: { id: generatedImage.id, prompt, url, order: i + 1 },
            });
          } catch (error) {
            console.error(`Error generating image ${i + 1}:`, error);
            send({
              type: 'image_error',
              current: i + 1,
              total: prompts.length,
              prompt,
              error: error instanceof Error ? error.message : 'Generation failed',
            });
          }
        }

        send({ type: 'complete', generationId: generation.id });
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Error generating images:', error);
    return NextResponse.json({ error: 'Failed to generate images' }, { status: 500 });
  }
}
