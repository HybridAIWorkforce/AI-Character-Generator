# TASK CHECKLIST — CITABILITY
## Prioritized & Actionable Task List
### Generated: April 13, 2026

---

## 🟥 CRITICAL (Do Immediately)

### ☐ 1. Clean Up Duplicate Character Set
- **Priority:** CRITICAL
- **Effort:** 5 minutes
- **Details:** There is a duplicate "Investigative Reporter" character set with 0 references that was created when the first script run failed before uploading images.
- **Action:** Delete the orphan record from the database.
- **Command:** 
```sql
-- Find and delete the duplicate (the one with 0 references)
DELETE FROM "CharacterSet" WHERE name = 'Investigative Reporter' 
AND id NOT IN (SELECT DISTINCT "characterSetId" FROM "CharacterReference");
```

---

## 🟧 HIGH PRIORITY

### ☐ 2. Deploy to Production
- **Priority:** HIGH
- **Effort:** 5 minutes
- **Details:** App is fully functional but never deployed to a public URL.
- **Action:** Click Deploy button in Abacus AI UI.
- **Blocks:** Nothing
- **Definition of Done:**
  - [ ] App accessible at public URL
  - [ ] All features working in production
  - [ ] Database shared between dev/prod

### ☐ 3. Add Character Set Editing
- **Priority:** HIGH
- **Effort:** 1-2 hours
- **Details:** Currently can only create and delete character sets. Need ability to edit name, description, and swap reference images.
- **Action Steps:**
  1. Add Edit button to character set cards
  2. Create edit dialog/form (pre-populated with existing data)
  3. Add PUT endpoint to `/api/character-sets/[id]`
  4. Handle reference image replacement
  5. Update samplePrompts editing
- **Files to Modify:**
  - `components/character-set-manager.tsx`
  - `app/api/character-sets/[id]/route.ts`
- **Definition of Done:**
  - [ ] Can edit character set name
  - [ ] Can edit description
  - [ ] Can replace reference images
  - [ ] Can edit sample prompts
  - [ ] Changes persist in database

### ☐ 4. Prompt Template Library
- **Priority:** HIGH
- **Effort:** 1-2 hours
- **Details:** Allow saving custom prompt sets as reusable templates.
- **Action Steps:**
  1. Create PromptTemplate model in Prisma schema
  2. Create API endpoints for CRUD
  3. Add "Save as Template" button in Generate tab
  4. Add template selector dropdown
  5. Load template into prompt textarea
- **Files to Create/Modify:**
  - `prisma/schema.prisma` (new model)
  - `app/api/prompt-templates/route.ts` (new)
  - `components/batch-prompt-input.tsx`
- **Definition of Done:**
  - [ ] Can save current prompts as template
  - [ ] Can load saved templates
  - [ ] Can delete templates
  - [ ] Templates persist in database

---

## 🟨 MEDIUM PRIORITY

### ☐ 5. Search & Filter in History Tab
- **Priority:** MEDIUM
- **Effort:** 1 hour
- **Details:** Add ability to search and filter past generations.
- **Action Steps:**
  1. Add search bar component to History tab
  2. Add filter dropdowns (character set, date range, aspect ratio)
  3. Update `/api/generations` with query parameters
  4. Implement client-side filtering
- **Files to Modify:**
  - `components/generation-gallery.tsx`
  - `app/api/generations/route.ts`
- **Definition of Done:**
  - [ ] Can search by prompt text
  - [ ] Can filter by character set
  - [ ] Can filter by date range
  - [ ] Can filter by aspect ratio

### ☐ 6. Bulk Operations
- **Priority:** MEDIUM
- **Effort:** 1-2 hours
- **Details:** Multi-select generations for bulk delete/download.
- **Action Steps:**
  1. Add checkbox to each generation card
  2. Add "Select All" toggle
  3. Add bulk action toolbar (Delete Selected, Download Selected)
  4. Implement bulk API endpoints
- **Files to Modify:**
  - `components/generation-gallery.tsx`
  - `app/api/generations/route.ts` (add DELETE for multiple)
- **Definition of Done:**
  - [ ] Can select multiple generations
  - [ ] Can bulk delete selected
  - [ ] Can bulk download selected as ZIP

### ☐ 7. Advanced Generation Controls
- **Priority:** MEDIUM
- **Effort:** 1 hour
- **Details:** Add quality and style settings to generation.
- **Action Steps:**
  1. Add quality dropdown (standard / HD)
  2. Add style dropdown (vivid / natural)
  3. Pass settings through to DALL-E 3 API
- **Files to Modify:**
  - `components/image-generation-controls.tsx`
  - `lib/image-generation.ts`
  - `app/api/generate/route.ts`
- **Definition of Done:**
  - [ ] Can select image quality
  - [ ] Can select image style
  - [ ] Settings affect generation output

---

## 🟩 LOW PRIORITY / NICE-TO-HAVE

### ☐ 8. Export Options (PDF, JSON)
- **Priority:** LOW
- **Effort:** 2 hours
- **Details:** Export generation data as PDF report or JSON backup.

### ☐ 9. Analytics Dashboard
- **Priority:** LOW
- **Effort:** 2-3 hours
- **Details:** Track generation stats, usage, costs.

### ☐ 10. 4K Upscaling
- **Priority:** LOW
- **Effort:** 2-3 hours
- **Details:** Integrate upscaling API for true 4K output.

### ☐ 11. Rate Limiting
- **Priority:** LOW
- **Effort:** 30 minutes
- **Details:** Add rate limiting to prevent excessive API usage.

### ☐ 12. Input Validation
- **Priority:** LOW
- **Effort:** 30 minutes
- **Details:** Sanitize prompt text, validate file types/sizes.

---

## 🟦 FUTURE PROJECTS (Separate Conversations)

### ☐ Project 2: Robert Tech Tool Voice — TTS Story Narrator
- Text-to-speech conversion
- Google Studio voice models
- Speaker detection/mapping
- Audio export

### ☐ Project 3: Robert Tech Tool Motion — AI Video Creator
- Video generation from reference images
- Batch clip generation
- Video merging
- Audio sync

---

## ✅ COMPLETED TASKS

- [x] Project setup (Next.js 14 + TypeScript)
- [x] Database schema (PostgreSQL + Prisma)
- [x] AWS S3 cloud storage
- [x] OpenAI DALL-E 3 API integration
- [x] Branding: Citability
- [x] Three-tab navigation
- [x] CREATE tab (character set CRUD)
- [x] GENERATE tab (prompts + controls + results)
- [x] HISTORY tab (gallery + downloads)
- [x] Auto-populate prompts
- [x] Individual image download
- [x] Batch download (ZIP)
- [x] Sequential naming (001_DDMonYYYY.png)
- [x] Sample data (4 character sets)
- [x] Skeleton loaders
- [x] Empty state components
- [x] CSS animations
- [x] Mobile responsive
- [x] Download bug fixes (CORS, History tab)
- [x] Placeholder text fix
- [x] Tab button fix
- [x] External path fix

---

## RECOMMENDED BUILD ORDER

```
Phase 1: Cleanup & Deploy (30 min)
  1. Clean up duplicate character set
  2. Deploy to production
          ↓
Phase 2: Core Enhancements (3-4 hours)
  3. Character set editing
  4. Prompt template library
  5. Advanced generation controls
          ↓
Phase 3: Power Features (3-4 hours)
  6. Search & filter
  7. Bulk operations
          ↓
Phase 4: Polish (4+ hours)
  8. Export options
  9. Analytics
  10. 4K upscaling
  11. Rate limiting
  12. Input validation
```

---

*Generated: April 13, 2026*
