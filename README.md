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

## โครงสร้างโปรเจกต์ (คร่าว ๆ)

- `anime_op_quiz_starter.jsx` โค้ดหลักของเกม/หน้า UI จำนวนมาก
- `src/lib/firebase.js` Firebase init
- `src/lib/community.js` ฟังก์ชัน community (โพสต์/อัปโหลดรูป ฯลฯ)
- `src/lib/chat.js`, `src/lib/profiles.js` ฟีเจอร์แชท/โปรไฟล์
- `public/` ไฟล์ static และชุดข้อมูลบางส่วน

## หมายเหตุ

- โปรเจกต์ใช้การ embed YouTube (แบบ `youtube-nocookie`) สำหรับวิดีโอเพลง
- บางส่วนของข้อมูล synopsis ดึงจาก AniList GraphQL (ถ้า API มีการจำกัด/เปลี่ยนแปลง อาจกระทบการแสดงผล)
