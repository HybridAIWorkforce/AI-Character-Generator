import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { uploadFile } from '@/lib/s3';

export const dynamic = 'force-dynamic';

// GET - List all character sets
export async function GET() {
  try {
    const characterSets = await prisma.characterSet.findMany({
      include: {
        references: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(characterSets);
  } catch (error) {
    console.error('Error fetching character sets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch character sets' },
      { status: 500 }
    );
  }
}

// POST - Create a new character set with reference images
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;

    if (!name) {
      return NextResponse.json(
        { error: 'Character set name is required' },
        { status: 400 }
      );
    }

    // Get reference images
    const referenceFiles: File[] = [];
    for (let i = 1; i <= 3; i++) {
      const file = formData.get(`reference${i}`) as File | null;
      if (file) {
        referenceFiles.push(file);
      }
    }

    if (referenceFiles.length === 0) {
      return NextResponse.json(
        { error: 'At least one reference image is required' },
        { status: 400 }
      );
    }

    // Create character set
    const characterSet = await prisma.characterSet.create({
      data: {
        name,
        description: description || null,
      },
    });

    // Upload reference images to S3 and create records
    const referencePromises = referenceFiles.map(async (file, index) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `character-sets/${characterSet.id}/reference-${index + 1}-${Date.now()}.png`;
      const cloudStoragePath = await uploadFile(buffer, fileName, file.type);

      return prisma.characterReference.create({
        data: {
          characterSetId: characterSet.id,
          cloudStoragePath,
          order: index + 1,
          originalName: file.name,
        },
      });
    });

    await Promise.all(referencePromises);

    // Fetch complete character set with references
    const completeCharacterSet = await prisma.characterSet.findUnique({
      where: { id: characterSet.id },
      include: {
        references: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json(completeCharacterSet, { status: 201 });
  } catch (error) {
    console.error('Error creating character set:', error);
    return NextResponse.json(
      { error: 'Failed to create character set' },
      { status: 500 }
    );
  }
}
