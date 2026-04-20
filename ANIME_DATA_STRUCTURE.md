# 📊 ANIME_DATA Structure Guide

## 📌 Overview

- **ไฟล์**: `src/animeDataInline.js`
- **ข้อมูล**: 589 anime opening/ending songs + metadata
- **รูปแบบ**: Array ของ objects
- **ขนาดไฟล์**: ~80KB

---

## 🏗️ Data Structure - แต่ละ Entry

```javascript
{
  "id": 1,                              // ID เอก (unique)
  "title": "Anime Name (OP/ED) (Season)", // ชื่อเพลง
  "altTitles": [                        // ชื่ออื่น ๆ (search alternatives)
    "English Name",
    "Thai Name",
    "Short Name"
  ],
  "difficulty": "easy",                 // ระดับความยาก: easy, normal, hard
  "year": 2013,                         // ปีที่ออกอากาศ
  "youtubeVideoId": "abc123xyz",        // YouTube video ID (OP/ED clip)
  "acceptedAnswers": [                  // คำตอบที่ยอมรับ (lower case)
    "anime name",
    "english name",
    "thai name",
    "short name"
  ],
  "note": "Guren no Yumiya"              // ชื่อเพลงจริง (artist info)
}
```

---

## 📝 ตัวอย่าง Entries

### OP (Opening)
```javascript
{
  "id": 1,
  "title": "Shingeki no Kyojin Season 1 (OP1)",
  "altTitles": ["Attack on Titan", "ผ่าพิภพไททัน"],
  "difficulty": "easy",
  "year": 2013,
  "youtubeVideoId": "euX_8PYBvr4",
  "acceptedAnswers": ["attack on titan", "shingeki no kyojin", "ผ่าพิภพไททัน"],
  "note": "Guren no Yumiya"
}
```

### ED (Ending)
```javascript
{
  "id": 162,
  "title": "Demon Slayer Season 2 (ED1)",
  "altTitles": ["Kimetsu no Yaiba", " demon slayer"],
  "difficulty": "normal",
  "year": 2021,
  "youtubeVideoId": "xyz789abc",
  "acceptedAnswers": ["kimetsu no yaiba", "demon slayer"],
  "note": "Song Title"
}
```

---

## ✏️ วิธีแก้ไข/เพิ่มข้อมูล

### 1. **เพิ่ม Entry ใหม่**
- เปิด `src/animeDataInline.js`
- หา `const ANIME_DATA = [` 
- เพิ่ม object ใหม่ในอาเรย์
- **ใช้ ID ที่ไม่ซ้ำ** (ตรวจสอบ max ID ก่อน)
- rebuild: `npm run build && firebase deploy --only hosting`

### 2. **แก้ไข Title / Alt Titles**
- หา entry ที่ต้องการแก้
- แก้ `title` และ `altTitles`
- **ต้องอัพเดท `acceptedAnswers` ด้วย** (lowercase)
- rebuild & deploy

### 3. **ลบ Entry**
- หาและลบ object ออกจากอาเรย์
- ⚠️ **อย่าลบ IDs เก่า** (อาจทำให้ references เสีย)

### 4. **แก้ไข Difficulty**
- `"easy"` = ชื่อดังแน่นอน (OP ยอดนิยม)
- `"normal"` = ชื่อปกติ
- `"hard"` = ชื่อนิッチ/ลึก

---

## 📋 Important Rules

✅ **ต้องทำ:**
- `id` ต้อง unique (ไม่ซ้ำ)
- `acceptedAnswers` ต้อง lowercase ทั้งหมด
- `youtubeVideoId` ต้องถูกต้อง (ตรวจสอบ URL ได้)
- `title` ต้องมี (OP/ED) หรือ Season info

❌ **ต้องหลีกเลี่ยง:**
- Duplicate IDs
- Mixed case ใน acceptedAnswers
- Empty arrays
- Null/undefined values

---

## 🔗 Related Files

- `anime_op_quiz_starter.jsx` - ดึง ANIME_DATA มาใช้
- `songs_with_titles.tsv` - export ข้อมูลสำรอง
- `src/data/animeData.js` - ไฟล์เก่า (ไม่ใช้)

---

## 🚀 Deploy Process

```bash
# 1. แก้ไข src/animeDataInline.js
# 2. Build
npm run build

# 3. Deploy hosting only
firebase deploy --only hosting

# 4. Clear browser cache (Ctrl+Shift+R)
```

---

**Last Updated**: April 20, 2026  
**Total Entries**: 589  
**File Size**: ~80KB
