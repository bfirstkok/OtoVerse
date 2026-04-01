# OtoVerse

เว็บเกมทายเพลงอนิเมะ (OP/ED) สร้างด้วย Vite + React + Tailwind และมีระบบโซเชียลผ่าน Firebase (Auth/Firestore/Storage)

## ฟีเจอร์หลัก

- โหมดเล่นเดี่ยว (Normal)
- โหมด Solo Challenge (มี HP และตัวคูณตอนตอบผิด)
- โหมดเล่นกลุ่ม (Turn-based)
  - ตอบผิด: เลือก “คนที่ตอบผิด” เพื่อหักคะแนน แล้วให้คนถัดไปตอบต่อจนกว่าจะถูก
  - ตอบถูก: เลือก “คนที่ตอบถูก” เพื่อรับคะแนน แล้วไปข้อถัดไป
- Community
  - โพสต์/คอมเมนต์/ไลก์
  - เจ้าของโพสต์สามารถแก้ไข/ลบโพสต์ของตัวเองได้
  - อัปโหลดรูปโพสต์แบบ resumable พร้อม progress

## Tech Stack

- Frontend: React 18, Vite, Tailwind
- UI/Animation: lucide-react, framer-motion
- Backend-as-a-service: Firebase (Authentication, Firestore, Storage)

## เริ่มต้นใช้งาน (Local)

### 1) ติดตั้ง dependencies

```bash
npm install
```

### 2) ตั้งค่า Environment variables

คัดลอกไฟล์ตัวอย่างแล้วกรอกค่าจริงจาก Firebase Console

```bash
copy .env.example .env
```

ตัวแปรที่ใช้ (ดูได้ใน `.env.example`):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

หมายเหตุ: ห้าม commit ไฟล์ `.env` ขึ้น repo (โปรเจกต์นี้ใส่ไว้ใน `.gitignore` แล้ว)

### 3) ตั้งค่า Firebase (ขั้นต่ำที่ควรทำ)

1. สร้าง Firebase Project
2. เปิดใช้งาน Authentication Providers ที่ต้องการ (เช่น Email/Password, Google, GitHub)
3. สร้าง Web App แล้วนำ config มาใส่ใน `.env`
4. (ถ้าใช้ GitHub provider) ตั้งค่า OAuth client id/secret ใน Firebase Console

> ถ้ามี Firestore Rules เฉพาะในโปรเจกต์นี้ ให้ตรวจสอบใน Firebase Console ให้ตรงกับที่โค้ดเรียกใช้งาน

### 4) รัน dev server

```bash
npm run dev
```

เปิดตาม URL ที่ Vite แสดงใน terminal (ปกติ `http://localhost:5173`)

## คำสั่งที่ใช้บ่อย

- Dev: `npm run dev`
- Build: `npm run build`
- Preview (หลัง build): `npm run preview`

## Deploy ให้เป็นเว็บ Public (และให้ Google หาเจอ)

โปรเจกต์นี้เป็น Vite SPA (Single Page App) — deploy ได้ง่ายมาก แค่ build แล้วเอาโฟลเดอร์ `dist/` ไป host

### ตัวเลือกที่แนะนำ (ง่าย)

#### 1) Vercel

1. ไปที่ https://vercel.com แล้ว Import GitHub repo
2. ตั้งค่า:
  - Build Command: `npm run build`
  - Output Directory: `dist`
3. Deploy ได้เลย

#### 2) Netlify

1. ไปที่ https://netlify.com แล้ว New site from Git
2. ตั้งค่า:
  - Build Command: `npm run build`
  - Publish directory: `dist`
3. โปรเจกต์นี้มีไฟล์ `public/_redirects` ให้แล้ว เพื่อทำ SPA fallback (`/* -> /index.html 200`)

#### 3) Firebase Hosting (เข้ากับ Firebase ที่ใช้อยู่แล้ว)

1. ติดตั้งเครื่องมือ:

```bash
npm i -g firebase-tools
firebase login
```

2. init hosting:

```bash
firebase init hosting
```

แนะนำค่าตอนถาม:
- public directory: `dist`
- configure as a single-page app: `Yes`

3. build แล้ว deploy:

```bash
npm run build
firebase deploy
```

### ทำให้ “ค้นเจอใน Google”

สิ่งสำคัญคือ “ต้องมี URL ที่เข้าถึงได้จริงแบบ public” (แนะนำผูก Custom Domain) แล้วทำตามนี้:

1. ตรวจว่าไม่ block การ index
  - โปรเจกต์นี้มี `public/robots.txt` เป็น Allow ทั้งหมดแล้ว
2. เปิดใช้ Google Search Console
  - ไปที่ https://search.google.com/search-console
  - Add property (โดเมนหรือ URL prefix)
  - Verify ownership (DNS/HTML/อื่น ๆ)
3. ส่ง Sitemap
  - ถ้าคุณมีหลายหน้า/หลาย route และอยากให้ crawl ดีขึ้น ให้ทำ `sitemap.xml`
  - สำหรับเว็บ SPA หน้าเดียว (ส่วนใหญ่เนื้อหาอยู่หน้าเดียว) Google ก็ index ได้ แต่ SEO มักจะจำกัดกว่า SSR/Pre-render
4. ขอให้ Google เก็บหน้าเร็วขึ้น
  - ใน Search Console ใช้ URL Inspection แล้วกด Request indexing

> หมายเหตุเรื่อง SEO: ถ้าต้องการ SEO แบบ “ค้นคำแล้วติดง่าย” ในหลาย ๆ หน้า อาจต้องใช้ SSR/Pre-render (เช่น Next.js หรือ pre-render routes) เพราะ SPA บางส่วนต้องรัน JS ก่อนถึงเห็น content

## โครงสร้างโปรเจกต์ (คร่าว ๆ)

- `anime_op_quiz_starter.jsx` โค้ดหลักของเกม/หน้า UI จำนวนมาก
- `src/lib/firebase.js` Firebase init
- `src/lib/community.js` ฟังก์ชัน community (โพสต์/อัปโหลดรูป ฯลฯ)
- `src/lib/chat.js`, `src/lib/profiles.js` ฟีเจอร์แชท/โปรไฟล์
- `public/` ไฟล์ static และชุดข้อมูลบางส่วน

## หมายเหตุ

- โปรเจกต์ใช้การ embed YouTube (แบบ `youtube-nocookie`) สำหรับวิดีโอเพลง
- บางส่วนของข้อมูล synopsis ดึงจาก AniList GraphQL (ถ้า API มีการจำกัด/เปลี่ยนแปลง อาจกระทบการแสดงผล)
