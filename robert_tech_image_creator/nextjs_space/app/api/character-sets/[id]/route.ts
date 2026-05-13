import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { deleteFile } from '@/lib/s3';

export const dynamic = 'force-dynamic';

// GET - Get a specific character set
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const characterSet = await prisma.characterSet.findUnique({
      where: { id: params.id },
      include: {
        references: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!characterSet) {
      return NextResponse.json(
        { error: 'Character set not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(characterSet);
  } catch (error) {
    console.error('Error fetching character set:', error);
    return NextResponse.json(
      { error: 'Failed to fetch character set' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a character set
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get character set with references to delete S3 files
    const characterSet = await prisma.characterSet.findUnique({
      where: { id: params.id },
      include: { references: true },
    });

    if (!characterSet) {
      return NextResponse.json(
        { error: 'Character set not found' },
        { status: 404 }
      );
    }

    // Delete reference images from S3
    const deletePromises = characterSet.references.map((ref: any) =>
      deleteFile(ref.cloudStoragePath).catch((err: any) =>
        console.error(`Failed to delete file ${ref.cloudStoragePath}:`, err)
      )
    );

    await Promise.all(deletePromises);

    // Delete character set (cascade will delete references)
    await prisma.characterSet.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting character set:', error);
    return NextResponse.json(
      { error: 'Failed to delete character set' },
      { status: 500 }
    );
  }
}
