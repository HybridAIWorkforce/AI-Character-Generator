import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSignedDownloadUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

// GET - Get a specific generation with images
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const generation = await prisma.generation.findUnique({
      where: { id: params.id },
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
    });

    if (!generation) {
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      );
    }

    // Add signed URLs to images
    const imagesWithUrls = await Promise.all(
      generation.images.map(async (img: any) => ({
        ...img,
        url: await getSignedDownloadUrl(img.cloudStoragePath, 3600),
      }))
    );

    return NextResponse.json({
      ...generation,
      images: imagesWithUrls,
    });
  } catch (error) {
    console.error('Error fetching generation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch generation' },
      { status: 500 }
    );
  }
}
