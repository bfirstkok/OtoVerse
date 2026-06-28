# OtoVerse Admin Panel setup

หน้าแอดมินอยู่ที่ `/admin` และหน้าเข้าสู่ระบบอยู่ที่ `/admin/login` โดยใช้ Firebase Authentication แบบ Email/Password และเก็บสิทธิ์ใน Firestore collection `admins`

## สร้างแอดมินคนแรก

1. เปิด Firebase Console ของโปรเจกต์ OtoVerse
2. ไปที่ **Authentication > Sign-in method** แล้วเปิดใช้งาน **Email/Password**
3. ไปที่ **Authentication > Users > Add user** และสร้างผู้ใช้ด้วยอีเมล/รหัสผ่าน
4. คัดลอกค่า **User UID** ของผู้ใช้ที่เพิ่งสร้าง
5. ไปที่ **Firestore Database > Data** แล้วสร้าง collection ชื่อ `admins`
6. สร้าง document โดยใช้ UID ที่คัดลอกมาเป็น **Document ID**
7. เพิ่ม field ชื่อ `role` ชนิด string และค่า `admin`
8. เปิด `/admin/login` แล้วเข้าสู่ระบบด้วยบัญชีดังกล่าว

อย่าใช้ email เป็น document ID เพราะระบบตรวจสิทธิ์จาก Firebase Auth UID เท่านั้น

## Firestore collections

`admins/{uid}`

```text
role: "admin"
```

`animeSongs/{autoId}` รองรับ field ต่อไปนี้:

```text
title, altTitles, songTitle, artist, youtubeVideoId, imageUrl,
genre, note, synopsis, isActive, createdAt, updatedAt
```

`altTitles` ถูกบันทึกเป็น array และ timestamp ถูกสร้างจาก server เมื่อเพิ่มหรือแก้ไขข้อมูล

## นำเข้าข้อมูลเดิม

หลังเข้าสู่หน้า `/admin` ให้กด **นำเข้าข้อมูลเดิม** หนึ่งครั้ง ระบบจะนำรายการจาก
`public/animeData.json` เข้า `animeSongs` และจับคู่เรื่องย่อจาก
`public/synopsis_th.json` ให้อัตโนมัติ รวมถึงปี ความยาก คำตอบที่ยอมรับ และข้อมูลตัวละคร

Document ที่นำเข้าจะใช้ ID รูปแบบ `legacy-{id}` การกดนำเข้าอีกครั้งจะข้ามรายการที่มีอยู่แล้ว
เพื่อไม่เขียนทับข้อมูลที่แก้ไขผ่าน Admin Panel

## Security rules

ไฟล์ `firestore.rules` ใน repo มี rules สำหรับ Admin Panel แล้ว หลักการสำคัญคือ:

```firebase
function isAdmin() {
  return request.auth != null
    && exists(/databases/$(database)/documents/admins/$(request.auth.uid))
    && get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == "admin";
}

match /admins/{uid} {
  allow read: if request.auth != null && (request.auth.uid == uid || isAdmin());
  allow create, update, delete: if isAdmin();
}

match /animeSongs/{songId} {
  allow read: if resource.data.isActive == true || isAdmin();
  allow create, update, delete: if isAdmin();
}
```

Deploy rules ด้วย Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

คำเตือน: หน้าเกม query `animeSongs` ด้วยเงื่อนไข `isActive == true` เพื่อให้ตรงกับ rules หาก collection ยังว่างหรือ Firestore ใช้งานไม่ได้ เกมจะ fallback ไปที่ `public/animeData.json` โดยอัตโนมัติ
