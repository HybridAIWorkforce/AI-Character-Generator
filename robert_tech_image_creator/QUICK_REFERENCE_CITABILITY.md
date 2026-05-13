# QUICK REFERENCE — CITABILITY
## Fast Access to Key Information
### Generated: April 13, 2026

---

## 📁 PATHS

| What | Path |
|------|------|
| Project Root | `/home/ubuntu/robert_tech_image_creator/` |
| Next.js App | `/home/ubuntu/robert_tech_image_creator/nextjs_space/` |
| Components | `nextjs_space/components/` |
| API Routes | `nextjs_space/app/api/` |
| Database Schema | `nextjs_space/prisma/schema.prisma` |
| Image Generation | `nextjs_space/lib/image-generation.ts` |
| S3 Operations | `nextjs_space/lib/s3.ts` |
| Types | `nextjs_space/lib/types.ts` |
| Global Styles | `nextjs_space/app/globals.css` |
| Env Variables | `nextjs_space/.env` |
| OpenAI Key | `~/.config/abacusai_auth_secrets.json` |
| Test Images | `nextjs_space/public/test-images/` |
| Seed Script | `nextjs_space/scripts/seed.ts` |
| Build Sheet | `/home/ubuntu/robert_tech_image_creator/BUILD_SHEET.md` |

---

## ⌘ COMMANDS

```bash
# Navigate to project
cd /home/ubuntu/robert_tech_image_creator/nextjs_space

# Start dev server
yarn dev

# TypeScript check
yarn tsc --noEmit

# Production build
yarn run build

# Prisma commands
yarn prisma generate          # Generate client
yarn prisma db push            # Push schema changes
yarn prisma studio             # Open DB browser

# Run scripts
yarn tsx scripts/seed.ts       # Seed sample data
yarn tsx scripts/add-reporter.ts  # Add reporter set

# Install packages
yarn add <package-name>
```

---

## 🏗️ TECH STACK

| Layer | Tech |
|-------|------|
| Framework | Next.js 14.2.28 |
| Language | TypeScript |
| Database | PostgreSQL (Prisma 6.7.0) |
| Storage | AWS S3 |
| AI | OpenAI DALL-E 3 |
| CSS | Tailwind CSS |
| Components | shadcn/ui |
| Icons | Lucide React |

---

## 🗄️ DATABASE TABLES

| Table | Rows | Key Fields |
|-------|------|------------|
| CharacterSet | 5 | name, description, samplePrompts[] |
| CharacterReference | 12 | characterSetId, cloudStoragePath, order |
| Generation | 6 | characterSetId, aspectRatio |
| GeneratedImage | 23 | generationId, prompt, cloudStoragePath, order |

---

## 🌐 API ENDPOINTS

| Method | Endpoint | Purpose |
|--------|----------|----------|
| GET | `/api/character-sets` | List all sets |
| POST | `/api/character-sets` | Create new set |
| GET | `/api/character-sets/[id]` | Get one set |
| DELETE | `/api/character-sets/[id]` | Delete set |
| POST | `/api/generate` | Generate images |
| GET | `/api/generations` | List generations |
| GET | `/api/generations/[id]` | Get one generation |
| GET | `/api/images/signed-url` | Get S3 signed URL |
| GET | `/api/images/download` | Download proxy |
| GET | `/api/download` | Download ZIP |

---

## 🎨 CHARACTER SETS

| # | Name | References | Sample Prompts |
|---|------|------------|----------------|
| 1 | Fantasy Hero | 3 | 5 |
| 2 | Sci-Fi Explorer | 3 | 5 |
| 3 | Modern Detective | 3 | 5 |
| 4 | Investigative Reporter | 3 | 5 |
| 5 | Investigative Reporter (DUPLICATE) | 0 | 5 |

---

## 📀 ASPECT RATIOS

| Ratio | Use Case | DALL-E Size |
|-------|----------|-------------|
| 16:9 | Landscape / Article Headers | 1792x1024 |
| 9:16 | Portrait / Mobile | 1024x1792 |
| 1:1 | Square / Social Media | 1024x1024 |
| 4:3 | Standard / Classic | 1024x1024 |

---

## 📛 DOWNLOAD NAMING

Format: `{order}_{DDMonYYYY}.png`

Examples:
- `001_13Apr2026.png`
- `002_13Apr2026.png`
- `003_13Apr2026.png`

---

## 🔑 ENVIRONMENT VARIABLES

| Variable | Purpose |
|----------|----------|
| DATABASE_URL | PostgreSQL connection |
| AWS_PROFILE | AWS credentials |
| AWS_REGION | S3 region |
| AWS_BUCKET_NAME | S3 bucket |
| AWS_FOLDER_PREFIX | S3 folder prefix |
| ABACUSAI_API_KEY | Abacus AI API |
| NEXTAUTH_URL | Auto-configured |

---

## ⚠️ KNOWN ISSUES

1. **Duplicate character set** — Empty "Investigative Reporter" needs deletion
2. **Not deployed** — No public URL yet
3. **No rate limiting** — Could accumulate OpenAI costs
4. **No input validation** — Prompts not sanitized

---

## 🎯 NEXT ACTIONS

1. Delete duplicate Investigative Reporter (0 refs)
2. Deploy to production
3. Add character set editing
4. Add prompt template library
5. Add search/filter to History

---

## 📊 STATUS SUMMARY

| Metric | Value |
|--------|-------|
| Completion | ~85% |
| Features Done | 28/35 |
| Bugs Fixed | 6/7 |
| Tests Passing | 100% |
| Deployed | No |
| Sessions | 4 |
| Checkpoints | 6+ |

---

*Generated: April 13, 2026*
