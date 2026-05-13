# Citability — User Guide
## How to Create Consistent Character Image Stories with AI

---

## What Is Citability?

Citability is an AI-powered image generation tool that helps you create **consistent character-based image stories**. You upload reference images of a character, write scene descriptions (prompts), and the AI generates images that maintain your character's look across every scene.

Perfect for: article illustrations, storyboards, social media content, creative projects.

---

## Getting Started — The 3-Tab Workflow

Citability uses three tabs that follow a natural creative workflow:

```
① CREATE  →  ② GENERATE  →  ③ HISTORY
```

---

## Tab 1: CREATE — Set Up Your Characters

This is where you define **character sets** — collections of reference images that tell the AI what your character looks like.

### What You'll See
- A grid of existing character sets (cards showing name, description, and reference images)
- A **"+ New Set"** button in the top-right corner

### Pre-Loaded Character Sets
The app comes with 4 ready-to-use character sets:

| Character Set | Description | Best For |
|---------------|-------------|----------|
| **Fantasy Hero** | A brave warrior from a medieval fantasy world | Fantasy stories, RPG content |
| **Sci-Fi Explorer** | A futuristic space explorer discovering new worlds | Sci-fi articles, space themes |
| **Modern Detective** | A sharp-minded investigator solving mysteries | Mystery/noir stories, thrillers |
| **Investigative Reporter** | Professional journalist uncovering truth | News articles, journalism content |

Each set has **3 reference images** and **5 sample prompts** ready to go.

### How to Create a New Character Set
1. Click **"+ New Set"**
2. Enter a **Name** (e.g., "Cyberpunk Hacker")
3. Enter a **Description** (e.g., "A tech-savvy hacker in a neon-lit city")
4. Upload **3 reference images** of your character (different angles/poses work best)
5. Click **Save**

> **Tip:** The more diverse your 3 reference images are (face close-up, full body, action pose), the better the AI understands your character's appearance.

### How to Delete a Character Set
- Click the **trash icon** (🗑️) on any character set card
- This permanently deletes the set and all its reference images

---

## Tab 2: GENERATE — Create Your Images

This is the main workspace where you generate AI images.

### Step-by-Step Process

#### Step 1: Select a Character Set
- You'll see a grid of all your character sets on the left
- **Click on one** to select it (it gets a purple highlight border)
- When you select a set, **5 sample prompts automatically fill in** the prompt box

#### Step 2: Write Your Prompts
- The **Batch Prompts** section shows a text area
- **Each line = one image** that will be generated
- You can:
  - Use the auto-populated sample prompts as-is
  - Edit them to customize
  - Delete them and write your own
  - Add more lines for more images
- The badge in the top-right shows how many prompts you have (e.g., "5 prompts")

> **Prompt Writing Tips:**
> - Be descriptive: "Detective examining evidence under a warm desk lamp at night" > "Detective at desk"
> - Include mood/lighting: "dramatic shadows", "golden hour", "neon-lit"
> - Describe the setting: "in a foggy alley", "at a press conference", "on a rooftop"
> - Mention action: "running through rain", "interviewing a source", "reviewing documents"

#### Step 3: Choose Aspect Ratio
- In the **Generation Controls** panel on the right, select your aspect ratio:

| Ratio | Best For |
|-------|----------|
| **16:9 (Landscape)** | Article headers, blog banners, wide scenes |
| **1:1 (Square)** | Social media posts, profile images |
| **9:16 (Portrait)** | Mobile content, vertical stories, character portraits |
| **4:3 (Standard)** | Classic format, presentations |

#### Step 4: Generate!
- Click the purple **"Generate X Images"** button
- A progress bar shows generation status
- Each image takes approximately **10-15 seconds**
- Images appear in a grid below as they complete

> **Note:** Image generation uses OpenAI DALL-E 3 credits (~$0.04 per image).

### Working with Generated Images

Once images are generated, you'll see them in a responsive grid with:

- **Preview:** Click the eye icon or the image itself to view full-size in a popup
- **Download (Individual):** Click the download icon on any image
  - Files are named sequentially: `001_13Apr2026.png`, `002_13Apr2026.png`, etc.
- **Download All:** Click the **"Download All"** button to download every image at once

---

## Tab 3: HISTORY — Browse Past Generations

Every generation session is saved automatically. The History tab lets you revisit all your past work.

### What You'll See
- Generation cards organized by date (newest first)
- Each card shows:
  - **Character set name** used
  - **Date** of generation
  - **Aspect ratio** used
  - **Number of images** generated
  - Thumbnail grid of all images

### Downloading from History
- **Individual image:** Hover over any image to reveal the download button (arrow icon)
- **Full generation ZIP:** Click the **"Download ZIP"** button on any generation card
  - Downloads all images from that session as a ZIP file

---

## Example Workflow: Creating Article Illustrations

Here's a real-world example of how to use Citability:

### Scenario: You need 5 illustrations for an investigative journalism article

1. **Open the app** → Click the **Generate** tab
2. **Select "Investigative Reporter"** from the character set grid
3. **Prompts auto-fill** with 5 journalism-themed scenes:
   - Reporter interviewing sources in a dimly lit parking garage
   - Reviewing classified documents at a cluttered desk late at night
   - Taking covert photos at a press conference
   - Investigating a crime scene with notepad and voice recorder
   - Working late in newsroom surrounded by computer screens and evidence boards
4. **Select 16:9 (Landscape)** — perfect for article headers
5. **Click "Generate 5 Images"**
6. **Wait ~60 seconds** for all images to generate
7. **Preview** each image, then **Download All**
8. Your files are ready: `001_13Apr2026.png` through `005_13Apr2026.png`

Next time, visit the **History** tab to re-download any of these images!

---

## Tips & Best Practices

### For Best Results
- ✅ Use **3 diverse reference images** per character set (close-up, mid-shot, full body)
- ✅ Write **detailed, specific prompts** with mood, setting, and action
- ✅ Use **16:9 for articles**, **1:1 for social media**, **9:16 for stories**
- ✅ Keep prompts consistent with your character's theme

### Common Questions

**Q: How many images can I generate at once?**
A: As many as you have prompts — each line in the prompt box becomes one image.

**Q: Can I edit a character set after creating it?**
A: Currently you can create and delete character sets. Editing is planned for a future update.

**Q: Where are my images stored?**
A: All images are securely stored in AWS S3 cloud storage. You can always re-download from the History tab.

**Q: What if the download button doesn't work?**
A: Downloads go through a server-side proxy. If you have issues, try refreshing the page and trying again.

**Q: How much does image generation cost?**
A: Each image costs approximately $0.04 using OpenAI DALL-E 3. A batch of 5 images costs about $0.20.

---

## Keyboard Shortcuts & Navigation

| Action | How |
|--------|-----|
| Switch tabs | Click Create / Generate / History |
| Clear all prompts | Click "Clear All" below the prompt box |
| Full-size preview | Click any generated image |
| Close preview | Click X or press Escape |

---

*Citability — Create Consistent Image Stories with AI*
