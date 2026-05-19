import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { uploadFile } from '../lib/s3';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.generatedImage.deleteMany();
  await prisma.generation.deleteMany();
  await prisma.characterReference.deleteMany();
  await prisma.characterSet.deleteMany();

  // Helper function to upload local image to S3
  async function uploadLocalImage(localPath: string, s3Key: string): Promise<string> {
    const imageBuffer = fs.readFileSync(localPath);
    return await uploadFile(imageBuffer, s3Key);
  }

  // Define test character sets
  const characterSets = [
    {
      name: 'Fantasy Hero',
      description: 'A brave warrior from a medieval fantasy world',
      images: ['hero_01.jpg', 'hero_02.jpg', 'hero_03.jpg'],
      samplePrompts: [
        'Standing heroically on a mountain peak at sunset, sword raised high',
        'Close-up portrait with determined expression, wind blowing through hair',
        'Epic battle scene fighting a dragon in a medieval castle courtyard',
        'Walking through a mystical forest with glowing magical elements',
        'Triumphant victory pose after defeating enemies, armor gleaming'
      ],
    },
    {
      name: 'Sci-Fi Explorer',
      description: 'A futuristic space explorer discovering new worlds',
      images: ['scifi_01.jpg', 'scifi_02.jpg', 'scifi_03.jpg'],
      samplePrompts: [
        'Exploring an alien planet with bioluminescent plants and strange rock formations',
        'Inside a futuristic spaceship cockpit, surrounded by holographic displays',
        'First contact moment with an alien civilization, peaceful gesture',
        'Walking through a high-tech space station corridor with neon lights',
        'Floating in zero gravity, examining a mysterious alien artifact'
      ],
    },
    {
      name: 'Modern Detective',
      description: 'A sharp-minded investigator solving mysteries',
      images: ['detective_01.jpg', 'detective_02.jpg', 'detective_03.jpg'],
      samplePrompts: [
        'Investigating a crime scene in the rain, flashlight illuminating evidence',
        'Examining clues under a desk lamp in a dimly lit office, late at night',
        'Intense chase scene through narrow city streets, dramatic lighting',
        'Interrogating a suspect in a dark interrogation room, tension building',
        'Standing at a window overlooking the city skyline, deep in thought'
      ],
    },
  ];

  const testImagesDir = path.join(process.cwd(), 'public', 'test-images');

  // Create character sets with references
  console.log('📦 Creating character sets...');
  const createdSets: any[] = [];

  for (const setData of characterSets) {
    console.log(`   Creating set: ${setData.name}`);
    
    const characterSet = await prisma.characterSet.create({
      data: {
        name: setData.name,
        description: setData.description,
        samplePrompts: setData.samplePrompts,
      },
    });

    // Upload reference images to S3
    for (let i = 0; i < setData.images.length; i++) {
      const imageName = setData.images[i];
      const localPath = path.join(testImagesDir, imageName);
      const s3Key = `character-sets/${characterSet.id}/reference_${i + 1}.jpg`;

      try {
        const cloudStoragePath = await uploadLocalImage(localPath, s3Key);

        await prisma.characterReference.create({
          data: {
            characterSetId: characterSet.id,
            cloudStoragePath,
            originalName: imageName,
            order: i + 1,
          },
        });

        console.log(`      ✓ Uploaded reference ${i + 1}`);
      } catch (error) {
        console.error(`      ✗ Failed to upload ${imageName}:`, error);
      }
    }

    createdSets.push(characterSet);
  }

  // Create sample generations
  console.log('🎨 Creating sample generations...');

  const sampleGenerations = [
    {
      setIndex: 0, // Fantasy Hero
      prompts: [
        'A hero standing on a mountain peak at sunset',
        'Close-up portrait with determined expression',
        'Action scene battling a dragon',
      ],
      aspectRatio: '16:9' as const,
    },
    {
      setIndex: 1, // Sci-Fi Explorer
      prompts: [
        'Exploring an alien planet with strange flora',
        'Inside a futuristic spaceship cockpit',
        'First contact with an alien civilization',
      ],
      aspectRatio: '1:1' as const,
    },
    {
      setIndex: 2, // Modern Detective
      prompts: [
        'Investigating a crime scene in the rain',
        'Examining evidence under a desk lamp',
        'Chase scene through city streets at night',
      ],
      aspectRatio: '9:16' as const,
    },
  ];

  for (const genData of sampleGenerations) {
    const characterSet = createdSets[genData.setIndex];
    console.log(`   Creating generation for: ${characterSet.name}`);

    const generation = await prisma.generation.create({
      data: {
        characterSetId: characterSet.id,
        aspectRatio: genData.aspectRatio,
      },
    });

    // Create generated images (using placeholder S3 paths)
    for (let i = 0; i < genData.prompts.length; i++) {
      const prompt = genData.prompts[i];
      // Use the reference images as placeholders for generated images
      const referenceImageName = characterSet.name.toLowerCase().includes('hero')
        ? 'hero_01.jpg'
        : characterSet.name.toLowerCase().includes('sci')
        ? 'scifi_01.jpg'
        : 'detective_01.jpg';

      const localPath = path.join(testImagesDir, referenceImageName);
      const s3Key = `generations/${generation.id}/image_${i + 1}.jpg`;

      try {
        const cloudStoragePath = await uploadLocalImage(localPath, s3Key);

        await prisma.generatedImage.create({
          data: {
            generationId: generation.id,
            prompt,
            cloudStoragePath,
            order: i + 1,
          },
        });

        console.log(`      ✓ Created image ${i + 1}`);
      } catch (error) {
        console.error(`      ✗ Failed to create image ${i + 1}:`, error);
      }
    }
  }

  console.log('✅ Database seed completed successfully!');
  console.log('   - Created 3 character sets with 9 reference images');
  console.log('   - Created 3 sample generations with 9 generated images');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
