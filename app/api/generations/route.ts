import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSignedDownloadUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

// GET - List all generations with images
export async function GET() {
  try {
    const generations = await prisma.generation.findMany({
      include: {
        characterSet: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 generations
    });

    // Add signed URLs to images
    const generationsWithUrls = await Promise.all(
      generations.map(async (gen: any) => {
        const imagesWithUrls = await Promise.all(
          gen.images.map(async (img: any) => ({
            ...img,
            url: await getSignedDownloadUrl(img.cloudStoragePath, 3600),
          }))
        );

        return {
          ...gen,
          images: imagesWithUrls,
        };
      })
    );

    return NextResponse.json(generationsWithUrls);
  } catch (error) {
    console.error('Error fetching generations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch generations' },
      { status: 500 }
    );
  }
}
