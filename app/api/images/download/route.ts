import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSignedDownloadUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

// GET - Download a single image
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageId = searchParams.get('imageId');
    const filename = searchParams.get('filename') || 'image.png';

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // Get image from database
    const image = await prisma.generatedImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Generate signed URL with short expiration (15 minutes)
    const signedUrl = await getSignedDownloadUrl(image.cloudStoragePath, 900);

    // Redirect to the signed URL with download disposition
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error('Error downloading image:', error);
    return NextResponse.json(
      { error: 'Failed to download image' },
      { status: 500 }
    );
  }
}
