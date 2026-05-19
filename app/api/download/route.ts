import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { downloadFile } from '@/lib/s3';
import archiver from 'archiver';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for large zips

// GET - Download generation as zip file
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const generationId = searchParams.get('generationId');
    const prefix = searchParams.get('prefix') || 'story';

    if (!generationId) {
      return NextResponse.json(
        { error: 'Generation ID is required' },
        { status: 400 }
      );
    }

    // Get generation with images
    const generation = await prisma.generation.findUnique({
      where: { id: generationId },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!generation || generation.images.length === 0) {
      return NextResponse.json(
        { error: 'Generation not found or has no images' },
        { status: 404 }
      );
    }

    // Create a zip archive
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    // Convert archive to ReadableStream for NextResponse
    const chunks: Uint8Array[] = [];
    
    archive.on('data', (chunk) => {
      chunks.push(chunk);
    });

    const archivePromise = new Promise<Buffer>((resolve, reject) => {
      archive.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      archive.on('error', reject);
    });

    // Add images to archive
    for (const image of generation.images) {
      try {
        const fileBuffer = await downloadFile(image.cloudStoragePath);
        const paddedNumber = String(image.order).padStart(3, '0');
        const fileName = `${prefix}_${paddedNumber}.png`;
        archive.append(fileBuffer, { name: fileName });
      } catch (error) {
        console.error(`Error downloading image ${image.id}:`, error);
      }
    }

    // Finalize archive
    archive.finalize();

    // Wait for archive to complete
    const zipBuffer = await archivePromise;

    // Return zip file
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${prefix}_images.zip"`,
      },
    });
  } catch (error) {
    console.error('Error creating zip:', error);
    return NextResponse.json(
      { error: 'Failed to create zip file' },
      { status: 500 }
    );
  }
}
