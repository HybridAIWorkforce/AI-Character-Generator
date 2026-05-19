import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { uploadFile } from '../lib/s3'

const prisma = new PrismaClient()

async function main() {
  console.log('Adding Investigative Reporter character set...')

  // Sample prompts for investigative reporter
  const reporterPrompts = [
    'Reporter interviewing sources in a dimly lit parking garage',
    'Reviewing classified documents at a cluttered desk late at night',
    'Taking covert photos at a press conference',
    'Investigating a crime scene with notepad and voice recorder',
    'Working late in newsroom surrounded by computer screens and evidence boards',
  ]

  // Create Investigative Reporter character set
  const reporter = await prisma.characterSet.create({
    data: {
      name: 'Investigative Reporter',
      description: 'Professional journalist investigating stories and uncovering truth',
      samplePrompts: reporterPrompts,
    },
  })

  console.log(`Created character set: ${reporter.name}`)

  // Upload reference images for reporter
  const reporterImages = ['reporter_01.jpg', 'reporter_02.jpg', 'reporter_03.jpg']
  for (let i = 0; i < reporterImages.length; i++) {
    const imageName = reporterImages[i]
    const imagePath = path.join(process.cwd(), 'public', 'test-images', imageName)
    const imageBuffer = fs.readFileSync(imagePath)
    
    const cloudPath = await uploadFile(imageBuffer, `references/${reporter.id}/${imageName}`)
    
    await prisma.characterReference.create({
      data: {
        characterSetId: reporter.id,
        cloudStoragePath: cloudPath,
        order: i + 1,
        originalName: imageName,
      },
    })
    
    console.log(`  Uploaded reference image: ${imageName}`)
  }

  console.log('\n✅ Investigative Reporter character set created successfully!')
  console.log(`   - 3 reference images uploaded`)
  console.log(`   - ${reporterPrompts.length} sample prompts added`)
}

main()
  .catch((e) => {
    console.error('Error adding character set:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
