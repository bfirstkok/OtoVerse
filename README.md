# OtoVerse

เว็บเกมทายเพลงอนิเมะ (OP/ED) + คลังข้อมูล + ฟีเจอร์โซเชียล สร้างด้วย Vite + React + Tailwind และเชื่อม Firebase (Auth/Firestore/Storage)

Live (Firebase Hosting): https://otoverse.web.app

---

## TL;DR (ทำอะไรได้)

**เกมทายเพลง**

- เล่นแบบปกติ (กำหนดจำนวนข้อ)
- Solo Challenge (มี HP / ผิดติดกันโดนหนักขึ้น)
- เล่นกลุ่ม (จอเดียว ผลัดกันตอบ)
- จับเวลา 3 นาที (เล่นไม่จำกัดข้อ หมดเวลาแล้วสรุปผล)

**โหมดพิเศษ (อยู่ในแผงด้านขวา)**

- Daily Challenge (ชุดประจำวัน 10 ข้อ)
- Favorites (เล่นจากเพลงที่กด ⭐)
- ยอดนิยมของคุณ (อิงสถิติในเครื่อง)
- เล่นจากเรื่อง (เลือกอนิเมะ)
- Room Code (แชร์ “ชุดคำถาม + การตั้งค่า” ให้เพื่อนเล่นเหมือนกัน / ไม่ใช่ห้องออนไลน์)

**อื่น ๆ**

- คลังเพลง + ช่องทางรับชม/ฟัง (ข้อมูลไทย + ไอคอน provider)
- แชร์ผลเป็นรูป (PNG) ธีมเดียวกับเว็บ + โลโก้ + สรุปผล + mini chart + Top 3 ข้อที่ตอบถูกเร็วที่สุดในรอบนั้น
- Community โพสต์/คอมเมนต์/ไลก์
- โปรไฟล์/ติดตาม/อันดับผู้เล่น (leaderboard)
- แชท 1:1
- ฟอร์มรายงานปัญหา (`reports`) + ขอเพิ่มเพลง (`song_requests`)

---

## Tech Stack

- Frontend: React 18, Vite 6
- Styling: TailwindCSS 4
- UI/Animation: lucide-react, framer-motion
- Backend: Firebase
  - Authentication
  - Firestore
  - Storage

---

## โหมดเกม (Game Modes)

### 1) ปกติ (normal)

- เล่นตามจำนวนข้อที่เลือก (เช่น 5/10/15)
- มีคะแนนรวมของรอบ

### 2) Solo Challenge (solo_challenge)

- HP เริ่ม 10
- ตอบผิด/ข้าม: HP ลด (และตัวคูณความผิดเพิ่ม)
- เกมจบเมื่อ HP หมด

### 3) เล่นกลุ่ม (group)

- จอเดียว เล่นผลัดกัน
- ตอบผิด: เลือก “คนที่ตอบผิด” เพื่อให้ระบบหัก/จัดการคะแนน แล้วสลับให้คนถัดไปตอบต่อจนกว่าจะถูก
- ตอบถูก: ไปข้อถัดไป

### 4) จับเวลา 3 นาที (time_attack_3m)

- เล่นไม่จำกัดข้อ
- UI แสดงเวลา “เหลือ …”
- ครบ 3 นาที ระบบพาไปหน้าสรุปผลอัตโนมัติ

---

## โหมดพิเศษ (Special Modes)

โหมดพิเศษถูกย้ายไปอยู่ใน “แผงป็อปอัปด้านขวา” เพื่อไม่ทำให้ผู้เล่นเข้าใจผิดว่าต้องตั้งค่าก่อนเล่นโหมดปกติ

- **Daily Challenge**: สุ่มแบบ deterministic ตามวันที่ (เล่นซ้ำวันเดิมจะได้ชุดเดิม)
- **Favorites**: เล่นจากรายการที่ผู้ใช้กด ⭐ ในคลัง
- **ยอดนิยมของคุณ**: สร้าง pool จากสถิติในเครื่อง (local)
- **เล่นจากเรื่อง (เลือกอนิเมะ)**: เลือก series แล้วเล่นจาก bucket ของเรื่องนั้น
- **Room Code**:
  - เป็น “โค้ดแชร์ชุดคำถาม” (ไม่ใช่ realtime room / ไม่ sync การเล่น)
  - payload เป็น JSON แล้ว encode แบบ base64url
  - รองรับโหมดกลุ่มและรายชื่อผู้เล่นในโค้ด

---

## แชร์ผลเป็นรูป (PNG)

- เรนเดอร์ด้วย `<canvas>` (1080×1080)
- ใส่โลโก้จาก `public/pwa-192.png`
- มี mini chart (ถูก/ผิด/ข้าม)
- “Top 3 in this run” อิงข้อที่ **ตอบถูกเร็วที่สุด** ในรอบนั้น
- ถ้าเครื่องรองรับ Web Share API จะ share เป็นไฟล์ภาพได้เลย ไม่งั้นจะดาวน์โหลด PNG แทน

---

## Firebase (Auth/Firestore/Storage)

### Environment Variables

คัดลอกไฟล์ตัวอย่างแล้วกรอกค่าจริงจาก Firebase Console:

```bash
copy .env.example .env
```

คีย์ที่ต้องมี (ดูรายละเอียดใน `.env.example`):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

คีย์เสริม:

- `VITE_LIBRARY_BG_GIF1`
- `VITE_LIBRARY_BG_GIF2`

> หมายเหตุ: `.env` เป็น client config (ไม่ใช่ secret) แต่ก็ไม่ควร commit ไฟล์ `.env` ขึ้น repo อยู่ดี

### Collections ที่ใช้งาน (Firestore)

- `profiles` โปรไฟล์ผู้ใช้ + สถิติสะสม (เช่น playCount / totalScore) + following + settings
- `posts` ฟีด community (ภายใต้โพสต์มี subcollection `comments`)
- `chats` แชท 1:1 (ภายใต้แชทมี subcollection `messages`)
- `reports` ฟอร์มรายงานปัญหา/ข้อเสนอแนะจากในเว็บ
- `song_requests` คำขอเพิ่มเพลง/เรื่องจากหน้า library

### Rules

- `firestore.rules`
- `storage.rules`

> ถ้าเจอ `permission-denied` ตอนเขียน collection ใด ๆ ให้ตรวจ rules ใน Firebase Console ให้ตรงกับความตั้งใจของโปรเจกต์

---

## โครงสร้างโปรเจกต์

- `src/main.jsx` entry ของ React
- `src/App.jsx` จุดที่ mount ตัวเกม (import จากไฟล์หลักด้านล่าง)
- `anime_op_quiz_starter.jsx` โค้ดหลักของเกม/หน้า UI ส่วนใหญ่ (home/play/result/library/community/about ฯลฯ)
- `src/index.css` global styles
- `src/lib/firebase.js` init Firebase + auth persistence + Firestore long-polling fallback
- `src/lib/community.js` ฟีเจอร์ community (`posts` + `comments`)
- `src/lib/chat.js` ฟีเจอร์แชท (`chats` + `messages`)
- `src/lib/profiles.js` โปรไฟล์/ติดตาม/สถิติสะสม/leaderboard (`profiles`)
- `src/lib/avatars.js` อัปโหลด/จัดการรูปโปรไฟล์ (บีบอัดก่อนส่ง)
- `src/lib/utils.js` helper utilities ที่ใช้ร่วมกัน
- `src/components/ui/*` primitive UI (button/card/input/badge)

---

## ชุดข้อมูล/ไฟล์ static

อยู่ใน `public/` (ถูก deploy ไป Hosting ตรง ๆ):

- `public/legal_catalog_th.json` แคตตาล็อกอนิเมะ/เพลง/เรื่อง (TH)
- `public/legal_availability_th.json` ข้อมูลช่องทางรับชม/ฟัง (TH)
- `public/provider_icons.json` ไอคอน provider
- `public/synopsis_th.json` synopsis ภาษาไทย (ฐานข้อมูลที่ build ไว้)
- `public/bg.mp4`, `public/libarry2.mp4` พื้นหลังแบบวิดีโอ (ลด bandwidth เมื่อเทียบกับ GIF)
- `public/manifest.webmanifest`, `public/pwa-192.png`, `public/pwa-512.png` สำหรับ PWA metadata/icon
- `public/robots.txt` สำหรับ crawler
- `public/_redirects` (Netlify) และ `firebase.json` (Firebase) สำหรับ SPA fallback

ไฟล์ข้อมูลดิบ/รายการชื่ออื่น ๆ อยู่ที่ root เช่น:

- `anime_titles.txt`, `anime_works_320.txt` ฯลฯ

---

## Scripts (โฟลเดอร์ `scripts/`)

มีสคริปต์สำหรับ build/อัปเดต dataset หลายตัว (Node.js):

- `build_legal_catalog_th.mjs` สร้าง/อัปเดต `public/legal_catalog_th.json`
- `build_legal_availability_th.mjs` สร้าง/อัปเดต `public/legal_availability_th.json`
- `update_provider_icons.cjs` อัปเดต `public/provider_icons.json`
- `build_synopsis_th.mjs` สร้าง/อัปเดต `public/synopsis_th.json`
- `convert_library_backgrounds.mjs` งานแปลง/จัดการ background assets

นอกนั้นเป็นกลุ่ม audit/debug/export เพื่อเช็คคุณภาพข้อมูล (ชื่อไฟล์มักขึ้นต้นด้วย `audit_`, `debug_`, `export_`)

---

## รันโปรเจกต์ (Local Development)

### 1) ติดตั้ง dependencies

```bash
npm install
```

### 2) รัน dev server

```bash
npm run dev
```

### 3) Build / Preview

```bash
npm run build
npm run preview
```

---

## Deploy

### Firebase Hosting (โปรเจกต์นี้ตั้งค่าไว้แล้ว)

ไฟล์ config:

- `.firebaserc` กำหนด default project และ hosting target
- `firebase.json` ระบุว่า deploy จาก `dist/` + ทำ SPA rewrite ไป `index.html` + ตั้งค่า headers (caching) สำหรับไฟล์ static บางประเภท

คำสั่ง deploy:

```bash
npm run build
npx firebase-tools deploy --only hosting:otoverse
```

ถ้า fork โปรเจกต์ไปใช้ Firebase project ของตัวเอง:

1) `npx firebase-tools login`
2) `npx firebase-tools use --add` แล้วเลือก project
3) ปรับ `.firebaserc`/hosting target ตามต้องการ หรือใช้ `--project <your_project_id>` ตอน deploy

---

## Notes / ข้อควรรู้

- โปรเจกต์ embed YouTube (แนว `youtube-nocookie`) เพื่อเล่นเพลง
- `src/lib/firebase.js` ตั้งค่า Firestore ให้ auto-detect long polling เพื่อช่วยในบางเครือข่าย/ส่วนขยายที่บล็อก transport แบบ streaming
- บางกติกา “กันซ้ำ” เป็น logic ภายในของการสุ่ม/จัดลิสต์ และสามารถถูกพกไปกับ Room Code ได้ (แม้ UI ตั้งค่าอาจถูกซ่อนไว้ตามดีไซน์ล่าสุด)
