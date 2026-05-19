import { NextRequest, NextResponse } from 'next/server';
import { getSignedDownloadUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

// POST - Get signed URL for an S3 key
export async function POST(request: NextRequest) {
  try {
    const { cloudStoragePath } = await request.json();

    if (!cloudStoragePath) {
      return NextResponse.json(
        { error: 'Cloud storage path is required' },
        { status: 400 }
      );
    }

    const url = await getSignedDownloadUrl(cloudStoragePath, 3600);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate signed URL' },
      { status: 500 }
    );
  }
}
