import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSignedDownloadUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const images = await prisma.generatedImage.findMany({
      take: 6,
      orderBy: { generatedAt: 'desc' },
      include: {
        generation: {
          include: {
            characterSet: { select: { name: true } },
          },
        },
      },
    });

    const imagesWithUrls = await Promise.all(
      images.map(async (img: any) => ({
        id: img.id,
        prompt: img.prompt,
        url: await getSignedDownloadUrl(img.cloudStoragePath, 3600),
        characterSetName: img.generation?.characterSet?.name,
      }))
    );

    return NextResponse.json(imagesWithUrls);
  } catch (error) {
    console.error('Error fetching recent images:', error);
    return NextResponse.json([]);
  }
}
