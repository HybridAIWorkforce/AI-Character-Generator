# TECHNICAL DOCUMENTATION — CITABILITY
## AI-Powered Consistent Character Image Story Creator
### Generated: April 13, 2026

---

## TABLE OF CONTENTS

1. [System Architecture](#1-system-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Database Schema](#3-database-schema)
4. [API Reference](#4-api-reference)
5. [Component Architecture](#5-component-architecture)
6. [Image Generation Pipeline](#6-image-generation-pipeline)
7. [File Storage (S3)](#7-file-storage-s3)
8. [Environment Configuration](#8-environment-configuration)
9. [Build & Deployment](#9-build--deployment)
10. [File Structure](#10-file-structure)

---

## 1. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│  ┌───────────────────┐  ┌───────────────────┐  ┌─────────────────┐ │
│  │  CREATE Tab        │  │  GENERATE Tab      │  │  HISTORY Tab     │ │
│  │  ───────────────  │  │  ───────────────  │  │  ───────────── │ │
│  │  CharacterSet      │  │  BatchPromptInput  │  │  Generation    │ │
│  │  Manager           │  │  ImageGenControls  │  │  Gallery       │ │
│  │                   │  │  ResultsDisplay    │  │               │ │
│  └───────────────────┘  └───────────────────┘  └─────────────────┘ │
└───────────────────────┬─────────────────────────────────────────┘
                        │ HTTP / fetch
┌───────────────────────┴─────────────────────────────────────────┐
│                     SERVER (Next.js API Routes)                   │
│                                                                   │
│  /api/character-sets      ──────┐                                │
│  /api/character-sets/[id] ──────┤                                │
│  /api/generate            ──────┤  Prisma ORM  ───→  PostgreSQL  │
│  /api/generations         ──────┤                                │
│  /api/generations/[id]    ──────┘                                │
│                                                                   │
│  /api/images/download     ──────┐                                │
│  /api/images/signed-url   ──────┤  S3 Client   ───→  AWS S3      │
│  /api/download            ──────┘                                │
│                                                                   │
│  /api/generate            ────────  OpenAI SDK  ───→  DALL-E 3    │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Image Generation Flow
```
User selects character set
  ↓
Sample prompts auto-populate in textarea
  ↓
User edits/adds prompts + selects aspect ratio
  ↓
POST /api/generate { prompts[], characterSetId, aspectRatio }
  ↓
Server creates Generation record in DB
  ↓
For each prompt:
  │── Fetch reference image URLs from S3 (signed)
  │── Enhance prompt with style consistency instructions
  │── Call OpenAI DALL-E 3 API
  │── Download generated image
  │── Upload to S3
  └── Create GeneratedImage record in DB
  ↓
Return generation ID + image metadata
  ↓
Client displays results in grid
```

### Download Flow
```
User clicks Download button on image
  ↓
GET /api/images/download?imageId=xxx&filename=001_13Apr2026.png
  ↓
Server looks up image in DB
  ↓
Server generates signed S3 URL
  ↓
Server returns 302 redirect to signed URL
  ↓
Browser downloads file
```

---

## 2. TECHNOLOGY STACK

| Category | Technology | Version | Purpose |
|----------|-----------|---------|----------|
| Framework | Next.js | 14.2.28 | Full-stack React framework |
| Language | TypeScript | Latest | Type safety |
| Runtime | Node.js | 18+ | Server runtime |
| UI Framework | React | 18.x | Component library |
| CSS | Tailwind CSS | 3.x | Utility-first styling |
| Components | shadcn/ui | Latest | Pre-built accessible components |
| Icons | Lucide React | Latest | SVG icon library |
| ORM | Prisma | 6.7.0 | Type-safe database access |
| Database | PostgreSQL | Hosted | Persistent data storage |
| Cloud Storage | AWS S3 | SDK v3 | Image file storage |
| AI/ML | OpenAI DALL-E 3 | API v1 | Image generation |
| Package Manager | Yarn | 1.x | Dependency management |
| Theming | next-themes | Latest | Dark/light mode |
| Archiving | archiver | Latest | ZIP file creation |

---

## 3. DATABASE SCHEMA

### Entity Relationship Diagram

```
┌─────────────────────┐       ┌──────────────────────┐
│   CharacterSet        │       │  CharacterReference   │
├─────────────────────┤       ├──────────────────────┤
│ id: String (PK)       │◄─────┤ id: String (PK)        │
│ name: String          │  1:∞  │ characterSetId: FK     │
│ description: String?  │       │ cloudStoragePath: Str  │
│ samplePrompts: Str[]  │       │ order: Int (1-3)       │
│ createdAt: DateTime   │       │ originalName: String   │
│ updatedAt: DateTime   │       │ uploadedAt: DateTime   │
└──────────┬──────────┘       └──────────────────────┘
           │
           │ 1:∞
           │
┌──────────┴──────────┐       ┌──────────────────────┐
│   Generation          │       │  GeneratedImage        │
├─────────────────────┤       ├──────────────────────┤
│ id: String (PK)       │◄─────┤ id: String (PK)        │
│ characterSetId: FK?   │  1:∞  │ generationId: FK       │
│ aspectRatio: String   │       │ prompt: Text           │
│ createdAt: DateTime   │       │ cloudStoragePath: Str  │
└─────────────────────┘       │ order: Int             │
                                │ generatedAt: DateTime  │
                                └──────────────────────┘
```

### Full Prisma Schema

```prisma
generator client {
    provider = "prisma-client-js"
    binaryTargets = ["native", "linux-musl-arm64-openssl-3.0.x"]
}

datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
}

model CharacterSet {
  id            String              @id @default(cuid())
  name          String
  description   String?
  samplePrompts String[]            @default([])
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
  references    CharacterReference[]
  generations   Generation[]
  @@index([createdAt])
}

model CharacterReference {
  id               String       @id @default(cuid())
  characterSetId   String
  cloudStoragePath String
  order            Int          // 1, 2, or 3
  originalName     String
  uploadedAt       DateTime     @default(now())
  characterSet     CharacterSet @relation(fields: [characterSetId], references: [id], onDelete: Cascade)
  @@index([characterSetId])
}

model Generation {
  id             String             @id @default(cuid())
  characterSetId String?
  aspectRatio    String             // "16:9", "1:1", "9:16", "4:3"
  createdAt      DateTime           @default(now())
  characterSet   CharacterSet?      @relation(fields: [characterSetId], references: [id], onDelete: SetNull)
  images         GeneratedImage[]
  @@index([createdAt])
  @@index([characterSetId])
}

model GeneratedImage {
  id               String     @id @default(cuid())
  generationId     String
  prompt           String     @db.Text
  cloudStoragePath String
  order            Int
  generatedAt      DateTime   @default(now())
  generation       Generation @relation(fields: [generationId], references: [id], onDelete: Cascade)
  @@index([generationId])
  @@index([generatedAt])
}
```

### Current Database Stats
- CharacterSet: 5 rows
- CharacterReference: 12 rows
- GeneratedImage: 23 rows
- Generation: 6 rows
- **Total: 46 rows across 4 tables**

---

## 4. API REFERENCE

### GET /api/character-sets
Returns all character sets with their references and sample prompts.

**Response:**
```json
[
  {
    "id": "cuid_xxx",
    "name": "Modern Detective",
    "description": "A sharp-minded investigator solving mysteries",
    "samplePrompts": [
      "Investigating a crime scene in the rain",
      "Examining clues under a desk lamp",
      "Intense chase scene through city streets",
      "Reviewing evidence on a bulletin board",
      "Standing in shadows of a dark alley"
    ],
    "createdAt": "2025-11-26T...",
    "updatedAt": "2025-11-26T...",
    "references": [
      {
        "id": "cuid_yyy",
        "cloudStoragePath": "references/xxx/detective_01.jpg",
        "order": 1,
        "originalName": "detective_01.jpg",
        "uploadedAt": "2025-11-26T..."
      }
    ]
  }
]
```

### POST /api/character-sets
Creates a new character set with reference images.

**Request:** `multipart/form-data`
- `name` (string, required)
- `description` (string, optional)
- `images` (files, up to 3)

**Response:** 201 with created character set

### GET /api/character-sets/[id]
Returns a single character set with references.

### DELETE /api/character-sets/[id]
Deletes a character set and all associated references (cascade).

### POST /api/generate
Generates images from prompts using DALL-E 3.

**Request:**
```json
{
  "prompts": ["Scene 1 description", "Scene 2 description"],
  "characterSetId": "cuid_xxx",
  "aspectRatio": "16:9"
}
```

**Response:**
```json
{
  "generationId": "cuid_zzz",
  "images": [
    {
      "id": "cuid_img",
      "prompt": "Scene 1 description",
      "cloudStoragePath": "generations/xxx/001.png",
      "url": "https://i0.wp.com/shakespeareillustration.org/wp-content/uploads/2016/08/hcselousmov3.jpg?resize=1200%2C1200&ssl=1",
      "order": 1
    }
  ]
}
```

### GET /api/generations
Returns all generations with images and character set info.

### GET /api/generations/[id]
Returns a single generation with all images.

### GET /api/images/download
Server-side download proxy to bypass CORS.

**Query Params:**
- `imageId` (string, required)
- `filename` (string, optional)

**Response:** 302 redirect to signed S3 URL

### GET /api/images/signed-url
Generates a temporary signed URL for an image.

**Query Params:**
- `path` (string, required) — S3 cloud storage path

**Response:**
```json
{ "url": "https://s3.../signed-url" }
```

### GET /api/download
Downloads a generation as a ZIP file.

**Query Params:**
- `generationId` (string, required)
- `prefix` (string, optional, default: "story")

**Response:** ZIP file stream

---

## 5. COMPONENT ARCHITECTURE

### Component Tree
```
RootLayout (app/layout.tsx)
└── ThemeProvider
    └── Page (app/page.tsx)
        ├── Header (Citability logo + title)
        ├── Hero Section
        └── ImageCreator (components/image-creator.tsx) [CLIENT]
            ├── Tab Navigation (Create | Generate | History)
            ├── [CREATE] CharacterSetManager
            │   ├── Character Set Cards (grid)
            │   ├── New Set Form (dialog)
            │   └── Skeleton / EmptyState
            ├── [GENERATE]
            │   ├── CharacterSetManager (compact selector)
            │   ├── BatchPromptInput (textarea)
            │   ├── ImageGenerationControls (aspect ratio + generate button)
            │   └── GenerationResultsDisplay (grid + preview + download)
            └── [HISTORY] GenerationGallery
                ├── Generation Cards
                ├── Image Grid with Hover Overlay
                └── Skeleton / EmptyState
```

### Key Components

| Component | File | Purpose | State |
|-----------|------|---------|-------|
| ImageCreator | `components/image-creator.tsx` | Main controller, tab management | selectedCharacterSet, prompts, aspectRatio, activeTab |
| CharacterSetManager | `components/character-set-manager.tsx` | CRUD for character sets | characterSets[], loading, creating |
| BatchPromptInput | `components/batch-prompt-input.tsx` | Multi-line prompt editor | inputText (synced with props) |
| ImageGenerationControls | `components/image-generation-controls.tsx` | Settings + generate button | loading, progress |
| GenerationResultsDisplay | `components/generation-results-display.tsx` | Results grid + downloads | downloading states |
| GenerationGallery | `components/generation-gallery.tsx` | History browser | generations[], loading |

---

## 6. IMAGE GENERATION PIPELINE

### `lib/image-generation.ts`

**Aspect Ratio Mapping:**
```
16:9 → 1792x1024
9:16 → 1024x1792
1:1  → 1024x1024
4:3  → 1024x1024 (closest supported)
```

**API Key Source:** `/home/ubuntu/.config/abacusai_auth_secrets.json`
```json
{
  "openai": {
    "secrets": {
      "api_key": {
        "value": "sk-proj-..."
      }
    }
  }
}
```

**Prompt Enhancement:**
When reference images are provided, the prompt is enhanced with style consistency instructions to maintain character appearance across generations.

**API Call:**
```
POST https://api.openai.com/v1/images/generations
{
  model: "dall-e-3",
  prompt: "<enhanced prompt>",
  n: 1,
  size: "1792x1024",
  quality: "standard"
}
```

---

## 7. FILE STORAGE (S3)

### `lib/aws-config.ts`
Configures S3 client with:
- `AWS_BUCKET_NAME`
- `AWS_REGION`
- `AWS_PROFILE`
- `AWS_FOLDER_PREFIX`

### `lib/s3.ts`

| Function | Purpose |
|----------|----------|
| `uploadFile(buffer, key)` | Upload image buffer to S3 |
| `getSignedDownloadUrl(key)` | Generate temporary download URL |
| `deleteFile(key)` | Remove file from S3 |
| `downloadFile(key)` | Retrieve file from S3 |

### Storage Structure
```
<prefix>/
  references/
    <characterSetId>/
      hero_01.jpg
      hero_02.jpg
      hero_03.jpg
  generations/
    <generationId>/
      001.png
      002.png
      003.png
```

---

## 8. ENVIRONMENT CONFIGURATION

### `.env` File
```
DATABASE_URL=postgresql://...  # PostgreSQL connection
AWS_PROFILE=...                # AWS credential profile
AWS_REGION=...                 # S3 bucket region
AWS_BUCKET_NAME=...            # S3 bucket name
AWS_FOLDER_PREFIX=...          # S3 folder prefix
ABACUSAI_API_KEY=...           # Abacus AI API key
```

### Secrets Config
```
~/.config/abacusai_auth_secrets.json
  └── openai.secrets.api_key.value = "sk-proj-..."
```

---

## 9. BUILD & DEPLOYMENT

### Development
```bash
cd /home/ubuntu/robert_tech_image_creator/nextjs_space
yarn dev              # Start dev server on port 3000
```

### Production Build
```bash
yarn run build        # Creates optimized production build
```

### Build Output (Last Build)
```
Route (app)                              Size     First Load JS
┌ ƒ /                                    39.4 kB     138 kB
├ ƒ /_not-found                          872 B       88.1 kB
├ ƒ /api/character-sets                  0 B         0 B
├ ƒ /api/character-sets/[id]             0 B         0 B
├ ƒ /api/download                        0 B         0 B
├ ƒ /api/generate                        0 B         0 B
├ ƒ /api/generations                     0 B         0 B
├ ƒ /api/generations/[id]                0 B         0 B
├ ƒ /api/images/download                 0 B         0 B
└ ƒ /api/images/signed-url               0 B         0 B
+ First Load JS shared by all            87.2 kB
```

### Deployment
- Currently: **NOT DEPLOYED** to any public URL
- Deploy via Abacus AI Deploy button
- Gets `.abacusai.app` subdomain automatically

---

## 10. FILE STRUCTURE

```
robert_tech_image_creator/
├── BUILD_SHEET.md
├── MASTER_BUILD_SHEET_CITABILITY.md
├── CONVERSATION_TRANSCRIPT_CITABILITY.md
├── TECHNICAL_DOCUMENTATION_CITABILITY.md
├── TASK_CHECKLIST_CITABILITY.md
├── QUICK_REFERENCE_CITABILITY.md
└── nextjs_space/
    ├── .env
    ├── next.config.js
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── postcss.config.js
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── api/
    │       ├── character-sets/
    │       │   ├── route.ts
    │       │   └── [id]/route.ts
    │       ├── generate/route.ts
    │       ├── generations/
    │       │   ├── route.ts
    │       │   └── [id]/route.ts
    │       ├── images/
    │       │   ├── download/route.ts
    │       │   └── signed-url/route.ts
    │       └── download/route.ts
    ├── components/
    │   ├── image-creator.tsx
    │   ├── character-set-manager.tsx
    │   ├── batch-prompt-input.tsx
    │   ├── image-generation-controls.tsx
    │   ├── generation-results-display.tsx
    │   ├── generation-gallery.tsx
    │   ├── theme-provider.tsx
    │   └── ui/ (30+ shadcn components)
    ├── lib/
    │   ├── aws-config.ts
    │   ├── s3.ts
    │   ├── db.ts
    │   ├── types.ts
    │   ├── image-generation.ts
    │   └── utils.ts
    ├── hooks/use-toast.ts
    ├── prisma/schema.prisma
    ├── scripts/
    │   ├── seed.ts
    │   ├── add-reporter.ts
    │   └── safe-seed.ts
    └── public/
        ├── favicon.svg
        ├── og-image.png
        └── test-images/ (12 reference images)
```

---

*Generated: April 13, 2026*
*Project: Citability — AI-Powered Consistent Character Image Story Creator*
