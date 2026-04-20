# OtoVerse Project - Issue Report & Documentation

## 🎯 Project Overview

**Project Name:** OtoVerse  
**Type:** Anime Opening/Ending Song Guessing Game  
**Live URL:** https://otoverse.games/ (aliases https://otoverse.web.app/)  
**Tech Stack:** React 18.3.1 + Vite 6.4.2 + Firebase + TailwindCSS 4

---

## 📁 Project Structure

### Detailed Folder Tree

```
web_animeQuiz/                          ← ROOT PROJECT DIRECTORY
│
├── 📂 src/                              ← React source code
│   ├── App.jsx                          # Main App wrapper
│   ├── main.jsx                         # React DOM entry point
│   ├── index.css                        # Global styles
│   │
│   ├── 📂 lib/                          ← Utility libraries & Firebase logic
│   │   ├── firebase.js                  # Firebase config & auth
│   │   ├── profiles.js                  # User profile operations
│   │   ├── chat.js                      # 1:1 Chat functionality
│   │   ├── community.js                 # Community posts/comments
│   │   ├── rooms.js                     # Game room/session management
│   │   ├── userPrivate.js              # Private user data handlers
│   │   ├── avatars.js                   # Avatar & profile images
│   │   └── utils.js                     # Common utility functions
│   │
│   ├── 📂 components/
│   │   └── 📂 ui/                       ← Reusable UI components
│   │       ├── badge.jsx
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       └── input.jsx
│   │
│   └── 📂 data/                         ← ⚠️ NOW EMPTY (deleted animeData.js)
│       └── (previously had inline anime data)
│
├── 📂 public/                           ← Static assets served directly
│   ├── animeData.json                   # ⭐ MAIN DATA (589 anime entries)
│   ├── legal_availability_th.json       # Thai streaming platform availability
│   ├── legal_catalog_th.json            # Thai anime information catalog
│   ├── synopsis_th.json                 # Thai anime synopses
│   ├── provider_icons.json              # Streaming provider logos/icons
│   ├── manifest.webmanifest             # PWA manifest
│   ├── _redirects                       # Netlify/Firebase redirects
│   ├── robots.txt                       # SEO robots.txt
│   ├── sitemap.xml                      # SEO sitemap
│   ├── favicon.ico                      # Browser tab icon
│   ├── apple-touch-icon.png             # iOS home screen icon
│   ├── *.png, *.jpg                     # App icons (PWA, favicons)
│   ├── bg.mp4                           # Background video
│   ├── libarry2.mp4                     # Library UI video
│   └── (media files)
│
├── 📂 functions/                        ← Firebase Cloud Functions (Node.js)
│   ├── index.js                         # Cloud function handlers
│   └── package.json
│
├── 📂 scripts/                          ← Node.js data processing scripts
│   ├── audit_anime_data.cjs             # Data validation
│   ├── apply_title_updates_from_tsv.cjs # Update anime titles from spreadsheet
│   ├── jikan_suggest_title_updates.cjs  # Suggest Jikan API updates
│   ├── build_legal_availability_th.mjs  # Generate Thai platform data
│   ├── build_legal_catalog_th.mjs       # Generate Thai catalog
│   ├── build_synopsis_th.mjs            # Generate Thai synopses
│   └── (more data tools...)
│
├── 📄 anime_op_quiz_starter.jsx         # ⭐ MAIN COMPONENT (5000+ lines)
│                                        # - All game logic
│                                        # - All UI rendering
│                                        # - All state management
│
├── 📄 vite.config.js                    # Vite build configuration
├── 📄 tailwind.config.js                # TailwindCSS configuration
├── 📄 postcss.config.js                 # PostCSS configuration
├── 📄 jsconfig.json                     # JavaScript config (paths, module)
│
├── 📄 firebase.json                     # Firebase project settings
├── 📄 firestore.rules                   # Firestore security rules
├── 📄 storage.rules                     # Cloud Storage security rules
│
├── 📄 package.json                      # NPM dependencies & scripts
├── 📄 package-lock.json                 # Locked dependency versions
│
├── 📄 README.md                         # Project documentation
├── 📄 PROJECT_ISSUE_REPORT.md           # 🆕 This debugging document
│
└── 📂 dist/                             # ⚠️ BUILD OUTPUT (after npm run build)
    ├── index.html
    ├── 📂 assets/
    │   ├── index-*.js                   # Main bundle
    │   ├── vendor-*.js                  # Node modules bundle
    │   ├── firebase-*.js                # Firebase chunk
    │   ├── motion-*.js                  # Framer motion chunk
    │   └── *.css                        # Compiled styles
    ├── animeData.json                   # (Copied from public)
    ├── (static assets)
    └── (other compiled files)
```

### Key File Locations

| File | Purpose | Size |
|------|---------|------|
| `anime_op_quiz_starter.jsx` | Main app component | ~5000 lines |
| `public/animeData.json` | Game data | 589 entries |
| `src/lib/firebase.js` | Firebase config | ~100 lines |
| `src/App.jsx` | App wrapper | ~5 lines |
| `src/main.jsx` | React entry | ~50 lines |
| `vite.config.js` | Build config | ~20 lines |
| `package.json` | Dependencies | ~30 lines |

---

## 🔴 Current Issue

### Problem Statement (RESOLVED ✅)
**The Anime Library displays 510 entries, but the JSON file contains 589 entries**

**STATUS: ✅ FIXED**
- Library now shows: 589 เรื่อง (correct!)
- JSON file: 589 entries ✓
- Local development: Working correctly ✓

### Root Cause
**VS Code File Version Conflict**

The issue was **NOT data loss** or JSON corruption, but an **editor/file sync problem**:

1. **The Problem:** 
   - The editor tab (anime_op_quiz_starter.jsx) had unsaved changes that differed from the disk file
   - Browser was running an older version of the code from previous deployments
   - This created a 79-entry discrepancy in display logic

2. **The Solution:**
   - When "Overwrite" was clicked in VS Code, the correct version was written to disk
   - Fresh build + deploy loaded the correct code
   - Website now displays all 589 entries correctly

3. **Why It Happened:**
   - Multiple rapid edits to anime_op_quiz_starter.jsx (5000+ line file)
   - Editor buffer and disk file went out of sync
   - Previous deployment had cached older version

### Verification
- ✅ src/main.jsx imports App directly
- ✅ src/App.jsx imports AnimeOPQuizStarter directly  
- ✅ No hidden imports or file shadowing
- ✅ JSON data intact (589 entries)
- ✅ fetch('/animeData.json') returns all entries
- ✅ Display now shows 589 entries (matches JSON)

### Timeline (Root Cause)
1. ✏️ Made multiple rapid edits to anime_op_quiz_starter.jsx
2. 🔄 Deploy happened but code wasn't fully saved
3. 🌐 Browser ran old version → showed 510
4. 📝 Added debug logging → still saw old version
5. ⚠️ Confusion about "missing 79 entries"
6. 💾 Clicked "Overwrite" in VS Code
7. 🚀 New build + deploy
8. ✅ Correct code ran → 589 entries displayed

---

## 🔧 Data Flow Architecture

```
browser
  ↓
fetch('/animeData.json')  [Lines 989-1004 in anime_op_quiz_starter.jsx]
  ↓
Parse JSON response
  ↓
setAnimeData(data)        [State stores raw array]
  ↓
animeWithGenre useMemo    [Lines 3569-3577] ← ADDS genre field
  ↓
Render library with count display
  ↓
Shows "xxx เรื่อง" in UI
```

---

## 📍 Key Code Locations

### 1. **Fetch Implementation** (anime_op_quiz_starter.jsx:989-1004)
```javascript
useEffect(() => {
  window.__EFFECT_RUN = true;
  console.log('=== useEffect: Fetch anime data ===');
  fetch('/animeData.json')
    .then(res => {
      window.__FETCH_RESPONSE = res.status;
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      window.__DATA_LOADED = Array.isArray(data) ? data.length : 'not an array';
      setAnimeData(Array.isArray(data) ? data : []);
    })
    .catch(err => {
      window.__FETCH_ERROR = String(err);
    });
}, []);
```

### 2. **State Declaration** (anime_op_quiz_starter.jsx:974-978)
```javascript
const [animeData, setAnimeData] = useState(() => {
  window.__STATE_INIT = true;
  console.log('animeData state initializing');
  return [];
});
```

### 3. **Genre Mapping** (anime_op_quiz_starter.jsx:3569-3577)
```javascript
const animeWithGenre = useMemo(() => {
  if (!Array.isArray(animeData) || animeData.length === 0) return [];
  const result = animeData.map((anime) => ({
    ...anime,
    genre: inferGenre(anime)
  }));
  console.log('animeWithGenre count:', result.length, 'animeData count:', animeData.length);
  return result;
}, [animeData]);
```

### 4. **Genre Inference** (anime_op_quiz_starter.jsx:254-262)
```javascript
function inferGenre(anime) {
  if (!anime || typeof anime !== "object") return "action";
  const titleStr = String(anime.title || "") + " " + String(anime.note || "");
  const titleLower = titleStr.toLowerCase();
  
  for (const { keyword, genre } of genreKeywordRules) {
    if (titleLower.includes(keyword)) return genre;
  }
  return "action";
}
```

### 5. **App Component** (src/App.jsx)
```javascript
import AnimeOPQuizStarter from "../anime_op_quiz_starter";

export default function App() {
  return <AnimeOPQuizStarter />;
}
```

---

## 🔍 Debugging Findings

### What Works ✅
- JSON file contains 589 valid entries
- Firebase serves correct JSON (HTTP 200)
- All entries have complete required fields
- Build process succeeds without errors
- Deployment to Firebase Hosting successful
- **Component renders correctly with 589 entries**

### Investigation Results ✅
- `window.__COMPONENT_RENDER` → exists ✓
- `window.__EFFECT_RUN` → true ✓
- `window.__FETCH_RESPONSE` → 200 ✓
- `window.__DATA_LOADED` → 589 ✓
- `window.__FETCH_ERROR` → null ✓
- Browser library display → 589 เรื่อง ✓

### NOT the Problem ❌
- ❌ Data wasn't lost or filtered
- ❌ JSON file wasn't corrupted
- ❌ Fetch didn't fail
- ❌ Genre filtering didn't remove entries
- ❌ Code had syntax errors

### THE ACTUAL PROBLEM ⚠️
**VS Code File Version Sync Issue**
- Editor tab had uncommitted changes
- Disk file and editor buffer diverged
- Previous deployments used old code version
- Showed 510 because old code was running
- New code was written but hadn't been deployed yet

---

## 🧪 Debugging Tools Added

Global window flags set during component lifecycle:
```javascript
window.__QUIZ_LOADED = true              // File loaded
window.__COMPONENT_RENDER = true         // Component rendering
window.__STATE_INIT = true               // State initialized
window.__EFFECT_RUN = true               // useEffect started
window.__FETCH_RESPONSE = 200            // HTTP response code
window.__DATA_LOADED = 589               // Entries count
window.__FETCH_ERROR = null              // Error message if any
```

**To check status in browser console:**
```javascript
window.__QUIZ_LOADED
window.__COMPONENT_RENDER
window.__EFFECT_RUN
window.__FETCH_RESPONSE
window.__DATA_LOADED
window.__FETCH_ERROR
```

---

## 📊 Data File Verification

### public/animeData.json
- **Format:** JSON array
- **Entry Count:** 589
- **Sample Entry:**
```json
{
  "id": 1,
  "title": "Shingeki no Kyojin (Attack On Titan) Season 1 (OP1)",
  "altTitles": ["Shingeki no Kyojin", "Attack On Titan", "ผ่าพิภพไททัน"],
  "difficulty": "easy",
  "year": 2013,
  "youtubeVideoId": "euX_8PYBvr4",
  "acceptedAnswers": ["attack on titan", "shingeki no kyojin", "ผ่าพิภพไททัน", "titan"],
  "note": "Guren no Yumiya"
}
```

**Required fields for each entry:**
- `id` - Unique identifier
- `title` - Main anime title
- `altTitles` - Array of alternative titles
- `difficulty` - "easy" | "normal" | "hard"
- `year` - Release year (number)
- `youtubeVideoId` - Video ID for playback
- `acceptedAnswers` - Array of accepted user inputs
- `note` - OP/ED name or notes

---

## 🔨 Build & Deployment

### Development Server

**Start development server:**
```bash
npm run dev
```

**Output:**
```
  VITE v6.4.2  ready in 245 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Then open in browser:**
```
http://localhost:5173/
```

The dev server includes:
- ✅ Hot Module Replacement (HMR) - changes appear instantly
- ✅ Fast Vite compilation
- ✅ Source maps for debugging
- ✅ Full Firebase connectivity

---

### Production Build Process
```bash
npm run build
```
- Uses Vite 6.4.2
- Output: `dist/` folder
- Compiles 2016+ modules
- Generates ~1.36 MB of assets

### Preview Built Files Locally
```bash
npm run preview
```

---

### Deployment to Firebase Hosting
```bash
firebase deploy --only hosting:otoverse
```
- Target: Firebase Hosting (otoverse project)
- URL: https://otoverse.web.app
- Alias: https://otoverse.games

**Complete build + deploy (one command):**
```bash
npm run build; firebase deploy --only hosting:otoverse
```

---

### Available NPM Scripts

From `package.json`:
```json
{
  "scripts": {
    "dev": "vite",                              # ← Dev server
    "build": "vite build",                      # ← Production build
    "preview": "vite preview"                   # ← Preview built files
  }
}
```

---

## 🎮 Game Features Affected
- **Anime Library:** Shows 510 instead of 589
- **Quiz Difficulty Distribution:** May be skewed due to missing entries
- **Genre Filtering:** Can only filter from 510 entries
- **All Game Modes:** Have reduced song pool

---

## 📋 Investigation & Resolution

### Questions Asked
1. **Is the component rendering at all?**
   - ✅ YES - window.__COMPONENT_RENDER = true

2. **Is fetch() executing?**
   - ✅ YES - window.__EFFECT_RUN = true
   - ✅ YES - window.__FETCH_RESPONSE = 200

3. **Is data being received?**
   - ✅ YES - window.__DATA_LOADED = 589

4. **Why did display show 510?**
   - ⚠️ Old code version was deployed
   - ⚠️ Editor had unsaved changes
   - ⚠️ Disk file was behind

5. **What fixed it?**
   - Click "Overwrite" in VS Code
   - Fresh build + deploy
   - New code with correct logic = 589 entries

---

## 🛠️ Lessons Learned

### Key Takeaway
When debugging large projects with many rapid changes:

1. **Always check file sync status:**
   - VS Code status bar (circle indicator)
   - File > Recent > check timestamps
   - Compare editor content with disk file

2. **For large files (5000+ lines):**
   - Be careful with simultaneous edits
   - Save frequently
   - Consider splitting into smaller files
   - Use Ctrl+Shift+P → "Revert File" if unsure

3. **When data/display seems wrong:**
   - Verify data file independently (PowerShell, JSON viewer)
   - Check Network tab in browser DevTools
   - Confirm code actually matches what's on disk
   - Check file timestamps before/after deploy

4. **Debugging methodology:**
   - ✅ Add global window flags (survived tree-shaking)
   - ✅ Check browser Network tab for actual requests
   - ✅ Verify data source independently
   - ✅ Check git status and file versions
   - ✅ Clear cache thoroughly (browser + storage)

### Prevention for Future

```bash
# Before deploying, verify no unsaved changes
git status

# Ensure clean state
git add .
git commit -m "checkpoint before major changes"

# Then deploy
npm run build; firebase deploy --only hosting:otoverse
```

---

## 📞 Contact Points

**Main Component:** `anime_op_quiz_starter.jsx`  
**Data Source:** `public/animeData.json`  
**Firebase Config:** `src/lib/firebase.js`  
**Build Config:** `vite.config.js`

---

## 📝 Notes

- Component is 5000+ lines, handles everything (quiz logic, UI, state management)
- No TypeScript - vanilla JavaScript
- Heavy use of useState, useMemo, useEffect
- Genre inference uses keyword matching
- Data format recently migrated from inline JS to JSON file

---

**Last Updated:** 2026-04-21  
**Issue Status:** ✅ RESOLVED - All 589 entries displaying correctly
