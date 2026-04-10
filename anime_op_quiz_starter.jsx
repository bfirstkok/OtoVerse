import React, { useMemo, useRef, useState, useEffect } from "react";
// TEMP_MARKER_REMOVE
import qrPaymentImg from "./QRpayment.jpg";
import { motion } from "framer-motion";
import {
  Search,
  Play,
  ListMusic,
  Trophy,
  Shuffle,
  Eye,
  Headphones,
  SkipForward,
  RotateCcw,
  Info,
  ArrowLeft,
  Users,
  Megaphone,
  Shield,
  Palette,
  Moon,
  Sun,
  Youtube,
  Music2,
  Film,
  Heart,
  MessageCircle,
  ImagePlus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  getRedirectResult,
  linkWithCredential,
  OAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile
} from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firebaseAuth, firebaseAuthPersistenceReady, firebaseDb, firebaseProjectId, firebaseReady } from "@/lib/firebase";
import {
  bumpPlayCount,
  bumpTotalScore,
  ensureProfile,
  followUser,
  getFollowersCount,
  setUserPresence,
  subscribeCommunityProfiles,
  subscribeLeaderboard,
  subscribeProfile,
  touchUserPresence,
  unfollowUser,
  updateProfileBestStreak,
  updateProfileNickname,
  updateProfilePhotoURL,
  updateProfilePublicFavorites,
  updateProfileSettings
} from "@/lib/profiles";
import { uploadUserAvatar } from "@/lib/avatars";
import { addComment, createPost, deletePost, subscribeComments, subscribePosts, togglePostLike, updatePost, uploadPostImage } from "@/lib/community";
import { ensureDirectChat, getDirectChatId, sendDirectMessage, subscribeDirectMessages, subscribeUserChats, upsertChatMeta } from "@/lib/chat";
import { ensureUserPrivate, subscribeUserPrivate, updateUserPrivate } from "@/lib/userPrivate";
import {
  advanceOnlineRoomQuestion,
  beginOnlineRoomCountdown,
  closeOnlineRoom,
  createOnlineRoom,
  findRoomByCode,
  finishOnlineRoomGame,
  joinOnlineRoom,
  kickOnlineRoomPlayer,
  leaveOnlineRoom,
  resetOnlineRoomToLobby,
  sendRoomMessage,
  setOnlineReady,
  startOnlineRoomGame,
  submitOnlineAnswer,
  subscribeOnlineRooms,
  subscribeRoom,
  subscribeRoomMessages,
  subscribeRoomPlayers,
  updateOnlineRoomSettings
} from "@/lib/rooms";

const animeData = [
  {
    id: 1,
    title: "Shingeki no Kyojin (Attack On Titan) (OP1)",
    altTitles: ["Shingeki no Kyojin", "Attack On Titan", "ผ่าพิภพไททัน"],
    difficulty: "easy",
    year: 2013,
    youtubeVideoId: "euX_8PYBvr4",
    acceptedAnswers: ["attack on titan", "shingeki no kyojin", "ผ่าพิภพไททัน"],
    note: "Guren no Yumiya"
  },
  {
    id: 2,
    title: "Death Note (OP1)",
    altTitles: ["เดธโน้ต"],
    difficulty: "easy",
    year: 2006,
    youtubeVideoId: "https://www.youtube.com/watch?v=Bt3D3Ca9nww&list=RDBt3D3Ca9nww&start_radio=1",
    acceptedAnswers: ["death note", "เดธโน้ต"],
    note: "The World"
  },
  {
    id: 3,
    title: "Kimetsu no Yaiba (OP1)",
    altTitles: ["Kimetsu no Yaiba", "ดาบพิฆาตอสูร"],
    difficulty: "easy",
    year: 2019,
    youtubeVideoId: "pmanD_s7G3U",
    acceptedAnswers: ["demon slayer", "kimetsu no yaiba", "ดาบพิฆาตอสูร"],
    note: "Gurenge"
  },
  {
    id: 4,
    title: "Jujutsu Kaisen (OP1)",
    altTitles: ["มหาเวทย์ผนึกมาร"],
    difficulty: "normal",
    year: 2020,
    youtubeVideoId: "https://www.youtube.com/watch?v=v8bZVdTgXoY&list=RDv8bZVdTgXoY&start_radio=1",
    acceptedAnswers: ["jujutsu kaisen", "มหาเวทย์ผนึกมาร"],
    note: "Kaikai Kitan"
  },
  {
    id: 5,
    title: "Naruto (OP1)",
    altTitles: ["นารูโตะ"],
    difficulty: "easy",
    year: 2002,
    youtubeVideoId: "https://www.youtube.com/watch?v=EBNl8bwdVcA&list=RDEBNl8bwdVcA&start_radio=1",
    acceptedAnswers: ["naruto", "นารูโตะ"],
    note: "Haruka Kanata"
  },
  {
    id: 6,
    title: "One Piece (OP1)",
    altTitles: ["วันพีซ"],
    difficulty: "easy",
    year: 1999,
    youtubeVideoId: "https://www.youtube.com/watch?v=YoeP9w5UIlg&list=RDYoeP9w5UIlg&start_radio=1",
    acceptedAnswers: ["one piece", "วันพีซ"],
    note: "We Are!"
  },
  {
    id: 7,
    title: "Fullmetal Alchemist: Brotherhood (OP1)",
    altTitles: ["FMA Brotherhood"],
    difficulty: "normal",
    year: 2009,
    youtubeVideoId: "https://www.youtube.com/watch?v=XCsppc963NI&list=RDXCsppc963NI&start_radio=1",
    acceptedAnswers: ["fullmetal alchemist brotherhood", "fma brotherhood", "fullmetal alchemist: brotherhood"],
    note: "Again"
  },
  {
    id: 8,
    title: "Tokyo Ghoul (OP1)",
    altTitles: ["โตเกียวกูล"],
    difficulty: "normal",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=7aMOurgDB-o&list=RD7aMOurgDB-o&start_radio=1",
    acceptedAnswers: ["tokyo ghoul", "โตเกียวกูล"],
    note: "Unravel"
  },
  {
    id: 9,
    title: "Steins;Gate (OP1)",
    altTitles: ["ชไตน์สเกท"],
    difficulty: "hard",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=1FPdtR_5KFo&list=RD1FPdtR_5KFo&start_radio=1",
    acceptedAnswers: ["steins gate", "steins;gate", "ชไตน์สเกท"],
    note: "Hacking to the Gate"
  },
  {
    id: 10,
    title: "Code Geass: Hangyaku no Lelouch (OP1)",
    altTitles: ["โค้ดกีอัส"],
    difficulty: "hard",
    year: 2006,
    youtubeVideoId: "G8CFuZ9MseQ",
    acceptedAnswers: ["code geass", "โค้ดกีอัส"],
    note: "Colors"
  },
  {
    id: 11,
    title: "Sword Art Online (OP1)",
    altTitles: ["SAO", "ซอร์ดอาร์ตออนไลน์"],
    difficulty: "easy",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=6Y1swEeFwYo&list=RD6Y1swEeFwYo&start_radio=1",
    acceptedAnswers: ["sword art online", "sao", "ซอร์ดอาร์ตออนไลน์"],
    note: "Crossing Field"
  },
  {
    id: 12,
    title: "Fate/Zero (OP1)",
    altTitles: ["เฟท/ซีโร่", "ปฐมบทสงครามจอกศักดิ์สิทธิ์"],
    difficulty: "normal",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=gCnCFtbY0ZI&list=RDgCnCFtbY0ZI&start_radio=1",
    acceptedAnswers: ["fate zero", "fate/zero", "เฟทซีโร่", "เฟท/ซีโร่"],
    note: "oath sign"
  },
  {
    id: 13,
    title: "Fate - Stay Night (OP1)",
    altTitles: ["Fate UBW", "มหาสงครามจอกศักดิ์สิทธิ์"],
    difficulty: "hard",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=7vZp3yGxZXE&list=RD7vZp3yGxZXE&start_radio=1",
    acceptedAnswers: ["fate stay night", "fate ubw", "fate/stay night", "มหาสงครามจอกศักดิ์สิทธิ์"],
    note: "Brave Shine"
  },
  {
    id: 14,
    title: "No Game No Life (OP1)",
    altTitles: ["โนเกม โนไลฟ์"],
    difficulty: "normal",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=8p4e0URzGyE&list=RD8p4e0URzGyE&start_radio=1",
    acceptedAnswers: ["no game no life", "โนเกมโนไลฟ์", "โนเกม โนไลฟ์"],
    note: "This game"
  },
  {
    id: 15,
    title: "Log Horizon (OP1)",
    altTitles: ["ล็อกฮอไรซอน"],
    difficulty: "hard",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=SXTLVPt2GD4&list=RDSXTLVPt2GD4&start_radio=1",
    acceptedAnswers: ["log horizon", "ล็อกฮอไรซอน"],
    note: "database"
  },
  {
    id: 16,
    title: "Overlord (OP1)",
    altTitles: ["โอเวอร์ลอร์ด", "จอมมารพิชิตโลก"],
    difficulty: "normal",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=KOWcj7XKnfQ&list=RDKOWcj7XKnfQ&start_radio=1",
    acceptedAnswers: ["overlord", "โอเวอร์ลอร์ด", "จอมมารพิชิตโลก"],
    note: "Clattanoia"
  },
  {
    id: 17,
    title: "Saga of Tanya the Evil (Youjo Senki) (OP1)",
    altTitles: ["Youjo Senki", "บันทึกสงครามของยัยเผด็จการ"],
    difficulty: "hard",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=voC3PvD_iZw&list=RDvoC3PvD_iZw&start_radio=1",
    acceptedAnswers: ["saga of tanya the evil", "youjo senki", "บันทึกสงครามของยัยเผด็จการ"],
    note: "JINGO JUNGLE"
  },
  {
    id: 18,
    title: "86 Eighty-Six (OP1)",
    altTitles: ["เอทตี้ซิกซ์"],
    difficulty: "hard",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=bYI_DNWEoZs&list=RDbYI_DNWEoZs&start_radio=1",
    acceptedAnswers: ["86", "eighty six", "เอทตี้ซิกซ์"],
    note: "3-pun 29-byou"
  },
  {
    id: 19,
    title: "Ghost in the Shell: Stand Alone Complex (OP1)",
    altTitles: ["โกสต์ อิน เดอะ เชลล์"],
    difficulty: "hard",
    year: 2002,
    youtubeVideoId: "https://www.youtube.com/watch?v=QxkMzn4et2U&list=RDQxkMzn4et2U&start_radio=1",
    acceptedAnswers: ["ghost in the shell", "ghost in the shell stand alone complex", "โกสต์ อิน เดอะ เชลล์"],
    note: "Inner Universe"
  },
  {
    id: 20,
    title: "Cyberpunk: Edgerunners (OP1)",
    altTitles: ["ไซเบอร์พังก์: เอดจ์รันเนอร์ส"],
    difficulty: "normal",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=OifiVCnFKzM",
    acceptedAnswers: ["cyberpunk", "cyberpunk edgerunners", "ไซเบอร์พังก์"],
    note: "This Fffire"
  },
  {
    id: 21,
    title: "Neon Genesis Evangelion (OP1)",
    altTitles: ["อีวานเกเลียน", "Evangelion"],
    difficulty: "easy",
    year: 1995,
    youtubeVideoId: "https://www.youtube.com/watch?v=nU21rCWkuJw&list=RDnU21rCWkuJw&start_radio=1",
    acceptedAnswers: ["neon genesis evangelion", "evangelion", "อีวานเกเลียน"],
    note: "A Cruel Angel's Thesis"
  },
  {
    id: 22,
    title: "Boku no Hero Academia (OP1)",
    altTitles: ["Boku no Hero Academia", "มายฮีโร่ อคาเดเมีย"],
    difficulty: "easy",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=yu0HjPzFYnY&list=RDyu0HjPzFYnY&start_radio=1",
    acceptedAnswers: ["my hero academia", "boku no hero academia", "มายฮีโร่ อคาเดเมีย"],
    note: "The Day"
  },
  {
    id: 23,
    title: "Hunter x Hunter (OP1)",
    altTitles: ["ฮันเตอร์ x ฮันเตอร์"],
    difficulty: "easy",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=3wQiyOmAUOA&list=RD3wQiyOmAUOA&start_radio=1",
    acceptedAnswers: ["hunter x hunter", "ฮันเตอร์ x ฮันเตอร์", "hunter hunter"],
    note: "Departure!"
  },
  {
    id: 24,
    title: "Bleach (OP1)",
    altTitles: ["บลีช เทพมรณะ", "บลีช"],
    difficulty: "easy",
    year: 2004,
    youtubeVideoId: "https://www.youtube.com/watch?v=_ty-Nqm4Pdc&list=RD_ty-Nqm4Pdc&start_radio=1",
    acceptedAnswers: ["bleach", "บลีช", "บลีช เทพมรณะ"],
    note: "Asterisk"
  },
  {
    id: 25,
    title: "Fairy Tail (OP1)",
    altTitles: ["แฟรี่เทล", "ศึกจอมเวทอภินิหาร"],
    difficulty: "normal",
    year: 2009,
    youtubeVideoId: "https://www.youtube.com/watch?v=9jvVBVcZ0-Y&list=RD9jvVBVcZ0-Y&start_radio=1",
    acceptedAnswers: ["fairy tail", "แฟรี่เทล", "ศึกจอมเวทอภินิหาร"],
    note: "Snow Fairy"
  },
  {
    id: 26,
    title: "Black Clover (OP1)",
    altTitles: ["แบล็คโคลเวอร์"],
    difficulty: "normal",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=_6KZI74zKfE&list=RD_6KZI74zKfE&start_radio=1",
    acceptedAnswers: ["black clover", "แบล็คโคลเวอร์"],
    note: "Haruka Mirai"
  },
  {
    id: 27,
    title: "JoJo's Bizarre Adventure (OVA) (OP1)",
    altTitles: ["JoJo", "โจโจ้ ล่าข้ามศตวรรษ"],
    difficulty: "easy",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=1ZKAQzGYYSo&list=RD1ZKAQzGYYSo&start_radio=1",
    acceptedAnswers: ["jojo's bizarre adventure", "jojo", "โจโจ้", "โจโจ้ ล่าข้ามศตวรรษ"],
    note: "Sono Chi no Sadame"
  },
  {
    id: 28,
    title: "Gintama (OP1)",
    altTitles: ["กินทามะ"],
    difficulty: "normal",
    year: 2006,
    youtubeVideoId: "https://www.youtube.com/watch?v=Kw3eQIiq4KI&list=RDKw3eQIiq4KI&start_radio=1",
    acceptedAnswers: ["gintama", "กินทามะ"],
    note: "Pray"
  },
  {
    id: 29,
    title: "Haikyuu!! (OP1)",
    altTitles: ["ไฮคิว!! คู่ตบฟ้าประทาน", "ไฮคิว"],
    difficulty: "easy",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=KBkqRCn4INY&list=RDKBkqRCn4INY&start_radio=1",
    acceptedAnswers: ["haikyuu", "haikyu", "ไฮคิว", "ไฮคิว คู่ตบฟ้าประทาน"],
    note: "Imagination"
  },
  {
    id: 30,
    title: "Shigatsu wa Kimi no Uso (OP1)",
    altTitles: ["Shigatsu wa Kimi no Uso", "เพลงรักสองหัวใจ"],
    difficulty: "normal",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=fBsfD0Eytjw&list=RDfBsfD0Eytjw&start_radio=1",
    acceptedAnswers: ["your lie in april", "shigatsu wa kimi no uso", "เพลงรักสองหัวใจ"],
    note: "Hikaru Nara"
  },
  {
    id: 31,
    title: "One Punch Man (OP1)",
    altTitles: ["วันพั้นช์แมน", "เทพบุตรหมัดเดียวจอด"],
    difficulty: "easy",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=atxYe-nOa9w&list=RDatxYe-nOa9w&start_radio=1",
    acceptedAnswers: ["one punch man", "วันพั้นช์แมน", "เทพบุตรหมัดเดียวจอด"],
    note: "The Hero!! ~Ikareru Ken ni Honou o Tsukero~"
  },
  {
    id: 32,
    title: "Mob Psycho 100 (OP1)",
    altTitles: ["ม็อบไซโค 100", "ม็อบไซโค 100 คนพลังจิต"],
    difficulty: "normal",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=FuKhBIoVuSg&list=RDFuKhBIoVuSg&start_radio=1",
    acceptedAnswers: ["mob psycho 100", "ม็อบไซโค 100", "ม็อบไซโค"],
    note: "99"
  },
  {
    id: 33,
    title: "Cowboy Bebop (OP1)",
    altTitles: ["คาวบอย บีบ๊อป"],
    difficulty: "hard",
    year: 1998,
    youtubeVideoId: "https://www.youtube.com/watch?v=0hfOyOBHIq4&list=RD0hfOyOBHIq4&start_radio=1",
    acceptedAnswers: ["cowboy bebop", "คาวบอย บีบ๊อป"],
    note: "Tank!"
  },
  {
    id: 34,
    title: "Sailor Moon (OP1)",
    altTitles: ["เซเลอร์มูน"],
    difficulty: "easy",
    year: 1992,
    youtubeVideoId: "https://www.youtube.com/watch?v=LGQCPOMcYJQ&list=RDLGQCPOMcYJQ&start_radio=1",
    acceptedAnswers: ["sailor moon", "เซเลอร์มูน"],
    note: "Moonlight Densetsu"
  },
  {
    id: 35,
    title: "Dragon Ball Z (OP1)",
    altTitles: ["ดราก้อนบอล Z"],
    difficulty: "easy",
    year: 1989,
    youtubeVideoId: "https://www.youtube.com/watch?v=98bLzNWpAPo",
    acceptedAnswers: ["dragon ball z", "dragon ball", "ดราก้อนบอล", "ดราก้อนบอล z"],
    note: "Cha-La Head-Cha-La"
  },
  {
    id: 36,
    title: "Pokemon (OP1)",
    altTitles: ["โปเกมอน"],
    difficulty: "easy",
    year: 1997,
    youtubeVideoId: "https://www.youtube.com/watch?v=6xKWiCMKKJg&list=RD6xKWiCMKKJg&start_radio=1",
    acceptedAnswers: ["pokemon", "pokémon", "โปเกมอน"],
    note: "Mezase Pokémon Master"
  },
  {
    id: 37,
    title: "Digimon Adventure (OP1)",
    altTitles: ["ดิจิมอน แอดเวนเจอร์"],
    difficulty: "easy",
    year: 1999,
    youtubeVideoId: "https://www.youtube.com/watch?v=XV2TfYSgXT4&list=RDXV2TfYSgXT4&start_radio=1",
    acceptedAnswers: ["digimon adventure", "digimon", "ดิจิมอน", "ดิจิมอน แอดเวนเจอร์"],
    note: "Butter-Fly"
  },
  {
    id: 38,
    title: "Detective Conan (OP1)",
    altTitles: ["ยอดนักสืบจิ๋วโคนัน", "โคนัน"],
    difficulty: "easy",
    year: 1996,
    youtubeVideoId: "https://www.youtube.com/watch?v=oiKkp7pcau0&list=RDoiKkp7pcau0&start_radio=1",
    acceptedAnswers: ["detective conan", "conan", "ยอดนักสืบจิ๋วโคนัน", "โคนัน"],
    note: "Mune ga Doki Doki"
  },
  {
    id: 39,
    title: "K-On! (OP1)",
    altTitles: ["เค-อง!", "ก๊วนดนตรีแป๋วแหวว"],
    difficulty: "normal",
    year: 2009,
    youtubeVideoId: "https://www.youtube.com/watch?v=qN41mx4tA0I&list=RDqN41mx4tA0I&start_radio=1",
    acceptedAnswers: ["k-on!", "k on", "เค-อง!", "เคอง"],
    note: "Cagayake! GIRLS"
  },
  {
    id: 40,
    title: "Toradora! (OP1)",
    altTitles: ["โทระโดระ", "ยัยตัวร้ายกับนายหน้าโหด"],
    difficulty: "hard",
    year: 2008,
    youtubeVideoId: "https://www.youtube.com/watch?v=BDoNRDqgmT0&list=RDBDoNRDqgmT0&start_radio=1",
    acceptedAnswers: ["toradora!", "toradora", "โทระโดระ", "ยัยตัวร้ายกับนายหน้าโหด"],
    note: "Pre-Parade"
  },
  {
    id: 41,
    title: "Re:ZERO -Starting Life in Another World- (OP1)",
    altTitles: ["Re:Zero - Starting Life in Another World", "รีเซทชีวิต ฝ่าวิกฤตต่างโลก"],
    difficulty: "normal",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=zoqqPshRCuQ&list=RDzoqqPshRCuQ&start_radio=1",
    acceptedAnswers: ["re:zero", "rezero", "รีเซทชีวิต ฝ่าวิกฤตต่างโลก", "รีเซโร่"],
    note: "Redo"
  },
  {
    id: 42,
    title: "KonoSuba: God's Blessing on This Wonderful World! (OP1)",
    altTitles: ["ขอให้โชคดีมีชัยในโลกแฟนตาซี!"],
    difficulty: "normal",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=Yf3yO5r4LG8&list=RDYf3yO5r4LG8&start_radio=1",
    acceptedAnswers: ["konosuba", "ขอให้โชคดีมีชัยในโลกแฟนตาซี!"],
    note: "fantastic dreamer"
  },
  {
    id: 43,
    title: "Tokyo Revengers (OP1)",
    altTitles: ["โตเกียว รีเวนเจอร์ส"],
    difficulty: "easy",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=2qbHikwRimU&list=RD2qbHikwRimU&start_radio=1",
    acceptedAnswers: ["tokyo revengers", "โตเกียว รีเวนเจอร์ส", "โตเกียวรีเวนเจอร์"],
    note: "Cry Baby"
  },
  {
    id: 44,
    title: "Chainsaw Man (OP1)",
    altTitles: ["เชนซอว์แมน"],
    difficulty: "easy",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=dFlDRhvM4L0&list=RDdFlDRhvM4L0&start_radio=1",
    acceptedAnswers: ["chainsaw man", "เชนซอว์แมน"],
    note: "KICK BACK"
  },
  {
    id: 45,
    title: "Spy x Family (OP1)",
    altTitles: ["สปาย x แฟมิลี"],
    difficulty: "easy",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=U_rWZK_8vUY&list=RDU_rWZK_8vUY&start_radio=1",
    acceptedAnswers: ["spy x family", "spy family", "สปายแฟมิลี", "สปาย x แฟมิลี"],
    note: "Mixed Nuts"
  },
  {
    id: 46,
    title: "[Oshi no Ko] (OP1)",
    altTitles: ["เกิดใหม่เป็นลูกโอชิ"],
    difficulty: "easy",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=PgBvV9ofjmA&list=RDPgBvV9ofjmA&start_radio=1",
    acceptedAnswers: ["oshi no ko", "เกิดใหม่เป็นลูกโอชิ", "ลูกโอชิ"],
    note: "Idol"
  },
  {
    id: 47,
    title: "Sousou no Frieren (OP1)",
    altTitles: ["Sousou no Frieren", "คำอธิษฐานในวันที่จากลา"],
    difficulty: "normal",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=QoGM9hCxr4k&list=RDQoGM9hCxr4k&start_radio=1",
    acceptedAnswers: ["frieren", "sousou no frieren", "คำอธิษฐานในวันที่จากลา", "ฟรีเรน"],
    note: "Yuusha"
  },
  {
    id: 48,
    title: "Slam Dunk (OP1)",
    altTitles: ["สแลมดังก์"],
    difficulty: "normal",
    year: 1993,
    youtubeVideoId: "https://www.youtube.com/watch?v=m_QP5_rdH_g&list=RDm_QP5_rdH_g&start_radio=1",
    acceptedAnswers: ["slam dunk", "สแลมดังก์"],
    note: "Kimi ga Suki da to Sakebitai"
  },
  {
    id: 49,
    title: "InuYasha (OP1)",
    altTitles: ["อินุยาฉะ", "เทพอสูรจิ้งจอกเงิน"],
    difficulty: "easy",
    year: 2000,
    youtubeVideoId: "https://www.youtube.com/watch?v=BbHsd4PAME0&list=RDBbHsd4PAME0&start_radio=1",
    acceptedAnswers: ["inuyasha", "อินุยาฉะ", "เทพอสูรจิ้งจอกเงิน"],
    note: "Change the World"
  },
  {
    id: 50,
    title: "Dr. Stone (OP1)",
    altTitles: ["ดร.สโตน"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=tF4faMbs5oQ&list=RDtF4faMbs5oQ&start_radio=1",
    acceptedAnswers: ["dr. stone", "dr stone", "ดร.สโตน", "ดอกเตอร์สโตน"],
    note: "Good Morning World!"
  },
  {
    id: 51,
    title: "Kuroko no Basket (OP1)",
    altTitles: ["Kuroko no Basket", "คุโรโกะ โนะ บาสเก็ต"],
    difficulty: "easy",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=1umkp0ATUn8&list=RD1umkp0ATUn8&start_radio=1",
    acceptedAnswers: ["kuroko no basket", "kuroko's basketball", "คุโรโกะ", "คุโรโกะ โนะ บาสเก็ต"],
    note: "Can Do"
  },
  {
    id: 52,
    title: "Ansatsu Kyoushitsu (OP1)",
    altTitles: ["Ansatsu Kyoushitsu", "ห้องเรียนลอบสังหาร"],
    difficulty: "normal",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=Tgla0Q88V_Y&list=RDTgla0Q88V_Y&start_radio=1",
    acceptedAnswers: ["assassination classroom", "ansatsu kyoushitsu", "ห้องเรียนลอบสังหาร"],
    note: "Seishun Satsubatsuron"
  },
  {
    id: 53,
    title: "Trinity Seven: The Seven Deadly Sins and The Seven Mages (OP1)",
    altTitles: ["Nanatsu no Taizai", "ศึกตำนาน 7 อัศวิน"],
    difficulty: "easy",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=MHsp-KkGo_g&list=RDMHsp-KkGo_g&start_radio=1",
    acceptedAnswers: ["the seven deadly sins", "nanatsu no taizai", "ศึกตำนาน 7 อัศวิน", "บาป 7 ประการ"],
    note: "Netsujou no Spectrum"
  },
  {
    id: 54,
    title: "That Time I Got Reincarnated as a Slime (OP1)",
    altTitles: ["TenSura", "เกิดใหม่ทั้งทีก็เป็นสไลม์ไปซะแล้ว"],
    difficulty: "normal",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=ZhvUomsfG8o&list=RDZhvUomsfG8o&start_radio=1",
    acceptedAnswers: ["that time i got reincarnated as a slime", "tensura", "เกิดใหม่ทั้งทีก็เป็นสไลม์ไปซะแล้ว", "สไลม์"],
    note: "Nameless Story"
  },
  {
    id: 55,
    title: "Akame ga Kill! (OP1)",
    altTitles: ["อาคาเมะ สวยประหาร"],
    difficulty: "normal",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=wVFWBoKP-lQ&list=RDwVFWBoKP-lQ&start_radio=1",
    acceptedAnswers: ["akame ga kill!", "akame ga kill", "อาคาเมะ สวยประหาร", "อาคาเมะ"],
    note: "Skyreach"
  },
  {
    id: 56,
    title: "Parasyte: The Maxim (OP1)",
    altTitles: ["Kiseijuu", "ปรสิต เดรัจฉาน"],
    difficulty: "hard",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=Rm8UjBAS3cs&list=RDRm8UjBAS3cs&start_radio=1",
    acceptedAnswers: ["parasyte the maxim", "parasyte", "kiseijuu", "ปรสิต", "ปรสิต เดรัจฉาน"],
    note: "Let Me Hear"
  },
  {
    id: 57,
    title: "Boku dake ga Inai Machi (OP1)",
    altTitles: ["Boku dake ga Inai Machi", "รีไววัล ย้อนอดีตไขปริศนา"],
    difficulty: "normal",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=fodAJ-1dN3I&list=RDfodAJ-1dN3I&start_radio=1",
    acceptedAnswers: ["erased", "boku dake ga inai machi", "รีไววัล ย้อนอดีตไขปริศนา", "รีไววัล"],
    note: "Re:Re:"
  },
  {
    id: 58,
    title: "Violet Evergarden (OP1)",
    altTitles: ["ไวโอเล็ต เอเวอร์การ์เดน"],
    difficulty: "normal",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=ZAKuyZEyZjY&list=RDZAKuyZEyZjY&start_radio=1",
    acceptedAnswers: ["violet evergarden", "ไวโอเล็ต เอเวอร์การ์เดน", "ไวโอเล็ต"],
    note: "Sincerely"
  },
  {
    id: 59,
    title: "Blue Lock (OP1)",
    altTitles: ["ขังดวลแข้ง"],
    difficulty: "easy",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=8BD8vyNpvMo&list=RD8BD8vyNpvMo&start_radio=1",
    acceptedAnswers: ["blue lock", "ขังดวลแข้ง", "บลูล็อค"],
    note: "Chaos ga Kiwamaru"
  },
  {
    id: 60,
    title: "Mushoku Tensei: Jobless Reincarnation (OP1)",
    altTitles: ["Mushoku Tensei", "เกิดชาตินี้พี่ต้องเทพ"],
    difficulty: "normal",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=pEoCT-Kv5CI&list=RDpEoCT-Kv5CI&start_radio=1",
    acceptedAnswers: ["mushoku tensei", "jobless reincarnation", "เกิดชาตินี้พี่ต้องเทพ"],
    note: "Tabibito no Uta"
  },
  {
    id: 61,
    title: "The Rising of the Shield Hero (OP1)",
    altTitles: ["Tate no Yuusha no Nariagari", "ผู้กล้าโล่ผงาด"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=Plo0RvICDDI&list=RDPlo0RvICDDI&start_radio=1",
    acceptedAnswers: ["the rising of the shield hero", "tate no yuusha", "shield hero", "ผู้กล้าโล่ผงาด"],
    note: "RISE"
  },
  {
    id: 62,
    title: "Shokugeki no Soma (OP1)",
    altTitles: ["Shokugeki no Soma", "ยอดนักปรุงโซมะ"],
    difficulty: "normal",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=Fh6bTCZGDuo",
    acceptedAnswers: ["food wars!", "food wars", "shokugeki no soma", "ยอดนักปรุงโซมะ", "โซมะ"],
    note: "Kibou no Uta"
  },
  {
    id: 63,
    title: "Kaguya-sama: Love is War (OP1)",
    altTitles: ["สารภาพรักกับคุณคางุยะซะดีๆ"],
    difficulty: "easy",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=WZof19wk4Ec&list=RDWZof19wk4Ec&start_radio=1",
    acceptedAnswers: ["kaguya-sama love is war", "kaguya sama", "love is war", "สารภาพรักกับคุณคางุยะซะดีๆ", "คางุยะ"],
    note: "Love Dramatic"
  },
  {
    id: 64,
    title: "Enen no Shouboutai (OP1)",
    altTitles: ["Enen no Shouboutai", "หน่วยผจญคนไฟลุก"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=JBqxVX_LXvk&list=RDJBqxVX_LXvk&start_radio=1",
    acceptedAnswers: ["fire force", "enen no shouboutai", "หน่วยผจญคนไฟลุก"],
    note: "Inferno"
  },
  {
    id: 65,
    title: "Yakusoku no Neverland (OP1)",
    altTitles: ["Yakusoku no Neverland", "พันธสัญญาเนเวอร์แลนด์"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=yB2t5y7ujlg&list=RDyB2t5y7ujlg&start_radio=1",
    acceptedAnswers: ["the promised neverland", "yakusoku no neverland", "พันธสัญญาเนเวอร์แลนด์", "เนเวอร์แลนด์"],
    note: "Touch Off"
  },
  {
    id: 66,
    title: "Made in Abyss (OP1)",
    altTitles: ["ผ่าเหวนรก"],
    difficulty: "hard",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=e91G8m9uM_0&list=RDe91G8m9uM_0&start_radio=1",
    acceptedAnswers: ["made in abyss", "ผ่าเหวนรก"],
    note: "Deep in Abyss"
  },
  {
    id: 67,
    title: "Vinland Saga (OP1)",
    altTitles: ["สงครามคนทมิฬ"],
    difficulty: "hard",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=l5wAdQ-UkWY&list=RDl5wAdQ-UkWY&start_radio=1",
    acceptedAnswers: ["vinland saga", "สงครามคนทมิฬ", "วินแลนด์ ซาก้า"],
    note: "MUKANJYO"
  },
  {
    id: 68,
    title: "Psycho-Pass (OP1)",
    altTitles: ["ไซโคพาส"],
    difficulty: "hard",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=WWBDuVCuiUQ&list=RDWWBDuVCuiUQ&start_radio=1",
    acceptedAnswers: ["psycho-pass", "psycho pass", "ไซโคพาส"],
    note: "abnormalize"
  },
  {
    id: 69,
    title: "Tengen Toppa Gurren Lagann (OP1)",
    altTitles: ["Tengen Toppa Gurren Lagann", "อภินิหารหุ่นทะลวงสวรรค์"],
    difficulty: "hard",
    year: 2007,
    youtubeVideoId: "https://www.youtube.com/watch?v=FwgMxjhXkKo&list=RDFwgMxjhXkKo&start_radio=1",
    acceptedAnswers: ["gurren lagann", "tengen toppa gurren lagann", "อภินิหารหุ่นทะลวงสวรรค์", "กุเร็นลากันน์"],
    note: "Sorairo Days"
  },
  {
    id: 70,
    title: "Kill la Kill (OP1)",
    altTitles: ["คิลลาคิล"],
    difficulty: "normal",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=9_5LhZ7pQpM&list=RD9_5LhZ7pQpM&start_radio=1",
    acceptedAnswers: ["kill la kill", "คิลลาคิล"],
    note: "Sirius"
  },
  {
    id: 71,
    title: "Darling in the FranXX (OP1)",
    altTitles: ["ดาร์ลิง อิน เดอะ แฟรง็อกซ์"],
    difficulty: "normal",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=A4kLcDWBYcQ&list=RDA4kLcDWBYcQ&start_radio=1",
    acceptedAnswers: ["darling in the franxx", "ดาร์ลิง อิน เดอะ แฟรง็อกซ์"],
    note: "KISS OF DEATH"
  },
  {
    id: 72,
    title: "Rascal Does Not Dream of Bunny Girl Senpai (OP1)",
    altTitles: ["Aobuta", "เรื่องฝันปั่นป่วยของผมกับรุ่นพี่บันนี่เกิร์ล"],
    difficulty: "normal",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=HIoeEngUiKU&list=RDHIoeEngUiKU&start_radio=1",
    acceptedAnswers: ["bunny girl senpai", "rascal does not dream of bunny girl senpai", "aobuta", "เรื่องฝันปั่นป่วยของผมกับรุ่นพี่บันนี่เกิร์ล", "รุ่นพี่บันนี่เกิร์ล"],
    note: "Kimi no Sei"
  },
  {
    id: 73,
    title: "Angel Beats! (OP1)",
    altTitles: ["แองเจิลบีทส์! แผนพิชิตนางฟ้า"],
    difficulty: "normal",
    year: 2010,
    youtubeVideoId: "https://www.youtube.com/watch?v=Eksw56g-WBY&list=RDEksw56g-WBY&start_radio=1",
    acceptedAnswers: ["angel beats!", "angel beats", "แองเจิลบีทส์", "แองเจิลบีทส์! แผนพิชิตนางฟ้า"],
    note: "My Soul, Your Beats!"
  },
  {
    id: 74,
    title: "Meiji x Kokosake & anohana Receipt Oubo Campaign (OP1)",
    altTitles: ["ดอกไม้ มิตรภาพ และความทรงจำ"],
    difficulty: "normal",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=FGFNUSn7awY&list=RDFGFNUSn7awY&start_radio=1",
    acceptedAnswers: ["anohana", "ดอกไม้ มิตรภาพ และความทรงจำ", "อโนฮานะ"],
    note: "Aoi Shiori"
  },
  {
    id: 75,
    title: "Kimi no Na wa. (OP1)",
    altTitles: ["Kimi no Na wa.", "หลับตาฝัน ถึงชื่อเธอ"],
    difficulty: "easy",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=lFsg_sDwlak&list=RDlFsg_sDwlak&start_radio=1",
    acceptedAnswers: ["your name", "kimi no na wa", "หลับตาฝัน ถึงชื่อเธอ"],
    note: "Zenzenzense"
  },
  {
    id: 76,
    title: "With You: Mitsumeteitai (OP1)",
    altTitles: ["Tenki no Ko", "ฤดูฝัน ฉันมีเธอ"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=Q6iK6DjV_iE",
    acceptedAnswers: ["weathering with you", "tenki no ko", "ฤดูฝัน ฉันมีเธอ", "ฤดูฝันฉันมีเธอ"],
    note: "Is There Still Anything That Love Can Do?"
  },
  {
    id: 77,
    title: "Koe no Katachi (OP1)",
    altTitles: ["Koe no Katachi", "รักไร้เสียง"],
    difficulty: "normal",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=Zp9nCw96uWA&list=RDZp9nCw96uWA&start_radio=1",
    acceptedAnswers: ["a silent voice", "koe no katachi", "รักไร้เสียง"],
    note: "Koi wo Shita no wa"
  },
  {
    id: 78,
    title: "Nisekoi (OP1)",
    altTitles: ["รักลวงป่วนใจ"],
    difficulty: "normal",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=G5YmZRs_L9k",
    acceptedAnswers: ["nisekoi", "รักลวงป่วนใจ", "นิเซะโค่ย"],
    note: "CLICK"
  },
  {
    id: 79,
    title: "My Teen Romantic Comedy SNAFU (OP1)",
    altTitles: ["Oregairu", "กะแล้วชีวิตรักวัยรุ่นของผมมันต้องไม่สดใสเลยสักนิด"],
    difficulty: "hard",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=Q1W6oINBrnE&list=RDQ1W6oINBrnE&start_radio=1",
    acceptedAnswers: ["oregairu", "my teen romantic comedy snafu", "กะแล้วชีวิตรักวัยรุ่นของผมมันต้องไม่สดใสเลยสักนิด"],
    note: "Yukitoki"
  },
  {
    id: 80,
    title: "Horimiya (OP1)",
    altTitles: ["โฮริมิยะ สาวมั่นกับนายมืดมน"],
    difficulty: "normal",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=OkPUJspnE6Q&list=RDOkPUJspnE6Q&start_radio=1",
    acceptedAnswers: ["horimiya", "โฮริมิยะ สาวมั่นกับนายมืดมน", "โฮริมิยะ"],
    note: "Iro Kousui"
  },
  {
    id: 81,
    title: "High School DxD (OP1)",
    altTitles: ["ไฮสคูล DxD"],
    difficulty: "normal",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=Q9vrYRhnDrc&list=RDQ9vrYRhnDrc&start_radio=1",
    acceptedAnswers: ["high school dxd", "ไฮสคูล dxd"],
    note: "Trip -innocent of D-"
  },
  {
    id: 82,
    title: "Date A Live (OP1)",
    altTitles: ["พิชิตรัก พิทักษ์โลก"],
    difficulty: "normal",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=6GW0wXMt2CQ&list=RD6GW0wXMt2CQ&start_radio=1",
    acceptedAnswers: ["date a live", "พิชิตรัก พิทักษ์โลก", "เดทอะไลฟ์"],
    note: "Date A Live"
  },
  {
    id: 83,
    title: "Mirai Nikki (OP1)",
    altTitles: ["Mirai Nikki", "บันทึกมรณะ เกมล่าท้าอนาคต"],
    difficulty: "normal",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=LLDA9cfRLlg&list=RDLLDA9cfRLlg&start_radio=1",
    acceptedAnswers: ["future diary", "mirai nikki", "บันทึกมรณะ เกมล่าท้าอนาคต", "บันทึกมรณะ"],
    note: "Kuusou Mesorogiwi"
  },
  {
    id: 84,
    title: "Guilty Crown (OP1)",
    altTitles: ["ปฏิวัติหัตถ์ราชัน"],
    difficulty: "hard",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=W10RXr9c44Y&list=RDW10RXr9c44Y&start_radio=1",
    acceptedAnswers: ["guilty crown", "ปฏิวัติหัตถ์ราชัน", "กิลตี้คราวน์"],
    note: "Euterpe"
  },
  {
    id: 85,
    title: "Danganronpa: The Animation (OP1)",
    altTitles: ["ดันกันรอนปะ"],
    difficulty: "hard",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=Avr-Iu5vWsM&list=RDAvr-Iu5vWsM&start_radio=1",
    acceptedAnswers: ["danganronpa", "danganronpa the animation", "ดันกันรอนปะ"],
    note: "Never Say Never"
  },
  {
    id: 86,
    title: "Fate/Grand Order (OP1)",
    altTitles: ["FGO Babylonia", "เฟท/แกรนด์ออเดอร์"],
    difficulty: "hard",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=62hOiNH0K44&list=RD62hOiNH0K44&start_radio=1",
    acceptedAnswers: ["fate grand order", "fgo", "fate/grand order", "เฟทแกรนด์ออเดอร์"],
    note: "Phantom Joke"
  },
  {
    id: 87,
    title: "Fate/Apocrypha (OP1)",
    altTitles: ["เฟท/อะพอคริฟา"],
    difficulty: "hard",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=4uvtngN0PaA&list=RD4uvtngN0PaA&start_radio=1",
    acceptedAnswers: ["fate apocrypha", "fate/apocrypha", "เฟทอะพอคริฟา", "เฟท/อะพอคริฟา"],
    note: "Eiyuu Unmei no Uta"
  },
  {
    id: 88,
    title: "Soul Eater (OP1)",
    altTitles: ["โซลอีทเตอร์"],
    difficulty: "normal",
    year: 2008,
    youtubeVideoId: "https://www.youtube.com/watch?v=zzJ8U8OtEsE&list=RDzzJ8U8OtEsE&start_radio=1",
    acceptedAnswers: ["soul eater", "โซลอีทเตอร์"],
    note: "Counter Identity"
  },
  {
    id: 89,
    title: "Ao no Exorcist (OP1)",
    altTitles: ["Ao no Exorcist", "เอ็กซอร์ซิสต์พันธุ์ปีศาจ"],
    difficulty: "normal",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=s99s4VCtCP8&list=RDs99s4VCtCP8&start_radio=1",
    acceptedAnswers: ["blue exorcist", "ao no exorcist", "เอ็กซอร์ซิสต์พันธุ์ปีศาจ", "บลูเอ็กซอร์ซิสต์"],
    note: "CORE PRIDE"
  },
  {
    id: 90,
    title: "Noragami (OP1)",
    altTitles: ["โนรางามิ เทวดาขาจร"],
    difficulty: "normal",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=gWCnKoEgfP0&list=RDgWCnKoEgfP0&start_radio=1",
    acceptedAnswers: ["noragami", "โนรางามิ เทวดาขาจร", "โนรางามิ"],
    note: "Goya no Machiawase (午夜の待ち合わせ)"
  },
  {
    id: 91,
    title: "Akatsuki no Yona (OP1)",
    altTitles: ["Akatsuki no Yona", "กู้บัลลังก์มังกรแดง"],
    difficulty: "hard",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=3Tz3vxwJf6I",
    acceptedAnswers: ["yona of the dawn", "akatsuki no yona", "กู้บัลลังก์มังกรแดง", "โยนะ"],
    note: "Akatsuki no Yona"
  },
  {
    id: 92,
    title: "Magi: The Labyrinth of Magic (OP1)",
    altTitles: ["เมจิ อาลาดินผจญภัย"],
    difficulty: "normal",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=pwO2AVjTH9k&list=RDpwO2AVjTH9k&start_radio=1",
    acceptedAnswers: ["magi", "magi the labyrinth of magic", "เมจิ อาลาดินผจญภัย", "เมจิ"],
    note: "V.I.P"
  },
  {
    id: 93,
    title: "Kanojo, Okarishimasu (OP1)",
    altTitles: ["Kanojo, Okarishimasu", "สะดุดรักยัยแฟนเช่า"],
    difficulty: "normal",
    year: 2020,
    youtubeVideoId: "https://www.youtube.com/watch?v=4ItqbEY5200&list=RD4ItqbEY5200&start_radio=1",
    acceptedAnswers: ["rent a girlfriend", "kanojo okarishimasu", "สะดุดรักยัยแฟนเช่า", "แฟนเช่า"],
    note: "Centimeter"
  },
  {
    id: 94,
    title: "The Quintessential Quintuplets (OP1)",
    altTitles: ["Gotoubun no Hanayome", "เจ้าสาวผมเป็นแฝดห้า"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=FKIT6G_lw7c&list=RDFKIT6G_lw7c&start_radio=1",
    acceptedAnswers: ["the quintessential quintuplets", "gotoubun no hanayome", "เจ้าสาวผมเป็นแฝดห้า", "แฝดห้า"],
    note: "Gotoubun no Kimochi"
  },
  {
    id: 95,
    title: "Lycoris Recoil (OP1)",
    altTitles: ["ไลโคริส รีคอยล์"],
    difficulty: "normal",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=VxR_BYPG7v4&list=RDVxR_BYPG7v4&start_radio=1",
    acceptedAnswers: ["lycoris recoil", "ไลโคริส รีคอยล์"],
    note: "ALIVE"
  },
  {
    id: 96,
    title: "Bocchi the Rock! (OP1)",
    altTitles: ["บจจิเดอะร็อก!"],
    difficulty: "normal",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=Yd8kUoB72xU&list=RDYd8kUoB72xU&start_radio=1",
    acceptedAnswers: ["bocchi the rock!", "bocchi the rock", "บจจิเดอะร็อก!", "บจจิเดอะร็อก"],
    note: "Seishun Complex (青春コンプレックス)"
  },
  {
    id: 97,
    title: "Kakegurui (OP1)",
    altTitles: ["โคตรเซียนโรงเรียนพนัน"],
    difficulty: "normal",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=7hBoJDcBt28&list=RD7hBoJDcBt28&start_radio=1",
    acceptedAnswers: ["kakegurui", "โคตรเซียนโรงเรียนพนัน", "คาเคกุรุย"],
    note: "โรงเรียนพนันที่มีแต่คนบ้าๆ"
  },
  {
    id: 98,
    title: "No Game No Life: Zero (OP1)",
    altTitles: ["โนเกม โนไลฟ์ ซีโร่"],
    difficulty: "hard",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=EOVQh5xyrKg&list=RDEOVQh5xyrKg&start_radio=1",
    acceptedAnswers: ["no game no life zero", "โนเกม โนไลฟ์ ซีโร่", "โนเกมโนไลฟ์ ซีโร่"],
    note: "THERE IS A REASON"
  },
  {
    id: 99,
    title: "Kuroshitsuji (OP1)",
    altTitles: ["Kuroshitsuji", "คนลึกไขปริศนาลับ"],
    difficulty: "normal",
    year: 2008,
    youtubeVideoId: "https://www.youtube.com/watch?v=7q0lNz_5vLo&list=RD7q0lNz_5vLo&start_radio=1",
    acceptedAnswers: ["black butler", "kuroshitsuji", "คนลึกไขปริศนาลับ", "พ่อบ้านดำ"],
    note: "Monochrome no Kiss (モノクロのキス)"
  },
  {
    id: 100,
    title: "Suzume no Tojimari (OP1)",
    altTitles: ["Suzume no Tojimari", "การผนึกประตูของซุซุเมะ"],
    difficulty: "easy",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=F7nQ0VUAOXg",
    acceptedAnswers: ["suzume", "suzume no tojimari", "การผนึกประตูของซุซุเมะ", "ซุซุเมะ"],
    note: "Suzume"
  },
  {
    id: 101,
    title: "Ghost in the Shell: Arise - Border:1 Ghost Pain (OP1)",
    altTitles: ["โกสต์ อิน เดอะ เชลล์"],
    difficulty: "hard",
    year: 1995,
    youtubeVideoId: "https://www.youtube.com/watch?v=QxkMzn4et2U&list=RDQxkMzn4et2U&start_radio=1",
    acceptedAnswers: ["ghost in the shell", "โกสต์ อิน เดอะ เชลล์"],
    note: "Making of Cyborg"
  },
  {
    id: 102,
    title: "Akira (OP1)",
    altTitles: ["อากิระ"],
    difficulty: "hard",
    year: 1988,
    youtubeVideoId: "https://www.youtube.com/watch?v=rubRpPgbY_w",
    acceptedAnswers: ["akira", "อากิระ"],
    note: "Kaneda's Theme"
  },
  {
    id: 103,
    title: "Mobile Suit Gundam SEED (OP1)",
    altTitles: ["Gundam SEED", "กันดั้มซี้ด"],
    difficulty: "normal",
    year: 2002,
    youtubeVideoId: "https://www.youtube.com/watch?v=a772kuDLGO8&list=RDa772kuDLGO8&start_radio=1",
    acceptedAnswers: ["gundam seed", "mobile suit gundam seed", "กันดั้มซี้ด"],
    note: "Invoke"
  },
  {
    id: 104,
    title: "Mobile Suit Gundam 00 (OP1)",
    altTitles: ["Gundam 00", "กันดั้มดับเบิลโอ"],
    difficulty: "normal",
    year: 2007,
    youtubeVideoId: "https://www.youtube.com/watch?v=04wwfBUbvh4&list=RD04wwfBUbvh4&start_radio=1",
    acceptedAnswers: ["gundam 00", "mobile suit gundam 00", "กันดั้ม 00", "กันดั้มดับเบิลโอ"],
    note: "Daybreak's Bell"
  },
  {
    id: 105,
    title: "Fate/stay night (OP1)",
    altTitles: ["มหาสงครามจอกศักดิ์สิทธิ์"],
    difficulty: "hard",
    year: 2006,
    youtubeVideoId: "https://www.youtube.com/watch?v=Qy7Q77ZD_ME&list=RDQy7Q77ZD_ME&start_radio=1",
    acceptedAnswers: ["fate stay night", "fate/stay night", "มหาสงครามจอกศักดิ์สิทธิ์"],
    note: "disillusion"
  },
  {
    id: 106,
    title: "Fate/stay night: Heaven's Feel - I. Presage Flower (OP1)",
    altTitles: ["เฮฟเวนส์ฟีล"],
    difficulty: "hard",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=eZJhmvRB8vc&list=RDeZJhmvRB8vc&start_radio=1",
    acceptedAnswers: ["heaven's feel", "fate stay night heavens feel", "เฮฟเวนส์ฟีล"],
    note: "Hana no Uta"
  },
  {
    id: 107,
    title: "Hellsing Ultimate (OP1)",
    altTitles: ["เฮลล์ซิง อัลติเมท"],
    difficulty: "hard",
    year: 2006,
    youtubeVideoId: "https://www.youtube.com/watch?v=jcfXC36ZwWk&list=RDjcfXC36ZwWk&start_radio=1",
    acceptedAnswers: ["hellsing", "hellsing ultimate", "เฮลล์ซิง"],
    note: "Gradus Vita"
  },
  {
    id: 108,
    title: "Berserk (OP1)",
    altTitles: ["เบอร์เซิร์ก", "นักรบวิปลาส"],
    difficulty: "hard",
    year: 1997,
    youtubeVideoId: "https://www.youtube.com/watch?v=pOXMt5O4Ly4&list=RDpOXMt5O4Ly4&start_radio=1",
    acceptedAnswers: ["berserk", "เบอร์เซิร์ก"],
    note: "Tell Me Why"
  },
  {
    id: 109,
    title: "Overlord II (OP1)",
    altTitles: ["โอเวอร์ลอร์ด ภาค 2"],
    difficulty: "normal",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=q6SAoV-3saw&list=RDq6SAoV-3saw&start_radio=1",
    acceptedAnswers: ["overlord", "overlord 2", "โอเวอร์ลอร์ด"],
    note: "GO CRY GO"
  },
  {
    id: 110,
    title: "Re:ZERO -Starting Life in Another World- Season 2 (OP1)",
    altTitles: ["รีเซทชีวิต ฝ่าวิกฤตต่างโลก ภาค 2"],
    difficulty: "normal",
    year: 2020,
    youtubeVideoId: "https://www.youtube.com/watch?v=V7ZEEymq0DQ&list=RDV7ZEEymq0DQ&start_radio=1",
    acceptedAnswers: ["re:zero", "rezero", "รีเซโร่"],
    note: "Realize"
  },
  {
    id: 111,
    title: "Clannad (OP1)",
    altTitles: ["แคลนนาด"],
    difficulty: "normal",
    year: 2007,
    youtubeVideoId: "https://www.youtube.com/watch?v=oHdZOKm5xzo&list=RDoHdZOKm5xzo&start_radio=1",
    acceptedAnswers: ["clannad", "แคลนนาด"],
    note: "Mag Mell"
  },
  {
    id: 112,
    title: "Great Teacher Onizuka (OP1)",
    altTitles: ["GTO", "คุณครูพันธุ์หายาก"],
    difficulty: "normal",
    year: 1999,
    youtubeVideoId: "https://www.youtube.com/watch?v=2JGl6UzfPkE&list=RD2JGl6UzfPkE&start_radio=1",
    acceptedAnswers: ["gto", "great teacher onizuka", "จีทีโอ", "คุณครูพันธุ์หายาก"],
    note: "Driver's High"
  },
  {
    id: 113,
    title: "Rurouni Kenshin (OP1)",
    altTitles: ["Samurai X", "ซามูไรพเนจร"],
    difficulty: "easy",
    year: 1996,
    youtubeVideoId: "https://www.youtube.com/watch?v=YvvlGma6COM&list=RDYvvlGma6COM&start_radio=1",
    acceptedAnswers: ["rurouni kenshin", "samurai x", "ซามูไรพเนจร", "เคนชิน"],
    note: "Sobakasu"
  },
  {
    id: 114,
    title: "InuYasha (OP1)",
    altTitles: ["อินุยาฉะ ปัจฉิมบท"],
    difficulty: "normal",
    year: 2009,
    youtubeVideoId: "https://www.youtube.com/watch?v=oGlnMt3KE_Y",
    acceptedAnswers: ["inuyasha", "อินุยาฉะ"],
    note: "Kimi ga Inai Mirai"
  },
  {
    id: 115,
    title: "Yu-Gi-Oh! Duel Monsters (OP1)",
    altTitles: ["ยูกิโอ เกมกลคนอัจฉริยะ"],
    difficulty: "easy",
    year: 2000,
    youtubeVideoId: "https://www.youtube.com/watch?v=T0Inowwy7WI&list=RDT0Inowwy7WI&start_radio=1",
    acceptedAnswers: ["yu-gi-oh", "yugioh", "ยูกิโอ"],
    note: "Voice"
  },
  {
    id: 116,
    title: "Shaman King (OP1)",
    altTitles: ["ราชันแห่งภูต"],
    difficulty: "normal",
    year: 2001,
    youtubeVideoId: "https://www.youtube.com/watch?v=-VYMrLirXFY&list=RD-VYMrLirXFY&start_radio=1",
    acceptedAnswers: ["shaman king", "ราชันแห่งภูต", "ชาแมนคิง"],
    note: "Oversoul"
  },
  {
    id: 117,
    title: "Saint Seiya (OP1)",
    altTitles: ["เซนต์เซย่า"],
    difficulty: "easy",
    year: 1986,
    youtubeVideoId: "https://www.youtube.com/watch?v=Bu533OKYHyc&list=RDBu533OKYHyc&start_radio=1",
    acceptedAnswers: ["saint seiya", "เซนต์เซย่า"],
    note: "Pegasus Fantasy"
  },
  {
    id: 118,
    title: "Doraemon (OP1)",
    altTitles: ["โดราเอมอน"],
    difficulty: "easy",
    year: 1979,
    youtubeVideoId: "https://www.youtube.com/watch?v=7X4k2A5rTsI&list=RD7X4k2A5rTsI&start_radio=1",
    acceptedAnswers: ["doraemon", "โดราเอมอน"],
    note: "Doraemon no Uta"
  },
  {
    id: 119,
    title: "Crayon Shin-chan (OP1)",
    altTitles: ["เครยอนชินจัง", "ชินจังจอมแก่น"],
    difficulty: "easy",
    year: 1992,
    youtubeVideoId: "https://www.youtube.com/watch?v=AvawBqax6Is&list=RDAvawBqax6Is&start_radio=1",
    acceptedAnswers: ["shin chan", "ชินจัง"],
    note: "Ora wa Ninki Mono"
  },
  {
    id: 120,
    title: "Chibi Maruko-chan (OP1)",
    altTitles: ["Chibi Maruko-chan", "หนูน้อยมารูโกะ"],
    difficulty: "easy",
    year: 1990,
    youtubeVideoId: "https://www.youtube.com/watch?v=ibEOS9i77R4&list=RDibEOS9i77R4&start_radio=1",
    acceptedAnswers: ["chibi maruko-chan", "maruko chan", "มารูโกะ"],
    note: "Odoru Ponpokorin"
  },
  {
    id: 121,
    title: "Lucky Star (OP1)",
    altTitles: ["ลัคกี้ สตาร์"],
    difficulty: "hard",
    year: 2007,
    youtubeVideoId: "https://www.youtube.com/watch?v=6iseNlvH2_s&list=RD6iseNlvH2_s&start_radio=1",
    acceptedAnswers: ["lucky star", "ลัคกี้ สตาร์"],
    note: "Motteke! Sailor Fuku"
  },
  {
    id: 122,
    title: "The Melancholy of Haruhi Suzumiya (OP1)",
    altTitles: ["The Melancholy of Haruhi Suzumiya", "เรียกเธอว่าพระเจ้า สึซึมิยะ ฮารุฮิ"],
    difficulty: "hard",
    year: 2006,
    youtubeVideoId: "https://www.youtube.com/watch?v=C337shIT9LI&list=RDC337shIT9LI&start_radio=1",
    acceptedAnswers: ["haruhi suzumiya", "haruhi", "ฮารุฮิ"],
    note: "Bouken Desho Desho?"
  },
  {
    id: 123,
    title: "Ouran High School Host Club (OP1)",
    altTitles: ["ชมรมรัก คลับมหาสนุก"],
    difficulty: "normal",
    year: 2006,
    youtubeVideoId: "https://www.youtube.com/watch?v=T3ivdddYT9k&list=RDT3ivdddYT9k&start_radio=1",
    acceptedAnswers: ["ouran high school host club", "ชมรมรัก คลับมหาสนุก", "โฮสต์คลับ"],
    note: "Sakura Kiss"
  },
  {
    id: 124,
    title: "Fruits Basket (OP1)",
    altTitles: ["เสน่ห์สาวข้าวปั้น"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=80oOmZSMlx0&list=RD80oOmZSMlx0&start_radio=1",
    acceptedAnswers: ["fruit basket", "เสน่ห์สาวข้าวปั้น"],
    note: "Again"
  },
  {
    id: 125,
    title: "Mob Psycho 100 II (OP1)",
    altTitles: ["ม็อบไซโค 100 ภาค 2"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=yITjzGjOKo0&list=RDyITjzGjOKo0&start_radio=1",
    acceptedAnswers: ["mob psycho 100", "ม็อบไซโค"],
    note: "99.9"
  },
  {
    id: 126,
    title: "Devilman: Crybaby (OP1)",
    altTitles: ["เดวิลแมน ไครเบบี้"],
    difficulty: "hard",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=SM5mnH7JrJE&list=RDSM5mnH7JrJE&start_radio=1",
    acceptedAnswers: ["devilman crybaby", "devilman", "เดวิลแมน"],
    note: "MAN HUMAN"
  },
  {
    id: 127,
    title: "Bungou Stray Dogs (OP1)",
    altTitles: ["คณะประพันธกรจรจัด"],
    difficulty: "normal",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=sDhgSZXPLdY&list=RDsDhgSZXPLdY&start_radio=1",
    acceptedAnswers: ["bungou stray dogs", "คณะประพันธกรจรจัด"],
    note: "Trash Candy"
  },
  {
    id: 128,
    title: "Golden Kamuy (OP1)",
    altTitles: ["โกลเดนคามุย"],
    difficulty: "hard",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=QahFijEd3hY&list=RDQahFijEd3hY&start_radio=1",
    acceptedAnswers: ["golden kamuy", "โกลเดนคามุย"],
    note: "Winding Road"
  },
  {
    id: 129,
    title: "Banana Fish (OP1)",
    altTitles: ["บานาน่า ฟิช"],
    difficulty: "hard",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=0z6FLH2HXl4&list=RD0z6FLH2HXl4&start_radio=1",
    acceptedAnswers: ["banana fish", "บานาน่า ฟิช"],
    note: "found & lost"
  },
  {
    id: 130,
    title: "Dorohedoro (OP1)",
    altTitles: ["สาปพันธุ์อสูร"],
    difficulty: "hard",
    year: 2020,
    youtubeVideoId: "https://www.youtube.com/watch?v=iH_YJde1yps&list=RDiH_YJde1yps&start_radio=1",
    acceptedAnswers: ["dorohedoro", "สาปพันธุ์อสูร"],
    note: "Welcome to Chaos"
  },
  {
    id: 131,
    title: "JoJo's Bizarre Adventure: Stardust Crusaders (OP1)",
    altTitles: ["โจโจ้ ภาค 3"],
    difficulty: "normal",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=x06zFQ85gT0&list=RDx06zFQ85gT0&start_radio=1",
    acceptedAnswers: ["jojo", "stardust crusaders"],
    note: "Stand Proud"
  },
  {
    id: 132,
    title: "JoJo's Bizarre Adventure: Golden Wind (OP1)",
    altTitles: ["โจโจ้ ภาค 5"],
    difficulty: "normal",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=kbjr3JIuOtY&list=RDkbjr3JIuOtY&start_radio=1",
    acceptedAnswers: ["jojo", "golden wind"],
    note: "Fighting Gold"
  },
  {
    id: 133,
    title: "Black Lagoon (OP1)",
    altTitles: ["จารชนพันธุ์นรก"],
    difficulty: "hard",
    year: 2006,
    youtubeVideoId: "https://www.youtube.com/watch?v=dWfxcRj39tg&list=RDdWfxcRj39tg&start_radio=1",
    acceptedAnswers: ["black lagoon", "จารชนพันธุ์นรก"],
    note: "Red fraction"
  },
  {
    id: 134,
    title: "Hellsing (OP1)",
    altTitles: ["เฮลล์ซิง"],
    difficulty: "hard",
    year: 2001,
    youtubeVideoId: "https://www.youtube.com/watch?v=rBPegoYoD9Q&list=RDrBPegoYoD9Q&start_radio=1",
    acceptedAnswers: ["hellsing", "เฮลล์ซิง"],
    note: "Logos naki World"
  },
  {
    id: 135,
    title: "Claymore (OP1)",
    altTitles: ["อสูรสาวพิฆาตมาร"],
    difficulty: "hard",
    year: 2007,
    youtubeVideoId: "https://www.youtube.com/watch?v=dbj9Yjskco0&list=RDdbj9Yjskco0&start_radio=1",
    acceptedAnswers: ["claymore", "อสูรสาวพิฆาตมาร"],
    note: "Raison d'être"
  },
  {
    id: 136,
    title: "Highschool of the Dead (OP1)",
    altTitles: ["หนีตายฝ่านรกซอมบี้"],
    difficulty: "normal",
    year: 2010,
    youtubeVideoId: "https://www.youtube.com/watch?v=ZDRvkxKcEqY&list=RDZDRvkxKcEqY&start_radio=1",
    acceptedAnswers: ["highschool of the dead", "hotd", "หนีตายฝ่านรกซอมบี้"],
    note: "HIGHSCHOOL OF THE DEAD"
  },
  {
    id: 137,
    title: "Gantz (OP1)",
    altTitles: ["กันสึ"],
    difficulty: "hard",
    year: 2004,
    youtubeVideoId: "https://www.youtube.com/watch?v=SJ5ICtGn6u8",
    acceptedAnswers: ["gantz", "กันสึ"],
    note: "Super Shooter"
  },
  {
    id: 138,
    title: "Elfen Lied (OP1)",
    altTitles: ["เอลเฟนลีด"],
    difficulty: "hard",
    year: 2004,
    youtubeVideoId: "https://www.youtube.com/watch?v=9GaVESwssxU&list=RD9GaVESwssxU&start_radio=1",
    acceptedAnswers: ["elfen lied", "เอลเฟนลีด"],
    note: "Lilium"
  },
  {
    id: 139,
    title: "Deadman Wonderland (OP1)",
    altTitles: ["เดดแมน วันเดอร์แลนด์"],
    difficulty: "hard",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=_5WvUPHF5f8&list=RD_5WvUPHF5f8&start_radio=1",
    acceptedAnswers: ["deadman wonderland", "เดดแมน วันเดอร์แลนด์"],
    note: "One Reason"
  },
  {
    id: 140,
    title: "Terra Formars (OP1)",
    altTitles: ["ภารกิจล้างพันธุ์นรก"],
    difficulty: "hard",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=QW7HU71YRkg&list=RDQW7HU71YRkg&start_radio=1",
    acceptedAnswers: ["terra formars", "ภารกิจล้างพันธุ์นรก"],
    note: "AMAZING BREAK"
  },
  {
    id: 141,
    title: "Mobile Suit Gundam Wing (OP1)",
    altTitles: ["กันดั้มวิง"],
    difficulty: "normal",
    year: 1995,
    youtubeVideoId: "https://www.youtube.com/watch?v=oNJ4aBoRipg&list=RDoNJ4aBoRipg&start_radio=1",
    acceptedAnswers: ["gundam wing", "กันดั้มวิง"],
    note: "Just Communication"
  },
  {
    id: 142,
    title: "Macross Frontier (OP1)",
    altTitles: ["มาครอส ฟรอนเทียร์"],
    difficulty: "hard",
    year: 2008,
    youtubeVideoId: "https://www.youtube.com/watch?v=zrlKPsFkKtc&list=RDzrlKPsFkKtc&start_radio=1",
    acceptedAnswers: ["macross frontier", "มาครอส"],
    note: "Lion"
  },
  {
    id: 143,
    title: "Code Geass: Hangyaku no Lelouch R2 (OP1)",
    altTitles: ["โค้ดกีอัส ภาค 2"],
    difficulty: "normal",
    year: 2008,
    youtubeVideoId: "https://www.youtube.com/watch?v=HgGcePdMsDY&list=RDHgGcePdMsDY&start_radio=1",
    acceptedAnswers: ["code geass", "โค้ดกีอัส"],
    note: "O2"
  },
  {
    id: 144,
    title: "Darker than Black (OP1)",
    altTitles: ["ยมทูตสีดำ"],
    difficulty: "hard",
    year: 2007,
    youtubeVideoId: "https://www.youtube.com/watch?v=Wv-SLk1OIkI&list=RDWv-SLk1OIkI&start_radio=1",
    acceptedAnswers: ["darker than black", "ยมทูตสีดำ"],
    note: "Howling"
  },
  {
    id: 145,
    title: "Monster (OP1)",
    altTitles: ["คนปีศาจ"],
    difficulty: "hard",
    year: 2004,
    youtubeVideoId: "https://www.youtube.com/watch?v=EYdCd00TJhI&list=RDEYdCd00TJhI&start_radio=1",
    acceptedAnswers: ["monster", "คนปีศาจ"],
    note: "For the Love of Life"
  },
  {
    id: 146,
    title: "Baccano! (OP1)",
    altTitles: ["มาเฟียป่วนเมือง"],
    difficulty: "hard",
    year: 2007,
    youtubeVideoId: "https://www.youtube.com/watch?v=gfKJ13-qqK8",
    acceptedAnswers: ["baccano!", "baccano"],
    note: "Gun's & Roses"
  },
  {
    id: 147,
    title: "Durarara!! (OP1)",
    altTitles: ["ดูราราร่า!!"],
    difficulty: "hard",
    year: 2010,
    youtubeVideoId: "https://www.youtube.com/watch?v=oikvju7vAg4&list=RDoikvju7vAg4&start_radio=1",
    acceptedAnswers: ["durarara", "ดูราราร่า"],
    note: "Uragiri no Yuuyake"
  },
  {
    id: 148,
    title: "Hyouka (OP1)",
    altTitles: ["ปริศนาความทรงจำ"],
    difficulty: "normal",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=3tvOowLuKxs&list=RD3tvOowLuKxs&start_radio=1",
    acceptedAnswers: ["hyouka", "ปริศนาความทรงจำ"],
    note: "Yasashisa no Iru"
  },
  {
    id: 149,
    title: "Nichijou (OP1)",
    altTitles: ["สามัญขยันรั่ว"],
    difficulty: "hard",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=qUk1ZoCGqsA&list=RDqUk1ZoCGqsA&start_radio=1",
    acceptedAnswers: ["nichijou", "สามัญขยันรั่ว"],
    note: "Hyadain no Kakakata Kataomoi - C"
  },
  {
    id: 150,
    title: "Gyakkyou Burai Kaiji: Ultimate Survivor (OP1)",
    altTitles: ["ไคจิ กลโกงมรณะ"],
    difficulty: "hard",
    year: 2007,
    youtubeVideoId: "https://www.youtube.com/watch?v=IWMvYkJ6-rw&list=RDIWMvYkJ6-rw&start_radio=1",
    acceptedAnswers: ["kaiji", "ไคจิ"],
    note: "Mirai wa Bokura no Te no Naka"
  },
  {
    id: 151,
    title: "Yu Yu Hakusho (OP1)",
    altTitles: ["คนเก่งฟ้าประทาน", "ผีเปรตละเมอ"],
    difficulty: "easy",
    year: 1992,
    youtubeVideoId: "https://www.youtube.com/watch?v=2l9V2ejc6OY&list=RD2l9V2ejc6OY&start_radio=1",
    acceptedAnswers: ["yu yu hakusho", "คนเก่งฟ้าประทาน", "คนเก่งทะลุโลก"],
    note: "Hohoemi no Bakudan"
  },
  {
    id: 152,
    title: "City Hunter (OP1)",
    altTitles: ["ซิตี้ฮันเตอร์"],
    difficulty: "normal",
    year: 1987,
    youtubeVideoId: "https://www.youtube.com/watch?v=iXe-4Sipgtg&list=RDiXe-4Sipgtg&start_radio=1",
    acceptedAnswers: ["city hunter", "ซิตี้ฮันเตอร์"],
    note: "Get Wild"
  },
  {
    id: 153,
    title: "Ranma 1/2 (OP1)",
    altTitles: ["รันม่า 1/2", "ไอ้หนุ่มกังฟู"],
    difficulty: "easy",
    year: 1989,
    youtubeVideoId: "https://www.youtube.com/watch?v=XW9BapLxwkw",
    acceptedAnswers: ["ranma", "ranma 1/2", "รันม่า", "รันม่า 1/2"],
    note: "Jajauma ni Sasenaide"
  },
  {
    id: 154,
    title: "Cardcaptor Sakura (OP1)",
    altTitles: ["ซากุระ มือปราบไพ่ทาโรต์"],
    difficulty: "easy",
    year: 1998,
    youtubeVideoId: "https://www.youtube.com/watch?v=QDezQD57h-g&list=RDQDezQD57h-g&start_radio=1",
    acceptedAnswers: ["cardcaptor sakura", "sakura", "ซากุระ มือปราบไพ่ทาโรต์", "ซากุระ"],
    note: "Catch You Catch Me"
  },
  {
    id: 155,
    title: "Magic Knight Rayearth (OP1)",
    altTitles: ["เมจิกไนท์ เรย์เอิร์ธ"],
    difficulty: "hard",
    year: 1994,
    youtubeVideoId: "https://www.youtube.com/watch?v=VL33WLF7MmY&list=RDVL33WLF7MmY&start_radio=1",
    acceptedAnswers: ["magic knight rayearth", "rayearth", "เมจิกไนท์ เรย์เอิร์ธ"],
    note: "Yuzurenai Negai"
  },
  {
    id: 156,
    title: "Nana (OP1)",
    altTitles: ["นานะ"],
    difficulty: "normal",
    year: 2006,
    youtubeVideoId: "https://www.youtube.com/watch?v=SB1NGyWxvlA&list=RDSB1NGyWxvlA&start_radio=1",
    acceptedAnswers: ["nana", "นานะ"],
    note: "Rose"
  },
  {
    id: 157,
    title: "Beck (OP1)",
    altTitles: ["Beck", "เบ็ค"],
    difficulty: "hard",
    year: 2004,
    youtubeVideoId: "https://www.youtube.com/watch?v=4anWKw-BkXU&list=RD4anWKw-BkXU&start_radio=1",
    acceptedAnswers: ["beck", "เบ็ค"],
    note: "Hit in the USA"
  },
  {
    id: 158,
    title: "Kimi ni Todoke (OP1)",
    altTitles: ["ฝากใจไปถึงเธอ"],
    difficulty: "normal",
    year: 2009,
    youtubeVideoId: "https://www.youtube.com/watch?v=oDx_KACChSs&list=RDoDx_KACChSs&start_radio=1",
    acceptedAnswers: ["kimi ni todoke", "ฝากใจไปถึงเธอ"],
    note: "Kimi ni Todoke"
  },
  {
    id: 159,
    title: "Nodame Cantabile (OP1)",
    altTitles: ["วุ่นรักนักดนตรี", "โนดาเมะ"],
    difficulty: "hard",
    year: 2007,
    youtubeVideoId: "https://www.youtube.com/watch?v=gfZh80kZm3g&list=RDgfZh80kZm3g&start_radio=1",
    acceptedAnswers: ["nodame cantabile", "nodame", "วุ่นรักนักดนตรี", "โนดาเมะ"],
    note: "Allegro Cantabile"
  },
  {
    id: 160,
    title: "Chihayafuru (OP1)",
    altTitles: ["จิฮายะ", "กลอนรักพิชิตใจเธอ"],
    difficulty: "hard",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=IcCJgmLZYkE&list=RDIcCJgmLZYkE&start_radio=1",
    acceptedAnswers: ["chihayafuru", "จิฮายะ", "จิฮายะฟุรุ"],
    note: "YOUTHFUL"
  },
  {
    id: 161,
    title: "Spice and Wolf (OP1)",
    altTitles: ["สาวหมาป่ากับนายเครื่องเทศ"],
    difficulty: "hard",
    year: 2008,
    youtubeVideoId: "https://www.youtube.com/watch?v=8IkKUBJ26fo&list=RD8IkKUBJ26fo&start_radio=1",
    acceptedAnswers: ["spice and wolf", "สาวหมาป่ากับนายเครื่องเทศ"],
    note: "Tabi no Tochuu"
  },
  {
    id: 162,
    title: "Shingeki no Kyojin (Attack On Titan) Season 2 (OP1)",
    altTitles: ["ผ่าพิภพไททัน ภาค 2"],
    difficulty: "normal",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=CID-sYQNCew&list=RDCID-sYQNCew&start_radio=1",
    acceptedAnswers: ["attack on titan", "shingeki no kyojin", "ผ่าพิภพไททัน"],
    note: "Shinzou wo Sasageyo!"
  },
  {
    id: 163,
    title: "Sword Art Online II (OP1)",
    altTitles: ["ซอร์ดอาร์ตออนไลน์ ภาค 2"],
    difficulty: "normal",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=vfYJz6P8Eoo&list=RDvfYJz6P8Eoo&start_radio=1",
    acceptedAnswers: ["sword art online", "sao", "ซอร์ดอาร์ตออนไลน์"],
    note: "Ignite"
  },
  {
    id: 164,
    title: "Tokyo Ghoul Root A (OP1)",
    altTitles: ["โตเกียวกูล รูท A"],
    difficulty: "hard",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=qM8wxM_mcRw&list=RDqM8wxM_mcRw&start_radio=1",
    acceptedAnswers: ["tokyo ghoul", "โตเกียวกูล"],
    note: "Munou"
  },
  {
    id: 165,
    title: "My Hero Academia Season 2 (OP1)",
    altTitles: ["มายฮีโร่ อคาเดเมีย ภาค 2"],
    difficulty: "normal",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=JVu7-XSI_OM&list=RDJVu7-XSI_OM&start_radio=1",
    acceptedAnswers: ["my hero academia", "boku no hero academia", "มายฮีโร่ อคาเดเมีย"],
    note: "Peace Sign"
  },
  {
    id: 166,
    title: "Naruto Shippuden (OP1)",
    altTitles: ["นารูโตะ ตำนานวายุสลาตัน"],
    difficulty: "easy",
    year: 2007,
    youtubeVideoId: "https://www.youtube.com/watch?v=EBNl8bwdVcA&list=RDEBNl8bwdVcA&start_radio=1",
    acceptedAnswers: ["naruto shippuden", "naruto", "นารูโตะ"],
    note: "Blue Bird"
  },
  {
    id: 167,
    title: "Boruto: Naruto Next Generations (OP1)",
    altTitles: ["โบรูโตะ"],
    difficulty: "normal",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=s1aTmDV0BKg&list=RDs1aTmDV0BKg&start_radio=1",
    acceptedAnswers: ["boruto", "โบรูโตะ"],
    note: "Baton Road"
  },
  {
    id: 168,
    title: "Dragon Ball Super (OP1)",
    altTitles: ["ดราก้อนบอล ซูเปอร์"],
    difficulty: "easy",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=j61ts42E2Ms",
    acceptedAnswers: ["dragon ball super", "ดราก้อนบอล ซูเปอร์", "ดราก้อนบอล"],
    note: "Chouzetsu Dynamic!"
  },
  {
    id: 169,
    title: "Dragon Ball GT (OP1)",
    altTitles: ["ดราก้อนบอล GT"],
    difficulty: "easy",
    year: 1996,
    youtubeVideoId: "https://www.youtube.com/watch?v=qfUbqI_q0Ho&list=RDqfUbqI_q0Ho&start_radio=1",
    acceptedAnswers: ["dragon ball gt", "ดราก้อนบอล gt", "ดราก้อนบอล"],
    note: "Dan Dan Kokoro Hikareteku"
  },
  {
    id: 170,
    title: "Ojamajo Doremi (OP1)",
    altTitles: ["แม่มดน้อยโดเรมี"],
    difficulty: "easy",
    year: 1999,
    youtubeVideoId: "https://www.youtube.com/watch?v=9CioAYtz4iM&list=RD9CioAYtz4iM&start_radio=1",
    acceptedAnswers: ["ojamajo doremi", "แม่มดน้อยโดเรมี", "โดเรมี"],
    note: "Ojamajo Carnival!!"
  },
  {
    id: 171,
    title: "Digimon Tamers (OP1)",
    altTitles: ["ดิจิมอน เทมเมอร์ส"],
    difficulty: "normal",
    year: 2001,
    youtubeVideoId: "https://www.youtube.com/watch?v=Se-2l5A2wu4&list=RDSe-2l5A2wu4&start_radio=1",
    acceptedAnswers: ["digimon tamers", "ดิจิมอน เทมเมอร์ส", "ดิจิมอน"],
    note: "The Biggest Dreamer"
  },
  {
    id: 172,
    title: "Digimon Frontier (OP1)",
    altTitles: ["ดิจิมอน ฟรอนเทียร์"],
    difficulty: "normal",
    year: 2002,
    youtubeVideoId: "https://www.youtube.com/watch?v=ehoaPNSIC0U&list=RDehoaPNSIC0U&start_radio=1",
    acceptedAnswers: ["digimon frontier", "ดิจิมอน ฟรอนเทียร์", "ดิจิมอน"],
    note: "FIRE!!"
  },
  {
    id: 173,
    title: "Zatch Bell! (OP1)",
    altTitles: ["กัชเบล"],
    difficulty: "normal",
    year: 2003,
    youtubeVideoId: "https://www.youtube.com/watch?v=XaztbhhCEaE&list=RDXaztbhhCEaE&start_radio=1",
    acceptedAnswers: ["zatch bell!", "zatch bell", "กัชเบล"],
    note: "Kasabuta"
  },
  {
    id: 174,
    title: "Katekyou Hitman Reborn! (OP1)",
    altTitles: ["ครูพิเศษจอมป่วน รีบอร์น!"],
    difficulty: "easy",
    year: 2006,
    youtubeVideoId: "https://www.youtube.com/watch?v=WIOL2PlJB8M&list=RDWIOL2PlJB8M&start_radio=1",
    acceptedAnswers: ["reborn", "katekyo hitman reborn!", "รีบอร์น", "ครูพิเศษจอมป่วน รีบอร์น"],
    note: "Drawing days"
  },
  {
    id: 175,
    title: "Skull Man (OP1)",
    altTitles: ["ดี.เกรย์แมน"],
    difficulty: "normal",
    year: 2006,
    youtubeVideoId: "https://www.youtube.com/watch?v=hh871BowF7E&list=RDhh871BowF7E&start_radio=1",
    acceptedAnswers: ["d.gray-man", "d gray man", "ดี.เกรย์แมน"],
    note: "INNOCENT SORROW"
  },
  {
    id: 176,
    title: "Beelzebub (OP1)",
    altTitles: ["เด็กพันธุ์นรกสั่งลุย", "เบลเซบับ"],
    difficulty: "normal",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=BkHZhFhxQUI&list=RDBkHZhFhxQUI&start_radio=1",
    acceptedAnswers: ["beelzebub", "เด็กพันธุ์นรกสั่งลุย", "เบลเซบับ"],
    note: "DaDaDa"
  },
  {
    id: 177,
    title: "SKET Dance (OP1)",
    altTitles: ["สเก็ต ดานซ์"],
    difficulty: "hard",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=Y675EaSEFVA&list=RDY675EaSEFVA&start_radio=1",
    acceptedAnswers: ["sket dance", "สเก็ต ดานซ์"],
    note: "Kakkowarui I love you!"
  },
  {
    id: 178,
    title: "Bakuman. (OP1)",
    altTitles: ["วัยซนคนการ์ตูน", "บาคุแมน"],
    difficulty: "normal",
    year: 2010,
    youtubeVideoId: "https://www.youtube.com/watch?v=8vMRheOXO_w&list=RD8vMRheOXO_w&start_radio=1",
    acceptedAnswers: ["bakuman", "วัยซนคนการ์ตูน", "บาคุแมน"],
    note: "Blue Bird"
  },
  {
    id: 179,
    title: "Death Parade (OP1)",
    altTitles: ["เดธพาเหรด"],
    difficulty: "normal",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=L90XoAtwMic&list=RDL90XoAtwMic&start_radio=1",
    acceptedAnswers: ["death parade", "เดธพาเหรด"],
    note: "Flyers"
  },
  {
    id: 180,
    title: "Kekkai Sensen (OP1)",
    altTitles: ["Kekkai Sensen", "สมรภูมิเขตป้องกันโลหิต"],
    difficulty: "hard",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=4J8jcI0WtzM&list=RD4J8jcI0WtzM&start_radio=1",
    acceptedAnswers: ["blood blockade battlefront", "kekkai sensen", "สมรภูมิเขตป้องกันโลหิต"],
    note: "Sugar Song to Bitter Step"
  },
  {
    id: 181,
    title: "The God of High School (OP1)",
    altTitles: ["เดอะก็อดออฟไฮสคูล"],
    difficulty: "hard",
    year: 2020,
    youtubeVideoId: "https://www.youtube.com/watch?v=eRJyYfAq2tk&list=RDeRJyYfAq2tk&start_radio=1",
    acceptedAnswers: ["the god of high school", "เดอะก็อดออฟไฮสคูล"],
    note: "Contradiction"
  },
  {
    id: 182,
    title: "Tower of God (OP1)",
    altTitles: ["หอคอยเทพเจ้า"],
    difficulty: "normal",
    year: 2020,
    youtubeVideoId: "https://www.youtube.com/watch?v=Q8o_cn6UIZM&list=RDQ8o_cn6UIZM&start_radio=1",
    acceptedAnswers: ["tower of god", "หอคอยเทพเจ้า"],
    note: "TOP"
  },
  {
    id: 183,
    title: "To Your Eternity (OP1)",
    altTitles: ["แด่เธอผู้เป็นนิรันดร์"],
    difficulty: "normal",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=2RrkFCw0t90&list=RD2RrkFCw0t90&start_radio=1",
    acceptedAnswers: ["to your eternity", "แด่เธอผู้เป็นนิรันดร์"],
    note: "PINK BLOOD"
  },
  {
    id: 184,
    title: "Vivy: Fluorite Eye's Song (OP1)",
    altTitles: ["วิวี่"],
    difficulty: "hard",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=2p8ig-TrYPY&list=RD2p8ig-TrYPY&start_radio=1",
    acceptedAnswers: ["vivy", "vivy fluorite eye's song", "วิวี่"],
    note: "Sing My Pleasure"
  },
  {
    id: 185,
    title: "Wonder Egg Priority (OP1)",
    altTitles: ["วันเดอร์เอ็ก ไพรออริตี"],
    difficulty: "hard",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=tVdgHnK71MY&list=RDtVdgHnK71MY&start_radio=1",
    acceptedAnswers: ["wonder egg priority", "วันเดอร์เอ็ก ไพรออริตี"],
    note: "Sudachi no Uta"
  },
  {
    id: 186,
    title: "Akudama Drive (OP1)",
    altTitles: ["อคุดามะ ไดรฟ์"],
    difficulty: "hard",
    year: 2020,
    youtubeVideoId: "https://www.youtube.com/watch?v=waVIxrKQYgg&list=RDwaVIxrKQYgg&start_radio=1",
    acceptedAnswers: ["akudama drive", "อคุดามะ ไดรฟ์"],
    note: "STEAL!!"
  },
  {
    id: 187,
    title: "Deca-Dence (OP1)",
    altTitles: ["เดกะ-เดนซ์"],
    difficulty: "hard",
    year: 2020,
    youtubeVideoId: "https://www.youtube.com/watch?v=jQZm1wf3O_8&list=RDjQZm1wf3O_8&start_radio=1",
    acceptedAnswers: ["deca-dence", "deca dence", "เดกะ-เดนซ์"],
    note: "Theater of Life"
  },
  {
    id: 188,
    title: "Great Pretender (OP1)",
    altTitles: ["ยอดคนลวงโลก"],
    difficulty: "hard",
    year: 2020,
    youtubeVideoId: "https://www.youtube.com/watch?v=Yjv_yFgHYc0&list=RDYjv_yFgHYc0&start_radio=1",
    acceptedAnswers: ["great pretender", "ยอดคนลวงโลก"],
    note: "G.P."
  },
  {
    id: 189,
    title: "Summer Time (OP1)",
    altTitles: ["ปริศนาบ้านเก่า ซัมเมอร์ไทม์"],
    difficulty: "normal",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=8wjHaeCgbps&list=RD8wjHaeCgbps&start_radio=1",
    acceptedAnswers: ["summer time rendering", "ปริศนาบ้านเก่า ซัมเมอร์ไทม์", "ซัมเมอร์ไทม์ เรนเดอร์ริ่ง"],
    note: "Hoshi ga Oyogu"
  },
  {
    id: 190,
    title: "Kusuriya no Hitorigoto (OP1)",
    altTitles: ["Kusuriya no Hitorigoto", "สืบคดีปริศนา หมอยาตำรับโคมแดง"],
    difficulty: "easy",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=E3QN_uoHysA&list=RDE3QN_uoHysA&start_radio=1",
    acceptedAnswers: ["the apothecary diaries", "kusuriya no hitorigoto", "สืบคดีปริศนา หมอยาตำรับโคมแดง", "หมอยาตำรับโคมแดง"],
    note: "Hana ni Natte"
  },
  {
    id: 191,
    title: "Solo Leveling (OP1)",
    altTitles: ["โซโล่เลเวลลิ่ง"],
    difficulty: "easy",
    year: 2024,
    youtubeVideoId: "https://www.youtube.com/watch?v=XqD0oCHLIF8&list=RDXqD0oCHLIF8&start_radio=1",
    acceptedAnswers: ["solo leveling", "โซโล่เลเวลลิ่ง"],
    note: "LEveL"
  },
  {
    id: 192,
    title: "Mashle (OP1)",
    altTitles: ["ศึกโลกเวทมนตร์คนพลังกล้าม", "มัชลี"],
    difficulty: "easy",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=9rVKos-oGnQ&list=RD9rVKos-oGnQ&start_radio=1",
    acceptedAnswers: ["mashle", "ศึกโลกเวทมนตร์คนพลังกล้าม", "มัชลี"],
    note: "Bling-Bang-Bang-Born"
  },
  {
    id: 193,
    title: "Undead Unluck (OP1)",
    altTitles: ["อันเดด อันลัค"],
    difficulty: "normal",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=V9baXCr--yw&list=RDV9baXCr--yw&start_radio=1",
    acceptedAnswers: ["undead unluck", "อันเดด อันลัค"],
    note: "01"
  },
  {
    id: 194,
    title: "Shangri-La Frontier (OP1)",
    altTitles: ["แชงกรีล่า ฟรอนเทียร์"],
    difficulty: "normal",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=GasIaj6iNOU&list=RDGasIaj6iNOU&start_radio=1",
    acceptedAnswers: ["shangri-la frontier", "แชงกรีล่า ฟรอนเทียร์"],
    note: "BROKEN GAMES"
  },
  {
    id: 195,
    title: "Zom 100: Bucket List of the Dead (OP1)",
    altTitles: ["ซอม 100", "100 สิ่งที่อยากทำก่อนจะกลายเป็นซอมบี้"],
    difficulty: "normal",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=fTnhrENnJAA&list=RDfTnhrENnJAA&start_radio=1",
    acceptedAnswers: ["zom 100", "ซอม 100"],
    note: "Song of the Dead"
  },
  {
    id: 196,
    title: "Paradise (OP1)",
    altTitles: ["Jigokuraku", "สุขาวดีอเวจี"],
    difficulty: "normal",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=Rr1UQlJxXB8&list=RDRr1UQlJxXB8&start_radio=1",
    acceptedAnswers: ["hell's paradise", "jigokuraku", "สุขาวดีอเวจี"],
    note: "WORK"
  },
  {
    id: 197,
    title: "Tengoku Daimakyou (OP1)",
    altTitles: ["Heavenly Delusion", "ถ้ำอสูรฆาตกร"],
    difficulty: "hard",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=GuAcdIqcanA&list=RDGuAcdIqcanA&start_radio=1",
    acceptedAnswers: ["tengoku daimakyou", "heavenly delusion", "ถ้ำอสูรฆาตกร"],
    note: "innocent arrogance"
  },
  {
    id: 198,
    title: "Yofukashi no Uta (OP1)",
    altTitles: ["Yofukashi no Uta", "เพลงรักมนุษย์ค้างคาว"],
    difficulty: "normal",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=L96VbQ9ytWk&list=RDL96VbQ9ytWk&start_radio=1",
    acceptedAnswers: ["call of the night", "yofukashi no uta", "เพลงรักมนุษย์ค้างคาว"],
    note: "Yofukashi no Uta"
  },
  {
    id: 199,
    title: "Ousama Ranking (OP1)",
    altTitles: ["Ousama Ranking", "การจัดอันดับพระราชา"],
    difficulty: "normal",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=jYqoa2zBA8s&list=RDjYqoa2zBA8s&start_radio=1",
    acceptedAnswers: ["ranking of kings", "ousama ranking", "การจัดอันดับพระราชา", "พระราชาบอจจิ"],
    note: "BOY"
  },
  {
    id: 200,
    title: "Mobile Suit Gundam: The Witch from Mercury (OP1)",
    altTitles: ["โมบิลสูทกันดั้ม แม่มดจากดาวพุธ"],
    difficulty: "normal",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=vIhQ9zya2-g&list=RDvIhQ9zya2-g&start_radio=1",
    acceptedAnswers: ["the witch from mercury", "gundam the witch from mercury", "แม่มดจากดาวพุธ", "โมบิลสูทกันดั้ม แม่มดจากดาวพุธ"],
    note: "Shukufuku"
  },
  {
    id: 201,
    title: "Bakemonogatari (OP1)",
    altTitles: ["ปกรณัมของเหล่าภูต"],
    difficulty: "normal",
    year: 2009,
    youtubeVideoId: "https://www.youtube.com/watch?v=jQ6gPyYNgPo&list=RDjQ6gPyYNgPo&start_radio=1",
    acceptedAnswers: ["bakemonogatari", "ปกรณัมของเหล่าภูต", "monogatari"],
    note: "Renai Circulation"
  },
  {
    id: 202,
    title: "Toaru Kagaku no Railgun (OP1)",
    altTitles: ["Toaru Kagaku no Railgun", "เรลกัน แฟ้มลับคดีวิทยาศาสตร์"],
    difficulty: "normal",
    year: 2009,
    youtubeVideoId: "https://www.youtube.com/watch?v=NOt2qxWtBv0&list=RDNOt2qxWtBv0&start_radio=1",
    acceptedAnswers: ["a certain scientific railgun", "toaru kagaku no railgun", "railgun", "เรลกัน แฟ้มลับคดีวิทยาศาสตร์", "เรลกัน"],
    note: "only my railgun"
  },
  {
    id: 203,
    title: "Love Live! School Idol Project (OP1)",
    altTitles: ["เลิฟไลฟ์! ปฏิบัติการไอดอลจำเป็น"],
    difficulty: "normal",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=qOB7BNs9j3I&list=RDqOB7BNs9j3I&start_radio=1",
    acceptedAnswers: ["love live!", "love live", "เลิฟไลฟ์"],
    note: "Bokura wa Ima no Naka de"
  },
  {
    id: 204,
    title: "Aldnoah.Zero (OP1)",
    altTitles: ["อัลด์นัว.เซโร่"],
    difficulty: "hard",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=txiYc9FEUzY&list=RDtxiYc9FEUzY&start_radio=1",
    acceptedAnswers: ["aldnoah zero", "aldnoah.zero", "อัลด์นัวเซโร่"],
    note: "heavenly blue"
  },
  {
    id: 205,
    title: "Mobile Suit Gundam: Iron-Blooded Orphans (OP1)",
    altTitles: ["โมบิลสูทกันดั้ม แม่ทัพเหล็กเลือด", "Gundam IBO"],
    difficulty: "normal",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=82HM0z6qd20",
    acceptedAnswers: ["iron-blooded orphans", "gundam iron-blooded orphans", "gundam ibo", "แม่ทัพเหล็กเลือด", "กันดั้ม แม่ทัพเหล็กเลือด"],
    note: "Raise your flag"
  },
  {
    id: 206,
    title: "The Eminence in Shadow (OP1)",
    altTitles: ["Kage no Jitsuryokusha ni Naritakute!", "ชีวิตไม่ต้องเด่น ขอแค่เป็นเทพในเงา"],
    difficulty: "normal",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=9iQVgj4z-I4&list=RD9iQVgj4z-I4&start_radio=1",
    acceptedAnswers: ["the eminence in shadow", "kage no jitsuryokusha", "ชีวิตไม่ต้องเด่น ขอแค่เป็นเทพในเงา", "เทพในเงา"],
    note: "HIGHEST"
  },
  {
    id: 207,
    title: "Kaiju No. 8 (OP1)",
    altTitles: ["ไคจูหมายเลข 8"],
    difficulty: "easy",
    year: 2024,
    youtubeVideoId: "https://www.youtube.com/watch?v=aso1mQLUAbc&list=RDaso1mQLUAbc&start_radio=1",
    acceptedAnswers: ["kaiju no. 8", "kaiju no 8", "ไคจูหมายเลข 8", "ไคจูเบอร์ 8"],
    note: "Abyss"
  },
  {
    id: 208,
    title: "Dungeon Meshi (OP1)",
    altTitles: ["Dungeon Meshi", "สูตรลับตำรับดันเจียน"],
    difficulty: "normal",
    year: 2024,
    youtubeVideoId: "https://www.youtube.com/watch?v=60_2zt9l3Yk&list=RD60_2zt9l3Yk&start_radio=1",
    acceptedAnswers: ["delicious in dungeon", "dungeon meshi", "สูตรลับตำรับดันเจียน"],
    note: "Sleep Walking Orchestra"
  },
  {
    id: 209,
    title: "Dandadan (OP1)",
    altTitles: ["ดันดาดัน"],
    difficulty: "easy",
    year: 2024,
    youtubeVideoId: "https://www.youtube.com/watch?v=a4na2opArGY&list=RDa4na2opArGY&start_radio=1",
    acceptedAnswers: ["dandadan", "ดันดาดัน"],
    note: "Otonoke"
  },
  {
    id: 210,
    title: "Bleach: Thousand-Year Blood War (OP1)",
    altTitles: ["Bleach TYBW", "บลีช เทพมรณะ สงครามเลือดพันปี"],
    difficulty: "normal",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=gFQZgwMC1As&list=RDgFQZgwMC1As&start_radio=1",
    acceptedAnswers: ["bleach thousand-year blood war", "bleach tybw", "บลีช สงครามเลือดพันปี"],
    note: "Scar"
  },
  {
    id: 211,
    title: "Yuri!!! on Ice (OP1)",
    altTitles: ["ยูริ!!! ออนไอซ์"],
    difficulty: "normal",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=5u3RGhznctE&list=RD5u3RGhznctE&start_radio=1",
    acceptedAnswers: ["yuri on ice", "yuri!!! on ice", "ยูริ ออนไอซ์"],
    note: "History Maker"
  },
  {
    id: 212,
    title: "Free! (OP1)",
    altTitles: ["ชมรมว่ายน้ำอิวาโทบิ"],
    difficulty: "normal",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=tdBAkc8n6Hk&list=RDtdBAkc8n6Hk&start_radio=1",
    acceptedAnswers: ["free!", "free", "ฟรี", "ชมรมว่ายน้ำอิวาโทบิ"],
    note: "Rage on"
  },
  {
    id: 213,
    title: "Kuroko no Basket (OP1)",
    altTitles: ["คุโรโกะ โนะ บาสเก็ต ภาค 2"],
    difficulty: "normal",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=1OrXtzv3Q3A&list=RD1OrXtzv3Q3A&start_radio=1",
    acceptedAnswers: ["kuroko no basket", "คุโรโกะ", "คุโรโกะ โนะ บาสเก็ต"],
    note: "The Other self"
  },
  {
    id: 214,
    title: "Haikyuu!! Second Season (OP1)",
    altTitles: ["ไฮคิว!! คู่ตบฟ้าประทาน ภาค 2"],
    difficulty: "easy",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=kDfqdmrRRSA",
    acceptedAnswers: ["haikyuu", "ไฮคิว", "ไฮคิว คู่ตบฟ้าประทาน"],
    note: "FLY HIGH"
  },
  {
    id: 215,
    title: "K-On!! (OP1)",
    altTitles: ["เค-อง! ภาค 2"],
    difficulty: "easy",
    year: 2010,
    youtubeVideoId: "https://www.youtube.com/watch?v=u4te2AECQN8&list=RDu4te2AECQN8&start_radio=1",
    acceptedAnswers: ["k-on!!", "k-on", "เค-อง", "เคอง"],
    note: "Utauyo!! MIRACLE"
  },
  {
    id: 216,
    title: "Charlotte (OP1)",
    altTitles: ["ชาร์ลอตต์"],
    difficulty: "normal",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=kYm-0pr5t50&list=RDkYm-0pr5t50&start_radio=1",
    acceptedAnswers: ["charlotte", "ชาร์ลอตต์"],
    note: "Bravely You"
  },
  {
    id: 217,
    title: "Plastic Memories (OP1)",
    altTitles: ["พลาสติก เมมโมรี่ส์"],
    difficulty: "normal",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=Xl7WIDaIgXo&list=RDXl7WIDaIgXo&start_radio=1",
    acceptedAnswers: ["plastic memories", "พลาสติก เมมโมรี่ส์"],
    note: "Ring of Fortune"
  },
  {
    id: 218,
    title: "Air (OP1)",
    altTitles: ["แอร์"],
    difficulty: "hard",
    year: 2005,
    youtubeVideoId: "https://www.youtube.com/watch?v=VlkxpXYpAZs&list=RDVlkxpXYpAZs&start_radio=1",
    acceptedAnswers: ["air", "แอร์"],
    note: "Tori no Uta"
  },
  {
    id: 219,
    title: "Clannad: After Story (OP1)",
    altTitles: ["แคลนนาด อาฟเตอร์สตอรี่"],
    difficulty: "normal",
    year: 2008,
    youtubeVideoId: "https://www.youtube.com/watch?v=PozVlhR20TE&list=RDPozVlhR20TE&start_radio=1",
    acceptedAnswers: ["clannad after story", "clannad", "แคลนนาด", "แคลนนาด อาฟเตอร์สตอรี่"],
    note: "Toki wo Kizamu Uta"
  },
  {
    id: 220,
    title: "Re:Creators (OP1)",
    altTitles: ["รีครีเอเตอร์ส"],
    difficulty: "hard",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=I7e3VzX-FV8&list=RDI7e3VzX-FV8&start_radio=1",
    acceptedAnswers: ["re:creators", "recreators", "รีครีเอเตอร์ส"],
    note: "gravityWall"
  },
  {
    id: 221,
    title: "Kiznaiver (OP1)",
    altTitles: ["คิซไนเวอร์"],
    difficulty: "hard",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=MM3gn0dX_H4&list=RDMM3gn0dX_H4&start_radio=1",
    acceptedAnswers: ["kiznaiver", "คิซไนเวอร์"],
    note: "LAY YOUR HANDS ON ME"
  },
  {
    id: 222,
    title: "Symphogear (OP1)",
    altTitles: ["Senki Zesshou Symphogear", "ซิมโฟเกียร์"],
    difficulty: "hard",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=24tTYsurMWU&list=RD24tTYsurMWU&start_radio=1",
    acceptedAnswers: ["symphogear", "ซิมโฟเกียร์"],
    note: "Synchrogazer"
  },
  {
    id: 223,
    title: "Macross Delta: Delta Shougekijou (OP1)",
    altTitles: ["มาครอส เดลต้า"],
    difficulty: "normal",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=gb9RVUop9Mc&list=RDgb9RVUop9Mc&start_radio=1",
    acceptedAnswers: ["macross delta", "มาครอส เดลต้า"],
    note: "Ichido dake no Koi nara"
  },
  {
    id: 224,
    title: "Carole & Tuesday (OP1)",
    altTitles: ["แครอล แอนด์ ทิวส์เดย์"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=jsNm1LQUrXM&list=RDjsNm1LQUrXM&start_radio=1",
    acceptedAnswers: ["carole & tuesday", "carole and tuesday", "แครอล แอนด์ ทิวส์เดย์"],
    note: "Kiss Me"
  },
  {
    id: 225,
    title: "Given (OP1)",
    altTitles: ["กิฟเวน"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=rO4wRg_79w0&list=RDrO4wRg_79w0&start_radio=1",
    acceptedAnswers: ["given", "กิฟเวน"],
    note: "Kizuato"
  },
  {
    id: 226,
    title: "Sakamichi no Apollon (OP1)",
    altTitles: ["Sakamichi no Apollon", "เพลงกวีวัยเยาว์"],
    difficulty: "hard",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=MTw9tYs5bEQ",
    acceptedAnswers: ["kids on the slope", "sakamichi no apollon", "เพลงกวีวัยเยาว์"],
    note: "Sakamichi no Melody"
  },
  {
    id: 227,
    title: "Trigun (OP1)",
    altTitles: ["ไทรกัน"],
    difficulty: "hard",
    year: 1998,
    youtubeVideoId: "https://www.youtube.com/watch?v=mxYqXOL5uLk&list=RDmxYqXOL5uLk&start_radio=1",
    acceptedAnswers: ["trigun", "ไทรกัน"],
    note: "H.T"
  },
  {
    id: 228,
    title: "Gintama' (OP1)",
    altTitles: ["กินทามะ ภาค 2"],
    difficulty: "normal",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=-o_9rnizShU",
    acceptedAnswers: ["gintama", "กินทามะ"],
    note: "Tougenkyou Alien"
  },
  {
    id: 229,
    title: "Fairy Tail (OP1)",
    altTitles: ["แฟรี่เทล ภาค 2"],
    difficulty: "normal",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=_mfxTP142wE&list=RD_mfxTP142wE&start_radio=1",
    acceptedAnswers: ["fairy tail", "แฟรี่เทล"],
    note: "MASAYUME CHASING"
  },
  {
    id: 230,
    title: "Edens Zero (OP1)",
    altTitles: ["เอเดนส์ซีโร่"],
    difficulty: "normal",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=zoVvKNRD-NI&list=RDzoVvKNRD-NI&start_radio=1",
    acceptedAnswers: ["edens zero", "เอเดนส์ซีโร่"],
    note: "Eden through the rough"
  },
  {
    id: 231,
    title: "Shaman King (2021) (OP1)",
    altTitles: ["ราชันแห่งภูต (2021)"],
    difficulty: "normal",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=emrOpnSCYao&list=RDemrOpnSCYao&start_radio=1",
    acceptedAnswers: ["shaman king", "ราชันแห่งภูต", "ชาแมนคิง"],
    note: "Soul salvation"
  },
  {
    id: 232,
    title: "Digimon Adventure 02 (OP1)",
    altTitles: ["ดิจิมอน แอดเวนเจอร์ 02"],
    difficulty: "easy",
    year: 2000,
    youtubeVideoId: "https://www.youtube.com/watch?v=WkHntdc3gKQ&list=RDWkHntdc3gKQ&start_radio=1",
    acceptedAnswers: ["digimon adventure 02", "digimon 02", "ดิจิมอน 02", "ดิจิมอน แอดเวนเจอร์ 02"],
    note: "Target ~Akai Shougeki~"
  },
  {
    id: 233,
    title: "Pokemon Advanced Generation (OP1)",
    altTitles: ["โปเกมอน แอดวานซ์ เจเนอเรชัน"],
    difficulty: "easy",
    year: 2002,
    youtubeVideoId: "https://www.youtube.com/watch?v=M-fD1Z1Gj1w&list=RDM-fD1Z1Gj1w&start_radio=1",
    acceptedAnswers: ["pokemon advanced generation", "pokemon", "โปเกมอน"],
    note: "Advance Adventure"
  },
  {
    id: 234,
    title: "Yu-Gi-Oh! GX (OP1)",
    altTitles: ["ยูกิโอ GX"],
    difficulty: "normal",
    year: 2004,
    youtubeVideoId: "https://www.youtube.com/watch?v=JbpzNaQpZsk&list=RDJbpzNaQpZsk&start_radio=1",
    acceptedAnswers: ["yu-gi-oh gx", "yugioh gx", "ยูกิโอ gx", "ยูกิโอ จีเอ็กซ์"],
    note: "Kaisei Josho Hallelujah"
  },
  {
    id: 235,
    title: "Yu-Gi-Oh! 5D's (OP1)",
    altTitles: ["ยูกิโอ 5D's"],
    difficulty: "normal",
    year: 2008,
    youtubeVideoId: "https://www.youtube.com/watch?v=HTg9N1WHmhY&list=RDHTg9N1WHmhY&start_radio=1",
    acceptedAnswers: ["yu-gi-oh 5d's", "yugioh 5d", "ยูกิโอ 5d", "ยูกิโอ ไฟว์ดีส์"],
    note: "Kizuna"
  },
  {
    id: 236,
    title: "Inazuma Eleven (OP1)",
    altTitles: ["นักเตะแข้งสายฟ้า", "อินาสึมะ อีเลฟเวน"],
    difficulty: "easy",
    year: 2008,
    youtubeVideoId: "https://www.youtube.com/watch?v=y-vmhUs-iNw&list=RDy-vmhUs-iNw&start_radio=1",
    acceptedAnswers: ["inazuma eleven", "นักเตะแข้งสายฟ้า", "อินาสึมะ อีเลฟเวน"],
    note: "Tachiagariiyo"
  },
  {
    id: 237,
    title: "Beyblade (OP1)",
    altTitles: ["เบย์เบลด ลูกข่างสะท้านฟ้า"],
    difficulty: "normal",
    year: 2001,
    youtubeVideoId: "https://www.youtube.com/watch?v=P8gZbrDNbHM&list=RDP8gZbrDNbHM&start_radio=1",
    acceptedAnswers: ["beyblade", "เบย์เบลด"],
    note: "Fighting Spirits -Song for Beyblade-"
  },
  {
    id: 238,
    title: "Crush Gear Turbo (OP1)",
    altTitles: ["ครัชเกียร์ เทอร์โบ"],
    difficulty: "hard",
    year: 2001,
    youtubeVideoId: "https://www.youtube.com/watch?v=daute5UKQ_s",
    acceptedAnswers: ["crush gear turbo", "crush gear", "ครัชเกียร์", "ครัชเกียร์ เทอร์โบ"],
    note: "CRUSH GEAR FIGHT!!"
  },
  {
    id: 239,
    title: "Bakusou Kyoudai Let's & Go (OP1)",
    altTitles: ["นักซิ่งสายฟ้า เล็ทส์ แอนด์ โก"],
    difficulty: "normal",
    year: 1996,
    youtubeVideoId: "https://www.youtube.com/watch?v=G3RgsMPf5Ng&list=RDG3RgsMPf5Ng&start_radio=1",
    acceptedAnswers: ["let's & go", "let's and go", "นักซิ่งสายฟ้า", "เล็ทส์ แอนด์ โก"],
    note: "Winning Run!"
  },
  {
    id: 240,
    title: "Captain Tsubasa (OP1)",
    altTitles: ["กัปตันซึบาสะ"],
    difficulty: "normal",
    year: 1983,
    youtubeVideoId: "https://www.youtube.com/watch?v=yYV3rEY3jR4&list=RDyYV3rEY3jR4&start_radio=1",
    acceptedAnswers: ["captain tsubasa", "กัปตันซึบาสะ"],
    note: "Moete Hero"
  },
  {
    id: 241,
    title: "Kinnikuman (OP1)",
    altTitles: ["คินนิคุแมน"],
    difficulty: "hard",
    year: 1983,
    youtubeVideoId: "https://www.youtube.com/watch?v=kIDVMcjHKVI&list=RDkIDVMcjHKVI&start_radio=1",
    acceptedAnswers: ["kinnikuman", "คินนิคุแมน"],
    note: "Kinnikuman Go Fight!"
  },
  {
    id: 242,
    title: "Hokuto no Ken: Fist of the North Star (OP1)",
    altTitles: ["Hokuto no Ken", "ฤทธิ์หมัดดาวเหนือ"],
    difficulty: "normal",
    year: 1984,
    youtubeVideoId: "https://www.youtube.com/watch?v=JKk6hHU0iUs&list=RDJKk6hHU0iUs&start_radio=1",
    acceptedAnswers: ["fist of the north star", "hokuto no ken", "ฤทธิ์หมัดดาวเหนือ"],
    note: "Ai wo Torimodose!!"
  },
  {
    id: 243,
    title: "Space Battleship Yamato (OP1)",
    altTitles: ["เรือรบอวกาศยามาโตะ"],
    difficulty: "hard",
    year: 1974,
    youtubeVideoId: "https://www.youtube.com/watch?v=w6LFkMniuTk&list=RDw6LFkMniuTk&start_radio=1",
    acceptedAnswers: ["space battleship yamato", "เรือรบอวกาศยามาโตะ", "ยามาโตะ"],
    note: "Uchuu Senkan Yamato"
  },
  {
    id: 244,
    title: "Galaxy Express 999 (OP1)",
    altTitles: ["รถด่วนอวกาศ 999"],
    difficulty: "hard",
    year: 1978,
    youtubeVideoId: "https://www.youtube.com/watch?v=Gq-b_iNrQaQ&list=RDGq-b_iNrQaQ&start_radio=1",
    acceptedAnswers: ["galaxy express 999", "รถด่วนอวกาศ 999"],
    note: "Ginga Tetsudou 999"
  },
  {
    id: 245,
    title: "Lupin III (OP1)",
    altTitles: ["จอมโจรลูแปงที่ 3"],
    difficulty: "normal",
    year: 1971,
    youtubeVideoId: "https://www.youtube.com/watch?v=HVWdnEklf00&list=RDHVWdnEklf00&start_radio=1",
    acceptedAnswers: ["lupin iii", "lupin the third", "จอมโจรลูแปงที่ 3", "ลูแปงที่ 3"],
    note: "Lupin III's Theme"
  },
  {
    id: 246,
    title: "Detective Conan (OP1)",
    altTitles: ["ยอดนักสืบจิ๋วโคนัน มฤตยูใต้น้ำทมิฬ"],
    difficulty: "normal",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=vEqCOr11jvU",
    acceptedAnswers: ["detective conan", "ยอดนักสืบจิ๋วโคนัน", "โคนัน"],
    note: "Utsukushiki Kubi"
  },
  {
    id: 247,
    title: "Kimi no Na wa. (ED1)",
    altTitles: ["Kimi no Na wa.", "หลับตาฝัน ถึงชื่อเธอ"],
    difficulty: "easy",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=whHnZ-HBtFU",
    acceptedAnswers: ["your name", "kimi no na wa", "หลับตาฝัน ถึงชื่อเธอ"],
    note: "Nandemonaiya"
  },
  {
    id: 248,
    title: "With You: Mitsumeteitai (OP1)",
    altTitles: ["Tenki no Ko", "ฤดูฝัน ฉันมีเธอ"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=YAXTn0E-Zgo&list=RDYAXTn0E-Zgo&start_radio=1",
    acceptedAnswers: ["weathering with you", "tenki no ko", "ฤดูฝัน ฉันมีเธอ", "ฤดูฝันฉันมีเธอ"],
    note: "Grand Escape"
  },
  {
    id: 249,
    title: "Suzume no Tojimari (ED1)",
    altTitles: ["Suzume no Tojimari", "การผนึกประตูของซุซุเมะ"],
    difficulty: "easy",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=PLHEXul1B_c&list=RDPLHEXul1B_c&start_radio=1",
    acceptedAnswers: ["suzume", "suzume no tojimari", "การผนึกประตูของซุซุเมะ", "ซุซุเมะ"],
    note: "Kanata Haluka"
  },
  {
    id: 250,
    title: "[Oshi no Ko] (OP1)",
    altTitles: ["เกิดใหม่เป็นลูกโอชิ ภาค 2"],
    difficulty: "easy",
    year: 2024,
    youtubeVideoId: "https://www.youtube.com/watch?v=PAcf55v6zqQ&list=RDPAcf55v6zqQ&start_radio=1",
    acceptedAnswers: ["oshi no ko", "เกิดใหม่เป็นลูกโอชิ", "ลูกโอชิ"],
    note: "Fatale"
  },
  {
    id: 251,
    title: "Jujutsu Kaisen (OP1)",
    altTitles: ["มหาเวทย์ผนึกมาร ภาค 2"],
    difficulty: "easy",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=gcgKUcJKxIs&list=RDgcgKUcJKxIs&start_radio=1",
    acceptedAnswers: ["jujutsu kaisen", "มหาเวทย์ผนึกมาร"],
    note: "Ao no Sumika (Where Our Blue Is)"
  },
  {
    id: 252,
    title: "Jujutsu Kaisen (OP1)",
    altTitles: ["มหาเวทย์ผนึกมาร ภาค 2 ภาคชิบูย่า"],
    difficulty: "easy",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=5yb2N3pnztU&list=RD5yb2N3pnztU&start_radio=1",
    acceptedAnswers: ["jujutsu kaisen", "มหาเวทย์ผนึกมาร"],
    note: "SPECIALZ"
  },
  {
    id: 253,
    title: "Demon Slayer: Kimetsu no Yaiba Mugen Train Arc (OP1)",
    altTitles: ["ดาบพิฆาตอสูร ภาคย่านเริงรมย์"],
    difficulty: "easy",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=mQA8WSIb0O4",
    acceptedAnswers: ["demon slayer", "kimetsu no yaiba", "ดาบพิฆาตอสูร"],
    note: "Zankyou Sanka"
  },
  {
    id: 254,
    title: "Demon Slayer: Kimetsu no Yaiba (OP1)",
    altTitles: ["ดาบพิฆาตอสูร ภาคหมู่บ้านช่างตีดาบ"],
    difficulty: "easy",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=OWBCIRhly4U&list=RDOWBCIRhly4U&start_radio=1",
    acceptedAnswers: ["demon slayer", "kimetsu no yaiba", "ดาบพิฆาตอสูร"],
    note: "Kizuna no Kiseki"
  },
  {
    id: 255,
    title: "Kaguya-sama: Love is War? (OP1)",
    altTitles: ["สารภาพรักกับคุณคางุยะซะดีๆ ภาค 2"],
    difficulty: "normal",
    year: 2020,
    youtubeVideoId: "https://www.youtube.com/watch?v=lTlzDfhPtFA&list=RDlTlzDfhPtFA&start_radio=1",
    acceptedAnswers: ["kaguya-sama love is war", "love is war", "สารภาพรักกับคุณคางุยะซะดีๆ", "คางุยะ"],
    note: "DADDY ! DADDY ! DO !"
  },
  {
    id: 256,
    title: "Evangelion: 3.0+1.0 Thrice Upon a Time (OP1)",
    altTitles: ["อีวานเกเลียน 3.0+1.0"],
    difficulty: "normal",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=GZfuWMDEJpw",
    acceptedAnswers: ["evangelion", "อีวานเกเลียน", "evangelion 3.0+1.0"],
    note: "One Last Kiss"
  },
  {
    id: 257,
    title: "Sword Art Online: Alicization (OP1)",
    altTitles: ["ซอร์ดอาร์ตออนไลน์ อลิซิเซชั่น"],
    difficulty: "normal",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=3hdJ8PKNXrc&list=RD3hdJ8PKNXrc&start_radio=1",
    acceptedAnswers: ["sword art online", "sao", "ซอร์ดอาร์ตออนไลน์"],
    note: "ADAMAS"
  },
  {
    id: 258,
    title: "Tokyo Ghoul:re (OP1)",
    altTitles: ["โตเกียวกูล:รี"],
    difficulty: "hard",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=kXyRLrPWU_E&list=RDkXyRLrPWU_E&start_radio=1",
    acceptedAnswers: ["tokyo ghoul", "tokyo ghoul re", "โตเกียวกูล", "โตเกียวกูล รี"],
    note: "asphyxia"
  },
  {
    id: 259,
    title: "Fate/Zero (ED1)",
    altTitles: ["เฟท/ซีโร่"],
    difficulty: "hard",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=M1Fv2Jy19jE&list=RDM1Fv2Jy19jE&start_radio=1",
    acceptedAnswers: ["fate zero", "fate/zero", "เฟทซีโร่", "เฟท/ซีโร่"],
    note: "Memoria"
  },
  {
    id: 260,
    title: "Steins;Gate 0 (OP1)",
    altTitles: ["ชไตน์สเกท ซีโร่"],
    difficulty: "hard",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=1xJbdY9B3A8&list=RD1xJbdY9B3A8&start_radio=1",
    acceptedAnswers: ["steins gate", "steins gate 0", "ชไตน์สเกท", "ชไตน์สเกท 0"],
    note: "Fatima"
  },
  {
    id: 261,
    title: "Fullmetal Alchemist: Brotherhood (OP4)",
    altTitles: ["FMA Brotherhood"],
    difficulty: "normal",
    year: 2009,
    youtubeVideoId: "https://www.youtube.com/watch?v=IcuZ7jK3EDk&list=RDIcuZ7jK3EDk&start_radio=1",
    acceptedAnswers: ["fullmetal alchemist brotherhood", "fma brotherhood", "แขนกลคนแปรธาตุ"],
    note: "Period"
  },
  {
    id: 262,
    title: "One Piece (OP11)",
    altTitles: ["วันพีซ"],
    difficulty: "easy",
    year: 2009,
    youtubeVideoId: "https://www.youtube.com/watch?v=LzC0HSOOauI&list=RDLzC0HSOOauI&start_radio=1",
    acceptedAnswers: ["one piece", "วันพีซ"],
    note: "Share the World"
  },
  {
    id: 263,
    title: "Gintama (OP5)",
    altTitles: ["กินทามะ"],
    difficulty: "normal",
    year: 2008,
    youtubeVideoId: "https://www.youtube.com/watch?v=A8jbtSG9zW0&list=RDA8jbtSG9zW0&start_radio=1",
    acceptedAnswers: ["gintama", "กินทามะ"],
    note: "Donten"
  },
  {
    id: 264,
    title: "Haikyuu!! (OP1)",
    altTitles: ["ไฮคิว!! คู่ตบฟ้าประทาน ภาค 3"],
    difficulty: "easy",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=OTio-0LwlXE&list=RDOTio-0LwlXE&start_radio=1",
    acceptedAnswers: ["haikyuu", "haikyu", "ไฮคิว", "ไฮคิว คู่ตบฟ้าประทาน"],
    note: "Hikariare"
  },
  {
    id: 265,
    title: "My Hero Academia Season 3 (OP1)",
    altTitles: ["มายฮีโร่ อคาเดเมีย ภาค 3"],
    difficulty: "easy",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=v1YojYU5nPQ&list=RDv1YojYU5nPQ&start_radio=1",
    acceptedAnswers: ["my hero academia", "boku no hero academia", "มายฮีโร่ อคาเดเมีย"],
    note: "ODD FUTURE"
  },
  {
    id: 266,
    title: "Shingeki no Kyojin (Attack On Titan) Season 3 (OP1)",
    altTitles: ["ผ่าพิภพไททัน ภาค 3"],
    difficulty: "easy",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=jhYg5NrN-r8&list=RDjhYg5NrN-r8&start_radio=1",
    acceptedAnswers: ["attack on titan", "shingeki no kyojin", "ผ่าพิภพไททัน"],
    note: "Red Swan"
  },
  {
    id: 267,
    title: "Shingeki no Kyojin (Attack On Titan): Final Season (OP1)",
    altTitles: ["ผ่าพิภพไททัน ไฟนอลซีซั่น"],
    difficulty: "easy",
    year: 2020,
    youtubeVideoId: "https://www.youtube.com/watch?v=0DLFFQ6ThNA&list=RD0DLFFQ6ThNA&start_radio=1",
    acceptedAnswers: ["attack on titan", "shingeki no kyojin", "ผ่าพิภพไททัน"],
    note: "My War"
  },
  {
    id: 268,
    title: "Shingeki no Kyojin (Attack On Titan): Final Season Part 2 (OP1)",
    altTitles: ["ผ่าพิภพไททัน ไฟนอลซีซั่น พาร์ท 2"],
    difficulty: "easy",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=2S4qGKmzBJE&list=RD2S4qGKmzBJE&start_radio=1",
    acceptedAnswers: ["attack on titan", "shingeki no kyojin", "ผ่าพิภพไททัน"],
    note: "The Rumbling"
  },
  {
    id: 269,
    title: "Unbreakable (OP1)",
    altTitles: ["โจโจ้ ภาค 4 เพชรแท้ไม่มีวันสลาย"],
    difficulty: "normal",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=20m00ohYASw&list=RD20m00ohYASw&start_radio=1",
    acceptedAnswers: ["jojo", "โจโจ้", "diamond is unbreakable", "เพชรแท้ไม่มีวันสลาย"],
    note: "Crazy Noisy Bizarre Town"
  },
  {
    id: 270,
    title: "JoJo's Bizarre Adventure: Stone Ocean (OP1)",
    altTitles: ["โจโจ้ ภาค 6 สโตนโอเชียน"],
    difficulty: "normal",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=9l5VL-JM_Ws&list=RD9l5VL-JM_Ws&start_radio=1",
    acceptedAnswers: ["jojo", "โจโจ้", "stone ocean", "สโตนโอเชียน"],
    note: "STONE OCEAN"
  },
  {
    id: 271,
    title: "Black Clover (OP3)",
    altTitles: ["แบล็คโคลเวอร์"],
    difficulty: "normal",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=vsmNw9MioMQ&list=RDvsmNw9MioMQ&start_radio=1",
    acceptedAnswers: ["black clover", "แบล็คโคลเวอร์"],
    note: "Black Rover"
  },
  {
    id: 272,
    title: "Black Clover (OP10)",
    altTitles: ["แบล็คโคลเวอร์"],
    difficulty: "normal",
    year: 2020,
    youtubeVideoId: "https://www.youtube.com/watch?v=XMeQeIG_rQg&list=RDXMeQeIG_rQg&start_radio=1",
    acceptedAnswers: ["black clover", "แบล็คโคลเวอร์"],
    note: "Black Catcher"
  },
  {
    id: 273,
    title: "K-On! (ED1)",
    altTitles: ["เค-อง!", "ก๊วนดนตรีแป๋วแหวว"],
    difficulty: "normal",
    year: 2009,
    youtubeVideoId: "https://www.youtube.com/watch?v=hUOsDhkf8F8&list=RDhUOsDhkf8F8&start_radio=1",
    acceptedAnswers: ["k-on!", "k on", "เค-อง!", "เคอง"],
    note: "Don't say 'lazy'"
  },
  {
    id: 274,
    title: "Haruhi Suzumiya (ED1)",
    altTitles: ["เรียกเธอว่าพระเจ้า สึซึมิยะ ฮารุฮิ"],
    difficulty: "hard",
    year: 2006,
    youtubeVideoId: "https://www.youtube.com/watch?v=EI7BKnOGWVs&list=RDEI7BKnOGWVs&start_radio=1",
    acceptedAnswers: ["haruhi suzumiya", "haruhi", "ฮารุฮิ"],
    note: "Hare Hare Yukai"
  },
  {
    id: 275,
    title: "Toaru Majutsu no Index (OP1)",
    altTitles: ["Toaru Majutsu no Index", "อินเด็กซ์ คัมภีร์คาถาต้องห้าม"],
    difficulty: "hard",
    year: 2008,
    youtubeVideoId: "https://www.youtube.com/watch?v=huT546GDFDc&list=RDhuT546GDFDc&start_radio=1",
    acceptedAnswers: ["a certain magical index", "index", "อินเด็กซ์", "อินเด็กซ์ คัมภีร์คาถาต้องห้าม"],
    note: "PSI-missing"
  },
  {
    id: 276,
    title: "Toradora! (OP2)",
    altTitles: ["โทระโดระ", "ยัยตัวร้ายกับนายหน้าโหด"],
    difficulty: "hard",
    year: 2008,
    youtubeVideoId: "https://www.youtube.com/watch?v=FKWUJnjmz_0&list=RDFKWUJnjmz_0&start_radio=1",
    acceptedAnswers: ["toradora!", "toradora", "โทระโดระ"],
    note: "silky heart"
  },
  {
    id: 277,
    title: "Angel Beats! (ED1)",
    altTitles: ["แองเจิลบีทส์! แผนพิชิตนางฟ้า"],
    difficulty: "normal",
    year: 2010,
    youtubeVideoId: "https://www.youtube.com/watch?v=_d8lv6YLuGc&list=RD_d8lv6YLuGc&start_radio=1",
    acceptedAnswers: ["angel beats!", "angel beats", "แองเจิลบีทส์"],
    note: "Brave Song"
  },
  {
    id: 278,
    title: "Meiji x Kokosake & anohana Receipt Oubo Campaign (ED1)",
    altTitles: ["ดอกไม้ มิตรภาพ และความทรงจำ"],
    difficulty: "normal",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=B0GpxW8K0vY&list=RDB0GpxW8K0vY&start_radio=1",
    acceptedAnswers: ["anohana", "ดอกไม้ มิตรภาพ และความทรงจำ", "อโนฮานะ"],
    note: "secret base ~Kimi ga Kureta Mono~"
  },
  {
    id: 279,
    title: "Your Lie in April (ED2)",
    altTitles: ["Shigatsu wa Kimi no Uso", "เพลงรักสองหัวใจ"],
    difficulty: "normal",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=jRFk22ENWNg&list=RDjRFk22ENWNg&start_radio=1",
    acceptedAnswers: ["your lie in april", "shigatsu wa kimi no uso", "เพลงรักสองหัวใจ"],
    note: "Orange"
  },
  {
    id: 280,
    title: "Guilty Crown (OP2)",
    altTitles: ["ปฏิวัติหัตถ์ราชัน"],
    difficulty: "hard",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=Hv4znGv6lzg&list=RDHv4znGv6lzg&start_radio=1",
    acceptedAnswers: ["guilty crown", "ปฏิวัติหัตถ์ราชัน", "กิลตี้คราวน์"],
    note: "My Dearest"
  },
  {
    id: 281,
    title: "Psycho-Pass (ED1)",
    altTitles: ["ไซโคพาส"],
    difficulty: "hard",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=6m_NwZYVefo&list=RD6m_NwZYVefo&start_radio=1",
    acceptedAnswers: ["psycho-pass", "psycho pass", "ไซโคพาส"],
    note: "Namae no nai Kaibutsu (名前のない怪物)"
  },
  {
    id: 282,
    title: "Noragami Aragoto (OP1)",
    altTitles: ["โนรางามิ เทวดาขาจร ภาค 2"],
    difficulty: "normal",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=aZenmeRytEM&list=RDaZenmeRytEM&start_radio=1",
    acceptedAnswers: ["noragami aragoto", "noragami", "โนรางามิ"],
    note: "Kyouran Hey Kids!! (狂乱Hey Kids!!)"
  },
  {
    id: 283,
    title: "Blue Exorcist (OP2)",
    altTitles: ["เอ็กซอร์ซิสต์พันธุ์ปีศาจ"],
    difficulty: "normal",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=vSUsiPvJv2Q&list=RDvSUsiPvJv2Q&start_radio=1",
    acceptedAnswers: ["blue exorcist", "ao no exorcist", "บลูเอ็กซอร์ซิสต์"],
    note: "IN MY WORLD"
  },
  {
    id: 284,
    title: "Sword Art Online II (OP2)",
    altTitles: ["ซอร์ดอาร์ตออนไลน์ ภาค 2"],
    difficulty: "normal",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=XLvaHFVwFkg&list=RDXLvaHFVwFkg&start_radio=1",
    acceptedAnswers: ["sword art online", "sao", "ซอร์ดอาร์ตออนไลน์"],
    note: "courage"
  },
  {
    id: 285,
    title: "Re:Zero (OP2)",
    altTitles: ["รีเซทชีวิต ฝ่าวิกฤตต่างโลก"],
    difficulty: "normal",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=Jo5HjzgoiZA&list=RDJo5HjzgoiZA&start_radio=1",
    acceptedAnswers: ["re:zero", "rezero", "รีเซทชีวิต ฝ่าวิกฤตต่างโลก", "รีเซโร่"],
    note: "Paradisus-Paradoxum"
  },
  {
    id: 286,
    title: "KonoSuba Season 2 (OP1)",
    altTitles: ["ขอให้โชคดีมีชัยในโลกแฟนตาซี! ภาค 2"],
    difficulty: "normal",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=vdcddjV0l5o&list=RDvdcddjV0l5o&start_radio=1",
    acceptedAnswers: ["konosuba", "konosuba season 2", "kono suba season 2", "ขอให้โชคดีมีชัยในโลกแฟนตาซี!", "ขอให้โชคดีมีชัยในโลกแฟนตาซี! ภาค 2"],
    note: "TOMORROW"
  },
  {
    id: 287,
    title: "Nanatsu no taizai (OP2)",
    altTitles: ["ศึกตำนาน 7 อัศวิน"],
    difficulty: "easy",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=lD-nLjQE9SU&list=RDlD-nLjQE9SU&start_radio=1",
    acceptedAnswers: ["the seven deadly sins", "nanatsu no taizai", "ศึกตำนาน 7 อัศวิน", "บาป 7 ประการ"],
    note: "เมลีโอดัส"
  },
  {
    id: 288,
    title: "Assassination Classroom Staffel 2 (OP1)",
    altTitles: ["ห้องเรียนลอบสังหาร ภาค 2"],
    difficulty: "normal",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=iug12DnMNHQ&list=RDiug12DnMNHQ&start_radio=1",
    acceptedAnswers: ["assassination classroom", "ansatsu kyoushitsu", "ห้องเรียนลอบสังหาร"],
    note: "QUESTION"
  },
  {
    id: 289,
    title: "Shokugeki no Soma (OP2)",
    altTitles: ["ยอดนักปรุงโซมะ"],
    difficulty: "normal",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=CqF0aOPT2XQ&list=RDCqF0aOPT2XQ&start_radio=1",
    acceptedAnswers: ["food wars!", "food wars", "shokugeki no soma", "ยอดนักปรุงโซมะ"],
    note: "Rising Rainbow (ライジングレインボウ)"
  },
  {
    id: 290,
    title: "No Game No Life (ED1)",
    altTitles: ["โนเกม โนไลฟ์"],
    difficulty: "normal",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=6kQzRm21N_g&list=RD6kQzRm21N_g&start_radio=1",
    acceptedAnswers: ["no game no life", "โนเกมโนไลฟ์", "โนเกม โนไลฟ์"],
    note: "This game"
  },
  {
    id: 291,
    title: "Overlord III (OP1)",
    altTitles: ["โอเวอร์ลอร์ด ภาค 3"],
    difficulty: "normal",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=yxptP0CXMVo&list=RDyxptP0CXMVo&start_radio=1",
    acceptedAnswers: ["overlord", "โอเวอร์ลอร์ด"],
    note: "VORACITY"
  },
  {
    id: 292,
    title: "Tate no yuusha (OP2)",
    altTitles: ["ผู้กล้าโล่ผงาด"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=OzKLiHJGZbw&list=RDOzKLiHJGZbw&start_radio=1",
    acceptedAnswers: ["the rising of the shield hero", "tate no yuusha", "shield hero", "ผู้กล้าโล่ผงาด"],
    note: "FAITH"
  },
  {
    id: 293,
    title: "Tensei shitara slime datta ken (OP2)",
    altTitles: ["เกิดใหม่ทั้งทีก็เป็นสไลม์ไปซะแล้ว"],
    difficulty: "normal",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=3wki_SgEUnU&list=RD3wki_SgEUnU&start_radio=1",
    acceptedAnswers: ["that time i got reincarnated as a slime", "tensura", "เกิดใหม่ทั้งทีก็เป็นสไลม์ไปซะแล้ว", "สไลม์ , tensei shitara slime datta ken , slime"],
    note: "Meguru Mono"
  },
  {
    id: 294,
    title: "Mushoku Tensei: Jobless Reincarnation Season 2 (OP1)",
    altTitles: ["เกิดชาตินี้พี่ต้องเทพ ภาค 2"],
    difficulty: "normal",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=hkcdLR_tdtA&list=RDhkcdLR_tdtA&start_radio=1",
    acceptedAnswers: ["mushoku tensei", "jobless reincarnation", "เกิดชาตินี้พี่ต้องเทพ"],
    note: "Mezame no Uta (目覚めの唄)"
  },
  {
    id: 295,
    title: "Spy x Family (OP1)",
    altTitles: ["สปาย x แฟมิลี ภาค 2"],
    difficulty: "easy",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=Hlw8dTz_iq0&list=RDHlw8dTz_iq0&start_radio=1",
    acceptedAnswers: ["spy x family", "spy family", "สปายแฟมิลี", "สปาย x แฟมิลี"],
    note: "Kura Kura (クラクラ)"
  },
  {
    id: 296,
    title: "[Oshi no Ko] (ED1)",
    altTitles: ["เกิดใหม่เป็นลูกโอชิ"],
    difficulty: "easy",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=QUTShho-5I8&list=RDQUTShho-5I8&start_radio=1",
    acceptedAnswers: ["oshi no ko", "เกิดใหม่เป็นลูกโอชิ", "ลูกโอชิ"],
    note: "Idol (アイドル)"
  },
  {
    id: 297,
    title: "Frieren: Beyond Journey's End (OP2)",
    altTitles: ["คำอธิษฐานในวันที่จากลา"],
    difficulty: "normal",
    year: 2024,
    youtubeVideoId: "https://www.youtube.com/watch?v=wfmYSuPiYEQ&list=RDwfmYSuPiYEQ&start_radio=1",
    acceptedAnswers: ["frieren", "sousou no frieren", "คำอธิษฐานในวันที่จากลา", "ฟรีเรน"],
    note: "Haru (晴る)"
  },
  {
    id: 298,
    title: "The Apothecary Diaries (OP2)",
    altTitles: ["สืบคดีปริศนา หมอยาตำรับโคมแดง"],
    difficulty: "easy",
    year: 2024,
    youtubeVideoId: "https://www.youtube.com/watch?v=z-UPUXGYYqo&list=RDz-UPUXGYYqo&start_radio=1",
    acceptedAnswers: ["the apothecary diaries", "kusuriya no hitorigoto", "สืบคดีปริศนา หมอยาตำรับโคมแดง", "หมอยาตำรับโคมแดง"],
    note: "Ambivalent (アンビバレント)"
  },
  {
    id: 299,
    title: "Mashle (OP1)",
    altTitles: ["ศึกโลกเวทมนตร์คนพลังกล้าม"],
    difficulty: "easy",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=cEIJLNBF4VU&list=RDcEIJLNBF4VU&start_radio=1",
    acceptedAnswers: ["mashle", "ศึกโลกเวทมนตร์คนพลังกล้าม", "มัชลี"],
    note: "เวทย์มนตร์ที่ใช้กล้ามเนื้อ"
  },
  {
    id: 300,
    title: "Chainsaw Man (ED3)",
    altTitles: ["เชนซอว์แมน"],
    difficulty: "easy",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=HEwAiwttN10&list=RDHEwAiwttN10&start_radio=1",
    acceptedAnswers: ["chainsaw man", "เชนซอว์แมน"],
    note: "Hawatari 2-oku Centi (刃渡り2億センチ)"
  },
  {
    id: 301,
    title: "Cardfight!! Vanguard (OP1)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด"],
    difficulty: "normal",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=gpoPoKqpBNY",
    acceptedAnswers: ["cardfight vanguard", "vanguard", "แวนการ์ด", "การ์ดไฟท์ แวนการ์ด"],
    note: "จินตนาการสิ"
  },
  {
    id: 302,
    title: "Cardfight!! Vanguard (OP2)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด"],
    difficulty: "normal",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=7nwVRHYISCI",
    acceptedAnswers: ["cardfight vanguard", "vanguard", "แวนการ์ด", "การ์ดไฟท์ แวนการ์ด"],
    note: "เบียวไซควอเลีย"
  },
  {
    id: 303,
    title: "Cardfight Vanguard: Asia Circuit (OP1)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด เอเชียเซอร์กิต"],
    difficulty: "normal",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=ePyoJfT9FRc&list=RDePyoJfT9FRc&start_radio=1",
    acceptedAnswers: ["cardfight vanguard", "vanguard", "แวนการ์ด", "การ์ดไฟท์ แวนการ์ด"],
    note: "LIMIT BREAK"
  },
  {
    id: 304,
    title: "Coppelion (OP1)",
    altTitles: ["สามนางฟ้าผ่าโลกนิวเคลียร์"],
    difficulty: "hard",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=bO5r5YJrgJY&list=RDbO5r5YJrgJY&start_radio=1",
    acceptedAnswers: ["coppelion", "สามนางฟ้าผ่าโลกนิวเคลียร์"],
    note: "ANGEL"
  },
  {
    id: 305,
    title: "Madan no Ou to Vanadis (OP1)",
    altTitles: ["Lord Marksman and Vanadis", "วานาดีสกับราชันกระสุนมนตรา"],
    difficulty: "hard",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=R9KhHVcRb7c&list=RDR9KhHVcRb7c&start_radio=1",
    acceptedAnswers: ["madan no ou to vanadis", "vanadis", "วานาดีสกับราชันกระสุนมนตรา", "วานาดีส"],
    note: "Ginsen no Kaze (銀閃の風)"
  },
  {
    id: 306,
    title: "Girls & Panzer (OP1)",
    altTitles: ["สาวปิ๊ง! ซิ่งแทงค์"],
    difficulty: "normal",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=ES06Fkkl8ac&list=RDES06Fkkl8ac&start_radio=1",
    acceptedAnswers: ["girls und panzer", "สาวปิ๊ง! ซิ่งแทงค์"],
    note: "DreamRiser"
  },
  {
    id: 307,
    title: "Drifters (OP1)",
    altTitles: ["สงครามผ่ามิติ"],
    difficulty: "normal",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=cXabZ_-QPb0&list=RDcXabZ_-QPb0&start_radio=1",
    acceptedAnswers: ["drifters", "สงครามผ่ามิติ", "ดริฟเตอร์ส"],
    note: "Gospel Of The Throttle 狂奔REMIX ver."
  },
  {
    id: 308,
    title: "Qualidea Code (OP1)",
    altTitles: ["ควอลิเดีย โค้ด"],
    difficulty: "hard",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=lGs1qWdUAr4&list=RDlGs1qWdUAr4&start_radio=1",
    acceptedAnswers: ["qualidea code", "ควอลิเดีย โค้ด"],
    note: "Brave Freak Out"
  },
  {
    id: 309,
    title: "Trinity Seven (OP1)",
    altTitles: ["ทรีนิตี้เซเว่น 7 จ้าวคัมภีร์เวท"],
    difficulty: "normal",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=CIhAWdqx4SM&list=RDCIhAWdqx4SM&start_radio=1",
    acceptedAnswers: ["trinity seven", "ทรีนิตี้เซเว่น", "7 จ้าวคัมภีร์เวท"],
    note: "Seven Doors"
  },
  {
    id: 310,
    title: "Mahouka Koukou no Rettousei (OP1)",
    altTitles: ["Mahouka Koukou no Rettousei", "พี่น้องปริศนาโรงเรียนมหาเวท"],
    difficulty: "normal",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=hRxZ2qfF1Dg&list=RDhRxZ2qfF1Dg&start_radio=1",
    acceptedAnswers: ["mahouka koukou no rettousei", "mahouka", "the irregular at magic high school", "พี่น้องปริศนาโรงเรียนมหาเวท"],
    note: "Rising Hope"
  },
  {
    id: 311,
    title: "Mahouka Koukou no Rettousei (OP2)",
    altTitles: ["Mahouka Koukou no Rettousei", "พี่น้องปริศนาโรงเรียนมหาเวท"],
    difficulty: "normal",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=m0XmNdUPhxA&list=RDm0XmNdUPhxA&start_radio=1",
    acceptedAnswers: ["mahouka koukou no rettousei", "mahouka", "the irregular at magic high school", "พี่น้องปริศนาโรงเรียนมหาเวท"],
    note: "grilletto"
  },
  {
    id: 312,
    title: "Mahouka Koukou no Rettousei (OP1)",
    altTitles: ["Mahouka Koukou no Rettousei Season 2", "พี่น้องปริศนาโรงเรียนมหาเวท ภาค 2"],
    difficulty: "normal",
    year: 2020,
    youtubeVideoId: "https://www.youtube.com/watch?v=OLa9O1Rja28&list=RDOLa9O1Rja28&start_radio=1",
    acceptedAnswers: ["mahouka koukou no rettousei", "mahouka", "the irregular at magic high school", "พี่น้องปริศนาโรงเรียนมหาเวท"],
    note: "Rising Hope"
  },
  {
    id: 313,
    title: "Gakusen Toshi Asterisk (OP1)",
    altTitles: ["Gakusen Toshi Asterisk", "โรงเรียนสัประยุทธ์ แอสเทอริสก์"],
    difficulty: "normal",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=VWnr8XNzEOs&list=RDVWnr8XNzEOs&start_radio=1",
    acceptedAnswers: ["gakusen toshi asterisk", "the asterisk war", "asterisk war", "โรงเรียนสัประยุทธ์ แอสเทอริสก์", "แอสเทอริสก์"],
    note: "Brand-new World"
  },
  {
    id: 314,
    title: "The Asterisk War: Gakusen Toshi Asterisk (OP1)",
    altTitles: ["Gakusen Toshi Asterisk Season 2", "โรงเรียนสัประยุทธ์ แอสเทอริสก์ ภาค 2"],
    difficulty: "normal",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=Taxh7LO8Y24&list=RDTaxh7LO8Y24&start_radio=1",
    acceptedAnswers: ["gakusen toshi asterisk", "the asterisk war", "asterisk war", "โรงเรียนสัประยุทธ์ แอสเทอริสก์"],
    note: "The Asterisk War"
  },
  {
    id: 315,
    title: "Grisaia no Rakuen (OP1)",
    altTitles: ["Grisaia no Rakuen", "ฮาเร็มในรั้วโรงเรียน"],
    difficulty: "hard",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=fABdDZBFJzs",
    acceptedAnswers: ["grisaia no rakuen", "grisaia", "the eden of grisaia"],
    note: "เนื้อเรื่องตรงข้ามกกับชื่อเรื่อง"
  },
  {
    id: 316,
    title: "Absolute Duo (OP1)",
    altTitles: ["ศึกศาสตรา วิญญาณแฝด"],
    difficulty: "normal",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=lKanVTWDH90&list=RDlKanVTWDH90&start_radio=1",
    acceptedAnswers: ["absolute duo", "ศึกศาสตรา วิญญาณแฝด"],
    note: "Absolute Soul"
  },
  {
    id: 317,
    title: "Seiken Tsukai no World Break (OP1)",
    altTitles: ["Seiken Tsukai no World Break", "ดาบศักดิ์สิทธิ์และบทสวดต้องห้าม"],
    difficulty: "hard",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=6mCS9uL_YxU&list=RD6mCS9uL_YxU&start_radio=1",
    acceptedAnswers: ["seiken tsukai no world break", "world break", "ดาบศักดิ์สิทธิ์และบทสวดต้องห้าม"],
    note: "Hi no Ito Rinne no Gemini (緋ノ糸輪廻ノGEMINI)"
  },
  {
    id: 318,
    title: "Isekai wa Smartphone to Tomo ni (OP1)",
    altTitles: ["Isekai wa Smartphone to Tomo ni", "ไปต่างโลกกับสมาร์ทโฟน"],
    difficulty: "normal",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=LNfxVXR6U4o&list=RDLNfxVXR6U4o&start_radio=1",
    acceptedAnswers: ["isekai wa smartphone", "isekai wa smartphone to tomo ni", "in another world with my smartphone", "ไปต่างโลกกับสมาร์ทโฟน"],
    note: "Another World"
  },
  {
    id: 319,
    title: "Isekai wa Smartphone to Tomo ni. 2 (OP1)",
    altTitles: ["Isekai wa Smartphone to Tomo ni 2", "ไปต่างโลกกับสมาร์ทโฟน ภาค 2"],
    difficulty: "normal",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=nBC8cVy3PGw&list=RDnBC8cVy3PGw&start_radio=1",
    acceptedAnswers: ["isekai wa smartphone", "isekai wa smartphone to tomo ni", "in another world with my smartphone", "ไปต่างโลกกับสมาร์ทโฟน"],
    note: "Real Diamond"
  },
  {
    id: 320,
    title: "Hundred (OP1)",
    altTitles: ["ฮันเดรด"],
    difficulty: "normal",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=Ns91RM-B71U&list=RDNs91RM-B71U&start_radio=1",
    acceptedAnswers: ["hundred", "ฮันเดรด"],
    note: "BLOODRED"
  },
  {
    id: 321,
    title: "Maoyuu Maou Yuusha (OP1)",
    altTitles: ["Maoyuu Maou Yuusha", "มาโออิ จอมมารผู้กล้า จับคู่กู้โลก"],
    difficulty: "hard",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=Q5gxOgsAs-M&list=RDQ5gxOgsAs-M&start_radio=1",
    acceptedAnswers: ["maoyuu maou yuusha", "maoyuu", "maoyou", "มาโออิ จอมมารผู้กล้า จับคู่กู้โลก"],
    note: "Mukai Kaze"
  },
  {
    id: 322,
    title: "Rakudai Kishi no Cavalry (OP1)",
    altTitles: ["Rakudai Kishi no Cavalry", "เจ้าหญิงสีชาดกับอัศวินดาบไร้ทัพ"],
    difficulty: "normal",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=04OeRVJ3vGs&list=RD04OeRVJ3vGs&start_radio=1",
    acceptedAnswers: ["rakudai kishi no cavalry", "chivalry of a failed knight", "rakudai kishi", "เจ้าหญิงสีชาดกับอัศวินดาบไร้ทัพ"],
    note: "Identity"
  },
  {
    id: 323,
    title: "Saijaku Muhai no Bahamut (OP1)",
    altTitles: ["Saijaku Muhai no Bahamut", "มังกรเหล็กไร้พ่าย"],
    difficulty: "hard",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=E8RGzKzEAsk",
    acceptedAnswers: ["saijaku muhai no bahamut", "undefeated bahamut chronicle", "bahamut", "มังกรเหล็กไร้พ่าย"],
    note: "Hiryuu no Kishi"
  },
  {
    id: 324,
    title: "Date A Live II (OP1)",
    altTitles: ["พิชิตรัก พิทักษ์โลก ภาค 2"],
    difficulty: "normal",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=BL0YK8jryK0&list=RDBL0YK8jryK0&start_radio=1",
    acceptedAnswers: ["date a live", "พิชิตรัก พิทักษ์โลก", "เดทอะไลฟ์"],
    note: "Trust in you"
  },
  {
    id: 325,
    title: "Date A Live III (OP1)",
    altTitles: ["พิชิตรัก พิทักษ์โลก ภาค 3"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=3wmPMIPE8_w&list=RD3wmPMIPE8_w&start_radio=1",
    acceptedAnswers: ["date a live", "พิชิตรัก พิทักษ์โลก", "เดทอะไลฟ์"],
    note: "I swear"
  },
  {
    id: 326,
    title: "Date A Live IV (OP1)",
    altTitles: ["พิชิตรัก พิทักษ์โลก ภาค 4"],
    difficulty: "normal",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=T4y7imuU4nM&list=RDT4y7imuU4nM&start_radio=1",
    acceptedAnswers: ["date a live", "พิชิตรัก พิทักษ์โลก", "เดทอะไลฟ์"],
    note: "OveR"
  },
  {
    id: 327,
    title: "Goblin Slayer (OP1)",
    altTitles: ["ก็อบลินสเลเยอร์"],
    difficulty: "normal",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=0i0z98M2y5U&list=RD0i0z98M2y5U&start_radio=1",
    acceptedAnswers: ["goblin slayer", "goblinslayer", "ก็อบลินสเลเยอร์"],
    note: "Rightfully"
  },
  {
    id: 328,
    title: "Goblin Slayer II (OP1)",
    altTitles: ["ก็อบลินสเลเยอร์ ภาค 2"],
    difficulty: "normal",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=LQqPMJBgzig&list=RDLQqPMJBgzig&start_radio=1",
    acceptedAnswers: ["goblin slayer", "goblinslayer", "ก็อบลินสเลเยอร์"],
    note: "Entertainment"
  },
  {
    id: 329,
    title: "Amagami SS (OP1)",
    altTitles: ["อามากามิ อุบัติรักวันคริสต์มาส"],
    difficulty: "normal",
    year: 2010,
    youtubeVideoId: "https://www.youtube.com/watch?v=P8zDcoHKTCg&list=RDP8zDcoHKTCg&start_radio=1",
    acceptedAnswers: ["amagami ss", "amagami", "อามากามิ อุบัติรักวันคริสต์มาส", "อามากามิ"],
    note: "i Love"
  },
  {
    id: 330,
    title: "Amagami SS (OP2)",
    altTitles: ["อามากามิ อุบัติรักวันคริสต์มาส"],
    difficulty: "normal",
    year: 2010,
    youtubeVideoId: "https://www.youtube.com/watch?v=qi8xQosoNZQ&list=RDqi8xQosoNZQ&start_radio=1",
    acceptedAnswers: ["amagami ss", "amagami", "อามากามิ อุบัติรักวันคริสต์มาส", "อามากามิ"],
    note: "Kimi no Mama de"
  },
  {
    id: 331,
    title: "Nyan Koi! (OP1)",
    altTitles: ["รักน้องต้องมีเหมียว"],
    difficulty: "hard",
    year: 2009,
    youtubeVideoId: "https://www.youtube.com/watch?v=MVjya_57uEo&list=RDMVjya_57uEo&start_radio=1",
    acceptedAnswers: ["nyan koi!", "nyan koi", "nyankoi", "รักน้องต้องมีเหมียว"],
    note: "Nyanderful!"
  },
  {
    id: 332,
    title: "Gundam Build Fighters (OP1)",
    altTitles: ["กันดั้มบิลด์ไฟท์เตอร์"],
    difficulty: "normal",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=s8P1nlx0EV8",
    acceptedAnswers: ["gundam build fighters", "กันดั้มบิลด์ไฟท์เตอร์"],
    note: "Nibun no Ichi"
  },
  {
    id: 333,
    title: "Gundam Build Fighters (OP2)",
    altTitles: ["กันดั้มบิลด์ไฟท์เตอร์"],
    difficulty: "normal",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=cNecbjpc3Ok",
    acceptedAnswers: ["gundam build fighters", "กันดั้มบิลด์ไฟท์เตอร์"],
    note: "wimp"
  },
  {
    id: 334,
    title: "To LOVE-Ru (OP1)",
    altTitles: ["ทูเลิฟรู"],
    difficulty: "normal",
    year: 2008,
    youtubeVideoId: "https://www.youtube.com/watch?v=bv45h79xhO4&list=RDbv45h79xhO4&start_radio=1",
    acceptedAnswers: ["to love-ru", "to love ru", "ทูเลิฟรู"],
    note: "forever we can make it!"
  },
  {
    id: 335,
    title: "Motto To LOVE-Ru (OP1)",
    altTitles: ["ทูเลิฟรู ภาค 2"],
    difficulty: "normal",
    year: 2010,
    youtubeVideoId: "https://www.youtube.com/watch?v=sXZpOfsq1TA&list=RDsXZpOfsq1TA&start_radio=1",
    acceptedAnswers: ["to love-ru", "to love ru", "ทูเลิฟรู"],
    note: "Loop-the-Loop"
  },
  {
    id: 336,
    title: "To LOVE-Ru Darkness (OP1)",
    altTitles: ["ทูเลิฟรู ดาร์กเนส"],
    difficulty: "normal",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=-tww49g8e2Y&list=RD-tww49g8e2Y&start_radio=1",
    acceptedAnswers: ["to love-ru darkness", "to love ru darkness", "ทูเลิฟรู ดาร์กเนส", "ทูเลิฟรู"],
    note: "Rakuen Project"
  },
  {
    id: 337,
    title: "Sankarea (OP1)",
    altTitles: ["ซังกะเรอะ", "มนต์รักซอมบี้สาวโมเอะ"],
    difficulty: "normal",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=uIfNesqrOo4&list=RDuIfNesqrOo4&start_radio=1",
    acceptedAnswers: ["sankarea", "sanhare a", "ซังกะเรอะ", "มนต์รักซอมบี้สาวโมเอะ"],
    note: "Esoragoto"
  },
  {
    id: 338,
    title: "Toriko (OP1)",
    altTitles: ["โทริโกะ", "นักล่าอาหาร"],
    difficulty: "easy",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=vkvpA08IJDU&list=RDvkvpA08IJDU&start_radio=1",
    acceptedAnswers: ["toriko", "โทริโกะ"],
    note: "Guts Guts!!"
  },
  {
    id: 339,
    title: "Toriko (OP2)",
    altTitles: ["โทริโกะ", "นักล่าอาหาร"],
    difficulty: "easy",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=n-MeuJxECho",
    acceptedAnswers: ["toriko", "โทริโกะ"],
    note: "Go Shoku My Way!!"
  },
  {
    id: 340,
    title: "Koutetsujou no Kabaneri (OP1)",
    altTitles: ["Koutetsujou no Kabaneri", "ผีดิบล้วงเหล็ก", "ซากศพปราการเหล็ก"],
    difficulty: "normal",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=ohuMXMuo4pU",
    acceptedAnswers: ["kabaneri of the iron fortress", "koutetsujou no kabaneri", "kabaneri", "ผีดิบล้วงเหล็ก"],
    note: "KABANERI OF THE IRON FORTRESS"
  },
  {
    id: 341,
    title: "Masamune-kun no Revenge (OP1)",
    altTitles: ["Masamune-kun no Revenge", "การแก้แค้นของมาซามุเนะคุง"],
    difficulty: "normal",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=KC-Z7PxheP0",
    acceptedAnswers: ["masamune-kun's revenge", "masamune-kun no revenge", "masamune-kun", "การแก้แค้นของมาซามุเนะคุง"],
    note: "Wagamama MIRROR HEART"
  },
  {
    id: 342,
    title: "Masamune-kun's Revenge R (OP1)",
    altTitles: ["การแก้แค้นของมาซามุเนะคุง ภาค 2"],
    difficulty: "normal",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=dIQnjNzA7ec&list=RDdIQnjNzA7ec&start_radio=1",
    acceptedAnswers: ["masamune-kun's revenge", "masamune-kun no revenge", "masamune-kun", "การแก้แค้นของมาซามุเนะคุง"],
    note: "Please, please!"
  },
  {
    id: 343,
    title: "Another (OP1)",
    altTitles: ["อนาเธอร์"],
    difficulty: "normal",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=O7yhjJGxTyY&list=RDO7yhjJGxTyY&start_radio=1",
    acceptedAnswers: ["another", "อนาเธอร์"],
    note: "Kyoumu Densen"
  },
  {
    id: 344,
    title: "Strike the Blood (OP1)",
    altTitles: ["สายเลือดแท้ที่สี่"],
    difficulty: "normal",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=gC68s6hlHwM&list=RDgC68s6hlHwM&start_radio=1",
    acceptedAnswers: ["strike the blood", "สายเลือดแท้ที่สี่ ", "สไตรค์เดอะบลัด"],
    note: "Strike the Blood"
  },
  {
    id: 345,
    title: "Strike the Blood (OP2)",
    altTitles: ["สายเลือดแท้ที่สี่"],
    difficulty: "normal",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=rfZL61nGIOs&list=RDrfZL61nGIOs&start_radio=1",
    acceptedAnswers: ["strike the blood", "สายเลือดแท้ที่สี่ ", "สไตรค์เดอะบลัด"],
    note: "Fight 4 Real"
  },
  {
    id: 346,
    title: "Accel World (OP1)",
    altTitles: ["แอกเซลเวิลด์"],
    difficulty: "normal",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=uTErr5pGmZc&list=RDuTErr5pGmZc&start_radio=1",
    acceptedAnswers: ["accel world", "แอกเซลเวิลด์"],
    note: "Chase the world"
  },
  {
    id: 347,
    title: "Accel World (OP2)",
    altTitles: ["แอกเซลเวิลด์"],
    difficulty: "normal",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=5ZF6pdS5Wmo&list=RD5ZF6pdS5Wmo&start_radio=1",
    acceptedAnswers: ["accel world", "แอกเซลเวิลด์"],
    note: "Burst The Gravity"
  },
  {
    id: 348,
    title: "The World God Only Knows (OP1)",
    altTitles: ["Kami nomi zo Shiru Sekai", "เซียนเกมรักขอเป็นเทพนักจีบ"],
    difficulty: "normal",
    year: 2010,
    youtubeVideoId: "https://www.youtube.com/watch?v=8muiDhiRb_M&list=RD8muiDhiRb_M&start_radio=1",
    acceptedAnswers: ["the world god only knows", "kami nomi zo shiru sekai", "เซียนเกมรักขอเป็นเทพนักจีบ"],
    note: "God only knows"
  },
  {
    id: 349,
    title: "The World God Only Knows II (OP1)",
    altTitles: ["เซียนเกมรักขอเป็นเทพนักจีบ ภาค 2"],
    difficulty: "normal",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=VMb2ikp5sSU&list=RDVMb2ikp5sSU&start_radio=1",
    acceptedAnswers: ["the world god only knows", "kami nomi zo shiru sekai", "เซียนเกมรักขอเป็นเทพนักจีบ"],
    note: "A Whole New World God Only Knows"
  },
  {
    id: 350,
    title: "The World God Only Knows: Goddesses (OP1)",
    altTitles: ["เซียนเกมรักขอเป็นเทพนักจีบ ภาค 3"],
    difficulty: "normal",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=dofEriT1hx8&list=RDdofEriT1hx8&start_radio=1",
    acceptedAnswers: ["the world god only knows", "kami nomi zo shiru sekai", "เซียนเกมรักขอเป็นเทพนักจีบ"],
    note: "Secrets of the Goddess"
  },
  {
    id: 351,
    title: "GATE (OP1)",
    altTitles: ["Gate: Jieitai Kanochi nite, Kaku Tatakaeri", "เกท หน่วยรบตะลุยโลกต่างมิติ"],
    difficulty: "normal",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=O3kiz2NnpR4&list=RDO3kiz2NnpR4&start_radio=1",
    acceptedAnswers: ["gate", "เกท", "เกท หน่วยรบตะลุยโลกต่างมิติ"],
    note: "GATE~Sore wa Akatsuki no You ni"
  },
  {
    id: 352,
    title: "GATE (OP2)",
    altTitles: ["เกท หน่วยรบตะลุยโลกต่างมิติ ภาค 2"],
    difficulty: "normal",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=46cNW3m4gHg&list=RD46cNW3m4gHg&start_radio=1",
    acceptedAnswers: ["gate", "เกท", "เกท หน่วยรบตะลุยโลกต่างมิติ"],
    note: "GATE II~Sekai wo Koete"
  },
  {
    id: 353,
    title: "Himouto! Umaru-chan (OP1)",
    altTitles: ["ตัวแสบแอบเกรียน อุมารุจัง"],
    difficulty: "easy",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=b6-2P8RgT0A&list=RDb6-2P8RgT0A&start_radio=1",
    acceptedAnswers: ["himouto! umaru-chan", "umaru-chan", "umaru chan", "ตัวแสบแอบเกรียน อุมารุจัง", "อุมารุ"],
    note: "Kakushinteki☆Metamaruphose!"
  },
  {
    id: 354,
    title: "Himouto! Umaru-chan R (OP1)",
    altTitles: ["ตัวแสบแอบเกรียน อุมารุจัง ภาค 2"],
    difficulty: "easy",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=TyMx4pu7kA0&list=RDTyMx4pu7kA0&start_radio=1",
    acceptedAnswers: ["himouto! umaru-chan", "umaru-chan", "umaru chan", "ตัวแสบแอบเกรียน อุมารุจัง", "อุมารุ"],
    note: "Nimensei☆Uraomote Life!"
  },
  {
    id: 355,
    title: "Arifureta: From Commonplace to World's Strongest (OP1)",
    altTitles: ["อาชีพกระจอกแล้วทำไม ยังไงข้าก็เทพ"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=eZN3afhTyGY&list=RDeZN3afhTyGY&start_radio=1",
    acceptedAnswers: ["arifureta", "อาชีพกระจอกแล้วทำไม ยังไงข้าก็เทพ", "อาชีพกระจอก"],
    note: "FLARE"
  },
  {
    id: 356,
    title: "Arifureta: From Commonplace to World's Strongest Season 2 (OP1)",
    altTitles: ["อาชีพกระจอกแล้วทำไม ยังไงข้าก็เทพ ภาค 2"],
    difficulty: "normal",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=I_zgieQd2xI&list=RDI_zgieQd2xI&start_radio=1",
    acceptedAnswers: ["arifureta", "อาชีพกระจอกแล้วทำไม ยังไงข้าก็เทพ", "อาชีพกระจอก"],
    note: "Daylight"
  },
  {
    id: 357,
    title: "DanMachi (OP1)",
    altTitles: ["DanMachi", "มันผิดรึไงถ้าใจอยากจะพบรักในดันเจี้ยน"],
    difficulty: "normal",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=0H_RCGEcjhs&list=RD0H_RCGEcjhs&start_radio=1",
    acceptedAnswers: ["danmachi", "is it wrong to try to pick up girls in a dungeon", "มันผิดรึไงถ้าใจอยากจะพบรักในดันเจี้ยน", "ดันまち"],
    note: "Hey World"
  },
  {
    id: 358,
    title: "DanMachi 2nd Season (OP1)",
    altTitles: ["DanMachi Season 2", "มันผิดรึไงถ้าใจอยากจะพบรักในดันเจี้ยน ภาค 2"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=hqtT8fpdOQc",
    acceptedAnswers: ["danmachi", "is it wrong to try to pick up girls in a dungeon", "มันผิดรึไงถ้าใจอยากจะพบรักในดันเจี้ยน"],
    note: "HELLO to DREAM"
  },
  {
    id: 359,
    title: "Owari no Seraph (OP1)",
    altTitles: ["Owari no Seraph", "เทวทูตแห่งโลกมืด"],
    difficulty: "normal",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=aNgT6MxOURQ&list=RDaNgT6MxOURQ&start_radio=1",
    acceptedAnswers: ["owari no seraph", "seraph of the end", "เทวทูตแห่งโลกมืด"],
    note: "X.U."
  },
  {
    id: 360,
    title: "Owari no Seraph (OP1)",
    altTitles: ["Owari no Seraph Season 2", "เทวทูตแห่งโลกมืด ภาค 2"],
    difficulty: "normal",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=NvJ3HzW-edM&list=RDNvJ3HzW-edM&start_radio=1",
    acceptedAnswers: ["owari no seraph", "seraph of the end", "เทวทูตแห่งโลกมืด"],
    note: "Two souls -toward the truth-"
  },
  {
    id: 361,
    title: "Oda Nobuna no Yabou (OP1)",
    altTitles: ["Oda Nobuna no Yabou", "จอมนางอหังการ โอดะ โนบุนะ"],
    difficulty: "hard",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=po7TSigFl7U&list=RDpo7TSigFl7U&start_radio=1",
    acceptedAnswers: ["oda nobuna no yabou", "odanobunaga", "the ambition of oda nobuna", "จอมนางอหังการ โอดะ โนบุนะ"],
    note: "Link"
  },
  {
    id: 362,
    title: "Assassins Pride (OP1)",
    altTitles: ["แอสแซสซินส์ ไพรด์"],
    difficulty: "hard",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=5aytFmOSWAg&list=RD5aytFmOSWAg&start_radio=1",
    acceptedAnswers: ["assassins pride", "แอสแซสซินส์ ไพรด์"],
    note: "Share the light"
  },
  {
    id: 363,
    title: "High School Fleet (OP1)",
    altTitles: ["Haifuri", "เรือรบโมเอะ"],
    difficulty: "hard",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=Lc08QxI_9q8&list=RDLc08QxI_9q8&start_radio=1",
    acceptedAnswers: ["high school fleet", "hight fleet", "haifuri"],
    note: "High Free Spirits"
  },
  {
    id: 364,
    title: "Kantai Collection: KanColle (OP1)",
    altTitles: ["ป่วยเรือ", "คันไตคอลเลกชัน"],
    difficulty: "normal",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=Z3Gmv4_HkN4&list=RDZ3Gmv4_HkN4&start_radio=1",
    acceptedAnswers: ["kantai collection", "kancolle", "คันไตคอลเลกชัน"],
    note: "Miiro"
  },
  {
    id: 365,
    title: "Choujin Koukousei-tachi wa Isekai demo Yoyuu de Ikinuku you desu! (OP1)",
    altTitles: ["Choujin Koukousei-tachi wa Isekai demo Yoyuu de Ikinuku you desu!", "เจ็ดเทพม.ปลายกับการใช้ชีวิตสบายๆในต่างโลก"],
    difficulty: "hard",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=m_i07FunXAw&list=RDm_i07FunXAw&start_radio=1",
    acceptedAnswers: ["choyoyu", "high school prodigies have it easy even in another world", "เจ็ดเทพม.ปลายกับการใช้ชีวิตสบายๆในต่างโลก"],
    note: "Hajimete no Kakumei!"
  },
  {
    id: 366,
    title: "Densetsu no Yuusha no Densetsu (OP1)",
    altTitles: ["Densetsu no Yuusha no Densetsu", "ตำนานผู้กล้าในตำนาน"],
    difficulty: "hard",
    year: 2010,
    youtubeVideoId: "https://www.youtube.com/watch?v=_E2XXe3esgE&list=RD_E2XXe3esgE&start_radio=1",
    acceptedAnswers: ["the legend of the legendary heroes", "densetsu no yuusha no densetsu", "ตำนานผู้กล้าในตำนาน"],
    note: "LAMENT~Yagate Yorokobi wo"
  },
  {
    id: 367,
    title: "Murenase! Seton Gakuen (OP1)",
    altTitles: ["Murenase! Seton Gakuen", "มุเรนาเสะ! เซตง กาคุเอน"],
    difficulty: "hard",
    year: 2020,
    youtubeVideoId: "https://www.youtube.com/watch?v=StYO-r2kW5U",
    acceptedAnswers: ["murenase seton", "murenase! seton gakuen", "seton academy"],
    note: "Gakuen Kyouka Zou"
  },
  {
    id: 368,
    title: "Maou Gakuin no Futekigousha (OP1)",
    altTitles: ["Maou Gakuin no Futekigousha", "ใครว่าข้าไม่เหมาะเป็นจอมมาร"],
    difficulty: "normal",
    year: 2020,
    youtubeVideoId: "https://www.youtube.com/watch?v=e0ETl3KSi4A&list=RDe0ETl3KSi4A&start_radio=1",
    acceptedAnswers: ["maou gakuin no futekigousha", "the misfit of demon king academy", "ใครว่าข้าไม่เหมาะเป็นจอมมาร"],
    note: "Seikai Fusaikai"
  },
  {
    id: 369,
    title: "Uzaki-chan wa Asobitai! (OP1)",
    altTitles: ["Uzaki-chan wa Asobitai!", "รุ่นน้องตัวป่วนอยากชวนเที่ยวเล่น"],
    difficulty: "normal",
    year: 2020,
    youtubeVideoId: "https://www.youtube.com/watch?v=U3JVomxH8Xo&list=RDU3JVomxH8Xo&start_radio=1",
    acceptedAnswers: ["uzaki-chan wa asobitai!", "uzakizan", "uzaki-chan", "รุ่นน้องตัวป่วนอยากชวนเที่ยวเล่น"],
    note: "Nadamesukashi Negotiation"
  },
  {
    id: 370,
    title: "Tonikaku Kawaii (OP1)",
    altTitles: ["Tonikaku Kawaii", "จะยังไงภรรยาของผมก็น่ารัก"],
    difficulty: "easy",
    year: 2020,
    youtubeVideoId: "https://www.youtube.com/watch?v=Q5KSkw1KgvQ&list=RDQ5KSkw1KgvQ&start_radio=1",
    acceptedAnswers: ["tonikaku kawaii", "tonokaku kawaii", "tonikawa", "จะยังไงภรรยาของผมก็น่ารัก"],
    note: "Koi no Uta"
  },
  {
    id: 371,
    title: "Seven Knights Revolution: Hero Successor (OP1)",
    altTitles: ["เซเว่นไนท์"],
    difficulty: "hard",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=PkPhA3ZH3JI&list=RDPkPhA3ZH3JI&start_radio=1",
    acceptedAnswers: ["seven knights revolution", "seven knight revolution", "เซเว่นไนท์"],
    note: "Freeze"
  },
  {
    id: 372,
    title: "Kumo desu ga, Nani ka? (OP1)",
    altTitles: ["Kumo desu ga, Nani ka?", "แมงมุมแล้วไง ข้องใจเหรอคะ"],
    difficulty: "normal",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=PoyCokxjkdo&list=RDPoyCokxjkdo&start_radio=1",
    acceptedAnswers: ["kumo desu ga nani ka", "so i'm a spider, so what", "แมงมุมแล้วไง ข้องใจเหรอคะ", "น้องแมงมุม"],
    note: "keep weaving your spider way"
  },
  {
    id: 373,
    title: "Kaifuku Jutsushi no Yarinaoshi (OP1)",
    altTitles: ["Kaifuku Jutsushi no Yarinaoshi", "การล้างแค้นของผู้กล้าสายฮีล"],
    difficulty: "normal",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=NOHKYZdDO7g&list=RDNOHKYZdDO7g&start_radio=1",
    acceptedAnswers: ["kaifuku jutsushi no yarinaoshi", "redo of healer", "ผู้กล้าฮีล", "การล้างแค้นของผู้กล้าสายฮีล"],
    note: "Zankoku na Yume to Nemure"
  },
  {
    id: 374,
    title: "Genjitsu Shugi Yuusha no Oukoku Saikenki (OP1)",
    altTitles: ["Genjitsu Shugi Yuusha no Oukoku Saikenki", "ยุทธศาสตร์กู้ชาติของราชามือใหม่"],
    difficulty: "normal",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=lfcI0RuWBd8&list=RDlfcI0RuWBd8&start_radio=1",
    acceptedAnswers: ["genjitsu shugi yuusha no oukoku saikenki", "how a realist hero rebuilt the kingdom", "ยุทธศาสตร์กู้ชาติของราชามือใหม่"],
    note: "HELLO HORIZON"
  },
  {
    id: 375,
    title: "Tsuki ga Michibiku Isekai Douchuu (OP1)",
    altTitles: ["Tsuki ga Michibiku Isekai Douchuu", "จันทรานำพาสู่ต่างโลก"],
    difficulty: "normal",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=DFRd0Qru6t8&list=RDDFRd0Qru6t8&start_radio=1",
    acceptedAnswers: ["tsukimichi", "tsuki ga michibiku isekai douchuu", "tsuki ga michibikuisekai", "จันทรานำพาสู่ต่างโลก"],
    note: "GENSOU"
  },
  {
    id: 376,
    title: "Sekai Saikou no Ansatsusha (OP1)",
    altTitles: ["Sekai Saikou no Ansatsusha", "สุดยอดมือสังหารอวตารมาต่างโลก"],
    difficulty: "normal",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=Qnebg3Ctfzs&list=RDQnebg3Ctfzs&start_radio=1",
    acceptedAnswers: ["sekai saikou no ansatsusha", "the world's finest assassin", "สุดยอดมือสังหารอวตารมาต่างโลก"],
    note: "Dark seeks light"
  },
  {
    id: 377,
    title: "Shikkakumon no Saikyou Kenja (OP1)",
    altTitles: ["Shikkakumon no Saikyou Kenja", "ปราชญ์หนึ่งในใต้หล้ากับตราสุดอัปยศ"],
    difficulty: "hard",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=AV7iWxhk8d8&list=RDAV7iWxhk8d8&start_radio=1",
    acceptedAnswers: ["shikkakumon no saikyou kenja", "shikkakumon", "ปราชญ์หนึ่งในใต้หล้ากับตราสุดอัปยศ"],
    note: "Leap of faith"
  },
  {
    id: 378,
    title: "Tensai Ouji no Akaji Kokka Saisei Jutsu (OP1)",
    altTitles: ["Tensai Ouji no Akaji Kokka Saisei Jutsu", "การกอบกู้ประเทศชาติของเจ้าชายสายอู้"],
    difficulty: "hard",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=QLJv2n54-qo&list=RDQLJv2n54-qo&start_radio=1",
    acceptedAnswers: ["tensai ouji no akaiji kokka saisei jutsu", "tensai ouji", "การกอบกู้ประเทศชาติของเจ้าชายสายอู้"],
    note: "Tensai ga Hajimaru"
  },
  {
    id: 379,
    title: "Aharen-san wa Hakarenai (OP1)",
    altTitles: ["คุณอาฮาเรน ปะกะทะไม่ได้"],
    difficulty: "normal",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=a6WTDZQrbeE&list=RDa6WTDZQrbeE&start_radio=1",
    acceptedAnswers: ["aharen-san wa hakarenai", "aharensan", "คุณอาฮาเรน ปะกะทะไม่ได้", "คุณอาฮาเรน"],
    note: "Hanarenai Kyori"
  },
  {
    id: 380,
    title: "Yuusha, Yamemasu (OP1)",
    altTitles: ["Yuusha, Yamemasu", "เลิกแล้วครับ เลิกเป็นผู้กล้าแล้วครับ"],
    difficulty: "normal",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=hJt8cctjXr0&list=RDhJt8cctjXr0&start_radio=1",
    acceptedAnswers: ["yuusha, yamemasu", "yuusha yamemasu", "i'm quitting heroing", "เลิกแล้วครับ เลิกเป็นผู้กล้าแล้วครับ"],
    note: "Broken Identity"
  },
  {
    id: 381,
    title: "Strike the Blood S2 (OP1)",
    altTitles: ["สายเลือดแท้ผู้ที่สี่ ภาค 2"],
    difficulty: "normal",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=gC68s6hlHwM&list=RDgC68s6hlHwM&start_radio=1",
    acceptedAnswers: ["strike the blood", "strike the blood ii", "strike the blood 2", "สายเลือดแท้ผู้ที่สี่", "สไตรค์เดอะบลัด"],
    note: "Blood on the EDGE"
  },
  {
    id: 382,
    title: "Strike the Blood S3 (OP1)",
    altTitles: ["สายเลือดแท้ผู้ที่สี่ ภาค 3"],
    difficulty: "hard",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=L5-C-GN4JCU&list=RDL5-C-GN4JCU&start_radio=1",
    acceptedAnswers: ["strike the blood", "strike the blood iii", "strike the blood 3", "สายเลือดแท้ผู้ที่สี่", "สไตรค์เดอะบลัด"],
    note: "Blood and Emotions"
  },
  {
    id: 383,
    title: "Strike the Blood S4 (OP1)",
    altTitles: ["สายเลือดแท้ที่สี่ ภาค 4"],
    difficulty: "hard",
    year: 2020,
    youtubeVideoId: "https://www.youtube.com/watch?v=rjzC2BiY2WM&list=RDrjzC2BiY2WM&start_radio=1",
    acceptedAnswers: ["strike the blood", "strike the blood iv", "strike the blood 4", "สายเลือดแท้ที่สี่", "สไตรค์เดอะบลัด"],
    note: "Akatsuki no Kaleido Blood"
  },
  {
    id: 384,
    title: "Strike the Blood Final (OP1)",
    altTitles: ["สายเลือดแท้ที่สี่ ภาคไฟนอล"],
    difficulty: "hard",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=rjzC2BiY2WM&list=RDrjzC2BiY2WM&start_radio=1",
    acceptedAnswers: ["strike the blood", "strike the blood final", "สายเลือดแท้ที่สี่", "สไตรค์เดอะบลัด"],
    note: "Bloodlines"
  },
  {
    id: 385,
    title: "Girls & Panzer dasfinal (OP1)",
    altTitles: ["สาวปิ๊ง! ซิ่งแทงค์ ดาส ไฟนาเล่"],
    difficulty: "hard",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=XpIKBdEnnFw&list=RDXpIKBdEnnFw&start_radio=1",
    acceptedAnswers: ["girls und panzer", "girls und panzer das finale", "สาวปิ๊ง! ซิ่งแทงค์"],
    note: "DreamRiser"
  },
  {
    id: 386,
    title: "Girls & Panzer dasfinal part 4 (OP1)",
    altTitles: ["สาวปิ๊ง! ซิ่งแทงค์ ดาส ไฟนาเล่ พาร์ท 4"],
    difficulty: "hard",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=m_CtkK6yZ9A&list=RDm_CtkK6yZ9A&start_radio=1",
    acceptedAnswers: ["girls und panzer", "girls und panzer das finale", "สาวปิ๊ง! ซิ่งแทงค์"],
    note: "Never Say Goodbye"
  },
  {
    id: 387,
    title: "Cardfight!! Vanguard: Link Joker (OP1)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด ลิงก์โจ๊กเกอร์"],
    difficulty: "normal",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=7U9RpdfG0MQ&list=RD7U9RpdfG0MQ&start_radio=1",
    acceptedAnswers: ["cardfight vanguard", "vanguard", "แวนการ์ด", "การ์ดไฟท์ แวนการ์ด"],
    note: "Vanguard Fight"
  },
  {
    id: 388,
    title: "Cardfight!! Vanguard: Link Joker (OP2)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด ลิงก์โจ๊กเกอร์"],
    difficulty: "normal",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=rmLsl_LAUSU",
    acceptedAnswers: ["cardfight vanguard", "vanguard", "แวนการ์ด", "การ์ดไฟท์ แวนการ์ด"],
    note: "Mugen∞REBIRTH"
  },
  {
    id: 389,
    title: "Cardfight!! Vanguard: Link Joker (OP3)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด ลิงก์โจ๊กเกอร์"],
    difficulty: "normal",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=Suc4KveAXuU&list=RDSuc4KveAXuU&start_radio=1",
    acceptedAnswers: ["cardfight vanguard", "vanguard", "แวนการ์ด", "การ์ดไฟท์ แวนการ์ด"],
    note: "Break your spell"
  },
  {
    id: 390,
    title: "Cardfight!! Vanguard: Legion Mate (OP1)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด ลีเจียนเมต"],
    difficulty: "hard",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=hWzJD2FKNXo&list=RDhWzJD2FKNXo&start_radio=1",
    acceptedAnswers: ["cardfight vanguard", "vanguard", "แวนการ์ด", "การ์ดไฟท์ แวนการ์ด"],
    note: "V-ROAD"
  },
  {
    id: 391,
    title: "Cardfight!! Vanguard: Legion Mate (OP2)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด ลีเจียนเมต"],
    difficulty: "hard",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=XKyMzZFq2y0&list=RDXKyMzZFq2y0&start_radio=1",
    acceptedAnswers: ["cardfight vanguard", "vanguard", "แวนการ์ด", "การ์ดไฟท์ แวนการ์ด"],
    note: "KNOCK ON YOUR GATE!"
  },
  {
    id: 392,
    title: "Cardfight!! Vanguard G (OP1)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด G"],
    difficulty: "normal",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=v5Ul5c217co&list=RDv5Ul5c217co&start_radio=1",
    acceptedAnswers: ["cardfight vanguard", "vanguard g", "vanguard", "แวนการ์ด", "แวนการ์ด g"],
    note: "BREAK IT!"
  },
  {
    id: 393,
    title: "Cardfight!! Vanguard G (OP2)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด G"],
    difficulty: "normal",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=OXN_UowN5TI&list=RDOXN_UowN5TI&start_radio=1",
    acceptedAnswers: ["cardfight vanguard", "vanguard g", "vanguard", "แวนการ์ด", "แวนการ์ด g"],
    note: "Generation!"
  },
  {
    id: 394,
    title: "Cardfight Vanguard G: GIRS Crisis (OP1)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด G กีอัสไครซิส"],
    difficulty: "hard",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=VU5bUGbZC-A&list=RDVU5bUGbZC-A&start_radio=1",
    acceptedAnswers: ["cardfight vanguard", "vanguard g", "vanguard", "แวนการ์ด", "แวนการ์ด g"],
    note: "YAIBA"
  },
  {
    id: 395,
    title: "Cardfight Vanguard G: Stride Gate (OP1)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด G สไตรด์เกต"],
    difficulty: "hard",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=qgYlXoYGSlg&list=RDqgYlXoYGSlg&start_radio=1",
    acceptedAnswers: ["cardfight vanguard", "vanguard g", "vanguard", "แวนการ์ด", "แวนการ์ด g"],
    note: "SHOUT!"
  },
  {
    id: 396,
    title: "Cardfight!! Vanguard (2018) (OP1)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด (2018)"],
    difficulty: "normal",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=394c8CxfUG8&list=RD394c8CxfUG8&start_radio=1",
    acceptedAnswers: ["cardfight vanguard", "vanguard", "แวนการ์ด", "การ์ดไฟท์ แวนการ์ด"],
    note: "Legendary"
  },
  {
    id: 397,
    title: "Cardfight!! Vanguard (2018) (OP2)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด (2018)"],
    difficulty: "normal",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=aOEalrB6Acg&list=RDaOEalrB6Acg&start_radio=1",
    acceptedAnswers: ["cardfight vanguard", "vanguard", "แวนการ์ด", "การ์ดไฟท์ แวนการ์ด"],
    note: "Destiny Calls"
  },
  {
    id: 398,
    title: "Cardfight Vanguard: Shinemon Arc (OP1)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด ภาคชินเอมอน"],
    difficulty: "hard",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=IN3WbkPc-gw&list=RDIN3WbkPc-gw&start_radio=1",
    acceptedAnswers: ["cardfight vanguard", "vanguard", "แวนการ์ด", "การ์ดไฟท์ แวนการ์ด"],
    note: "Lead the way"
  },
  {
    id: 399,
    title: "Cardfight!! Vanguard overDress (OP1)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด โอเวอร์เดรส"],
    difficulty: "normal",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=uiUEPt9d_i8&list=RDuiUEPt9d_i8&start_radio=1",
    acceptedAnswers: ["cardfight vanguard overdress", "vanguard overdress", "vanguard", "แวนการ์ด", "แวนการ์ด โอเวอร์เดรส"],
    note: "ZEAL of proud"
  },
  {
    id: 400,
    title: "Cardfight!! Vanguard overDress (OP2)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด โอเวอร์เดรส"],
    difficulty: "normal",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=IX3z25ira2I&list=RDIX3z25ira2I&start_radio=1",
    acceptedAnswers: ["cardfight vanguard overdress", "vanguard overdress", "vanguard", "แวนการ์ด", "แวนการ์ด โอเวอร์เดรส"],
    note: "START"
  },
  {
    id: 401,
    title: "Cardfight!! Vanguard will+Dress (OP1)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด วิลเดรส"],
    difficulty: "normal",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=ucRbGZf8J9g&list=RDucRbGZf8J9g&start_radio=1",
    acceptedAnswers: ["cardfight vanguard will+dress", "vanguard will dress", "vanguard", "แวนการ์ด", "แวนการ์ด วิลเดรส"],
    note: "Black&White"
  },
  {
    id: 402,
    title: "Cardfight!! Vanguard will+Dress (OP2)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด วิลเดรส ภาค 2"],
    difficulty: "normal",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=WPzPgFHjNfw&list=RDWPzPgFHjNfw&start_radio=1",
    acceptedAnswers: ["cardfight vanguard will+dress", "vanguard will dress", "vanguard", "แวนการ์ด", "แวนการ์ด วิลเดรส"],
    note: "Accelerate"
  },
  {
    id: 403,
    title: "Cardfight Vanguard Divinez (OP1)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด ดีไวน์ซ"],
    difficulty: "normal",
    year: 2024,
    youtubeVideoId: "https://www.youtube.com/watch?v=U9GBBSI_ssE&list=RDU9GBBSI_ssE&start_radio=1",
    acceptedAnswers: ["cardfight vanguard divinez", "vanguard divinez", "vanguard", "แวนการ์ด", "แวนการ์ด ดีไวน์ซ"],
    note: "Kirisame"
  },
  {
    id: 404,
    title: "Attack on Titan Season 1 (OP2)",
    altTitles: ["ผ่าพิภพไททัน"],
    difficulty: "normal",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=HsC9Ul1wdF0",
    acceptedAnswers: ["attack on titan", "shingeki no kyojin", "ผ่าพิภพไททัน"],
    note: "Jiyuu no Tsubasa"
  },
  {
    id: 405,
    title: "Attack on Titan Season 3 Part 2 (OP1)",
    altTitles: ["ผ่าพิภพไททัน ภาค 3 พาร์ท 2"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=jhYg5NrN-r8&list=RDjhYg5NrN-r8&start_radio=1",
    acceptedAnswers: ["attack on titan", "shingeki no kyojin", "ผ่าพิภพไททัน"],
    note: "Shoukei to Shikabane no Michi"
  },
  {
    id: 406,
    title: "Attack on Titan The Final Season Part 2 (ED1)",
    altTitles: ["ผ่าพิภพไททัน ไฟนอลซีซั่น พาร์ท 2"],
    difficulty: "easy",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=j_tkN27cYGM&list=RDj_tkN27cYGM&start_radio=1",
    acceptedAnswers: ["attack on titan", "shingeki no kyojin", "ผ่าพิภพไททัน"],
    note: "Akuma no Ko (เด็กปีศาจ)"
  },
  {
    id: 407,
    title: "Sword Art Online (OP2)",
    altTitles: ["ซอร์ดอาร์ตออนไลน์"],
    difficulty: "normal",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=O8T2u83GIiI&list=RDO8T2u83GIiI&start_radio=1",
    acceptedAnswers: ["sword art online", "sao", "ซอร์ดอาร์ตออนไลน์"],
    note: "Innocence"
  },
  {
    id: 408,
    title: "Sword Art Online: Alicization - War of Underworld (OP1)",
    altTitles: ["ซอร์ดอาร์ตออนไลน์ อลิซิเซชั่น วอร์ออฟอันเดอร์เวิลด์"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=CR3O2SFa3Qg&list=RDCR3O2SFa3Qg&start_radio=1",
    acceptedAnswers: ["sword art online", "sao", "ซอร์ดอาร์ตออนไลน์"],
    note: "Resolution"
  },
  {
    id: 409,
    title: "Demon Slayer: Mugen Train Arc (ED1)",
    altTitles: ["ดาบพิฆาตอสูร ภาคศึกรถไฟสู่นิรันดร์"],
    difficulty: "easy",
    year: 2020,
    youtubeVideoId: "https://www.youtube.com/watch?v=jwriFosLRww&list=RDjwriFosLRww&start_radio=1",
    acceptedAnswers: ["demon slayer", "kimetsu no yaiba", "ดาบพิฆาตอสูร"],
    note: "Homura"
  },
  {
    id: 410,
    title: "Demon Slayer: Hashira Training Arc (OP1)",
    altTitles: ["ดาบพิฆาตอสูร ภาคการสั่งสอนของเสาหลัก"],
    difficulty: "easy",
    year: 2024,
    youtubeVideoId: "https://www.youtube.com/watch?v=V3c7dwdQHeY&list=RDV3c7dwdQHeY&start_radio=1",
    acceptedAnswers: ["demon slayer", "kimetsu no yaiba", "ดาบพิฆาตอสูร"],
    note: "Mugen"
  },
  {
    id: 411,
    title: "Jujutsu Kaisen Season 1 (OP2)",
    altTitles: ["มหาเวทย์ผนึกมาร"],
    difficulty: "normal",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=8nW-IPrzM1g",
    acceptedAnswers: ["jujutsu kaisen", "มหาเวทย์ผนึกมาร"],
    note: "VIVID VICE"
  },
  {
    id: 412,
    title: "Jujutsu Kaisen 0 (ED1)",
    altTitles: ["มหาเวทย์ผนึกมาร 0"],
    difficulty: "easy",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=fKbyFEK74_U",
    acceptedAnswers: ["jujutsu kaisen 0", "jujutsu kaisen", "มหาเวทย์ผนึกมาร 0", "มหาเวทย์ผนึกมาร"],
    note: "Ichizu"
  },
  {
    id: 413,
    title: "My Hero Academia Season 4 (OP1)",
    altTitles: ["มายฮีโร่ อคาเดเมีย ภาค 4"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=VtNgeDxYJzE",
    acceptedAnswers: ["my hero academia", "boku no hero academia", "มายฮีโร่ อคาเดเมีย"],
    note: "Polaris"
  },
  {
    id: 414,
    title: "My Hero Academia Season 6 (OP1)",
    altTitles: ["มายฮีโร่ อคาเดเมีย ภาค 6"],
    difficulty: "normal",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=6BrHcmH3Gyk&list=RD6BrHcmH3Gyk&start_radio=1",
    acceptedAnswers: ["my hero academia", "boku no hero academia", "มายฮีโร่ อคาเดเมีย"],
    note: "Bokura no"
  },
  {
    id: 415,
    title: "Tokyo Ghoul:re (OP2)",
    altTitles: ["โตเกียวกูล:รี"],
    difficulty: "hard",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=K55ktT_rxVg&list=RDK55ktT_rxVg&start_radio=1",
    acceptedAnswers: ["tokyo ghoul", "tokyo ghoul re", "โตเกียวกูล", "โตเกียวกูล รี"],
    note: "Katharsis"
  },
  {
    id: 416,
    title: "Fullmetal Alchemist: Brotherhood (OP2)",
    altTitles: ["FMA Brotherhood", "แขนกลคนแปรธาตุ"],
    difficulty: "normal",
    year: 2009,
    youtubeVideoId: "https://www.youtube.com/watch?v=STacGwRRSz0&list=RDSTacGwRRSz0&start_radio=1",
    acceptedAnswers: ["fullmetal alchemist brotherhood", "fma brotherhood", "แขนกลคนแปรธาตุ"],
    note: "Hologram"
  },
  {
    id: 417,
    title: "Fullmetal Alchemist: Brotherhood (OP3)",
    altTitles: ["FMA Brotherhood", "แขนกลคนแปรธาตุ"],
    difficulty: "normal",
    year: 2009,
    youtubeVideoId: "https://www.youtube.com/watch?v=ZJ_5hXQWn4c",
    acceptedAnswers: ["fullmetal alchemist brotherhood", "fma brotherhood", "แขนกลคนแปรธาตุ"],
    note: "Golden Time Lover"
  },
  {
    id: 418,
    title: "JoJo's Bizarre Adventure: Battle Tendency (OP1)",
    altTitles: ["โจโจ้ ภาค 2 กระแสเลือดแห่งการต่อสู้"],
    difficulty: "easy",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=SJkCLcnGB-c&list=RDSJkCLcnGB-c&start_radio=1",
    acceptedAnswers: ["jojo", "โจโจ้", "battle tendency"],
    note: "Bloody Stream"
  },
  {
    id: 419,
    title: "JoJo: Golden Wind (OP2)",
    altTitles: ["โจโจ้ ภาค 5"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=kbjr3JIuOtY&list=RDkbjr3JIuOtY&start_radio=1",
    acceptedAnswers: ["jojo", "golden wind", "โจโจ้"],
    note: "Uragirimono no Requiem"
  },
  {
    id: 420,
    title: "Oshi no Ko Season 2 (ED1)",
    altTitles: ["เกิดใหม่เป็นลูกโอชิ ภาค 2"],
    difficulty: "easy",
    year: 2024,
    youtubeVideoId: "https://www.youtube.com/watch?v=i7TRmojTJT0&list=RDi7TRmojTJT0&start_radio=1",
    acceptedAnswers: ["oshi no ko", "เกิดใหม่เป็นลูกโอชิ", "ลูกโอชิ"],
    note: "Burning"
  },
  {
    id: 421,
    title: "Date A Live Season 5  (OP1)",
    altTitles: ["พิชิตรัก พิทักษ์โลก ภาค 5"],
    difficulty: "normal",
    year: 2024,
    youtubeVideoId: "https://www.youtube.com/watch?v=146v6ZGHOaM&list=RD146v6ZGHOaM&start_radio=1",
    acceptedAnswers: ["date a live", "พิชิตรัก พิทักษ์โลก", "เดทอะไลฟ์"],
    note: "Paradoxes"
  },
  {
    id: 422,
    title: "Naruto: Shippuden (OP16)",
    altTitles: ["นารูโตะ ตำนานวายุสลาตัน"],
    difficulty: "easy",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=zVgKnfN9i34&list=RDzVgKnfN9i34&start_radio=1",
    acceptedAnswers: ["naruto shippuden", "naruto", "นารูโตะ"],
    note: "Silhouette"
  },
  {
    id: 423,
    title: "Naruto: Shippuden (OP6)",
    altTitles: ["นารูโตะ ตำนานวายุสลาตัน"],
    difficulty: "easy",
    year: 2009,
    youtubeVideoId: "https://www.youtube.com/watch?v=97dkzVU4p-M&list=RD97dkzVU4p-M&start_radio=1",
    acceptedAnswers: ["naruto shippuden", "naruto", "นารูโตะ"],
    note: "Sign"
  },
  {
    id: 424,
    title: "Bleach (OP2)",
    altTitles: ["บลีช เทพมรณะ"],
    difficulty: "normal",
    year: 2005,
    youtubeVideoId: "https://www.youtube.com/watch?v=92TEcszkRBw&list=RD92TEcszkRBw&start_radio=1",
    acceptedAnswers: ["bleach", "บลีช", "บลีช เทพมรณะ"],
    note: "D-tecnoLife"
  },
  {
    id: 425,
    title: "Bleach (OP13)",
    altTitles: ["บลีช เทพมรณะ"],
    difficulty: "easy",
    year: 2010,
    youtubeVideoId: "https://www.youtube.com/watch?v=fXuOaxrXYqw&list=RDfXuOaxrXYqw&start_radio=1",
    acceptedAnswers: ["bleach", "บลีช", "บลีช เทพมรณะ"],
    note: "Ranbu no Melody"
  },
  {
    id: 426,
    title: "One Piece (OP20)",
    altTitles: ["วันพีซ"],
    difficulty: "easy",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=Oo52vQyAR6w&list=RDOo52vQyAR6w&start_radio=1",
    acceptedAnswers: ["one piece", "วันพีซ"],
    note: "Hope"
  },
  {
    id: 427,
    title: "One Piece Film: Red (OP1)",
    altTitles: ["วันพีซ ฟิล์ม เรด"],
    difficulty: "easy",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=rB1c1pjFbWA",
    acceptedAnswers: ["one piece", "one piece film red", "วันพีซ"],
    note: "New Genesis"
  },
  {
    id: 428,
    title: "Gintama (OP13)",
    altTitles: ["กินทามะ"],
    difficulty: "normal",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=aUjBktJz1ZE&list=RDaUjBktJz1ZE&start_radio=1",
    acceptedAnswers: ["gintama", "กินทามะ"],
    note: "Sakura Mitsutsuki"
  },
  {
    id: 429,
    title: "Gintama (ED17)",
    altTitles: ["กินทามะ"],
    difficulty: "easy",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=2FNnbxQKgTg&list=RD2FNnbxQKgTg&start_radio=1",
    acceptedAnswers: ["gintama", "กินทามะ"],
    note: "Samurai Heart (Some Like It Hot!!)"
  },
  {
    id: 430,
    title: "Black Clover (OP13)",
    altTitles: ["แบล็คโคลเวอร์"],
    difficulty: "normal",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=H0ubZknSVMI&list=RDH0ubZknSVMI&start_radio=1",
    acceptedAnswers: ["black clover", "แบล็คโคลเวอร์"],
    note: "Grandeur"
  },
  {
    id: 431,
    title: "Tensei shitara slime datta ken Season 2 (OP1)",
    altTitles: ["เกิดใหม่ทั้งทีก็เป็นสไลม์ไปซะแล้ว ภาค 2"],
    difficulty: "normal",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=jknXRLtbWNc&list=RDjknXRLtbWNc&start_radio=1",
    acceptedAnswers: ["that time i got reincarnated as a slime", "tensura", "เกิดใหม่ทั้งทีก็เป็นสไลม์ไปซะแล้ว", "สไลม์"],
    note: "Storyteller"
  },
  {
    id: 432,
    title: "Cardfight Vanguard G: NEXT (OP1)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด G NEXT"],
    difficulty: "normal",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=niIWLIPopbk&list=RDniIWLIPopbk&start_radio=1",
    acceptedAnswers: ["cardfight vanguard", "vanguard g next", "vanguard", "แวนการ์ด", "แวนการ์ด g"],
    note: "Hello, Mr. Wonder land"
  },
  {
    id: 433,
    title: "Cardfight Vanguard G Z (OP1)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด G Z"],
    difficulty: "hard",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=VDOEvRCvR1U",
    acceptedAnswers: ["cardfight vanguard", "vanguard g z", "vanguard", "แวนการ์ด", "แวนการ์ด g"],
    note: "Jonetsu no Auto Score"
  },
  {
    id: 434,
    title: "Cardfight Vanguard will+Dress Season 3 (OP1)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด วิลเดรส ภาค 3"],
    difficulty: "normal",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=4BwrHsYmRms&list=RD4BwrHsYmRms&start_radio=1",
    acceptedAnswers: ["cardfight vanguard will+dress", "vanguard will dress", "vanguard", "แวนการ์ด", "แวนการ์ด วิลเดรส"],
    note: "The last resort"
  },
  {
    id: 435,
    title: "Cardfight Vanguard Divinez Season 2 (OP1)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด ดีไวน์ซ ภาค 2"],
    difficulty: "normal",
    year: 2024,
    youtubeVideoId: "https://www.youtube.com/watch?v=UzHqDnQvSxQ&list=RDUzHqDnQvSxQ&start_radio=1",
    acceptedAnswers: ["cardfight vanguard divinez", "vanguard divinez", "vanguard", "แวนการ์ด", "แวนการ์ด ดีไวน์ซ"],
    note: "Shukumei"
  },
  {
    id: 436,
    title: "DAN DA DAN (OP1)",
    altTitles: ["Dan Da Dan", "ดันดาดัน"],
    difficulty: "easy",
    year: 2024,
    youtubeVideoId: "https://www.youtube.com/watch?v=a4na2opArGY&list=RDa4na2opArGY&start_radio=1",
    acceptedAnswers: ["dandadan", "dan da dan", "ดันดาดัน"],
    note: "Otonoke (オトノケ)"
  },
  {
    id: 437,
    title: "DAN DA DAN Season 2 (OP1)",
    altTitles: ["Dan Da Dan Season 2", "ดันดาดัน ภาค 2"],
    difficulty: "normal",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=DCCRNzKvWRg&list=RDDCCRNzKvWRg&start_radio=1",
    acceptedAnswers: ["dandadan", "dan da dan", "dandadan season 2", "ดันดาดัน", "ดันดาดัน ภาค 2"],
    note: "Kakumei Douchuu (革命道中)"
  },
  {
    id: 438,
    title: "Sakamoto Days (OP1)",
    altTitles: ["SAKAMOTO DAYS", "ซากาโมโตะ เดย์ส"],
    difficulty: "easy",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=ZVkcjgTfLHU&list=RDZVkcjgTfLHU&start_radio=1",
    acceptedAnswers: ["sakamoto days", "ซากาโมโตะ เดย์ส", "ซากาโมโตะ"],
    note: "Hashire SAKAMOTO (走れSAKAMOTO)"
  },
  {
    id: 439,
    title: "Re:ZERO -Starting Life in Another World- Season 3 (OP1)",
    altTitles: ["Re:Zero Season 3", "รีเซทชีวิต ฝ่าวิกฤตต่างโลก ภาค 3"],
    difficulty: "normal",
    year: 2024,
    youtubeVideoId: "https://www.youtube.com/watch?v=hCxZx7uHO1I&list=RDhCxZx7uHO1I&start_radio=1",
    acceptedAnswers: ["re:zero", "rezero", "re zero season 3", "รีเซโร่", "รีเซทชีวิต ฝ่าวิกฤตต่างโลก"],
    note: "Reweave"
  },
  {
    id: 440,
    title: "Kusuriya no Hitorigoto Season 2 (OP1)",
    altTitles: ["Kusuriya no Hitorigoto Season 2", "สืบคดีปริศนา หมอยาตำรับโคมแดง ภาค 2"],
    difficulty: "easy",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=sYC5BfJy2nw&list=RDsYC5BfJy2nw&start_radio=1",
    acceptedAnswers: ["the apothecary diaries", "kusuriya no hitorigoto", "the apothecary diaries season 2", "หมอยาตำรับโคมแดง", "สืบคดีปริศนา หมอยาตำรับโคมแดง"],
    note: "Hana ni Natte (花になって)"
  },
  {
    id: 441,
    title: "Blue Exorcist: Beyond the Snow Saga (OP1)",
    altTitles: ["Ao no Exorcist: Yuki no Hate-hen", "เอ็กซอร์ซิสต์พันธุ์ปีศาจ ภาค Beyond the Snow Saga"],
    difficulty: "normal",
    year: 2024,
    youtubeVideoId: "https://www.youtube.com/watch?v=nKTLOdjWBCM&list=RDnKTLOdjWBCM&start_radio=1",
    acceptedAnswers: ["blue exorcist", "ao no exorcist", "blue exorcist beyond the snow saga", "เอ็กซอร์ซิสต์พันธุ์ปีศาจ", "บลูเอ็กซอร์ซิสต์"],
    note: "RE RESCUE"
  },
  {
    id: 442,
    title: "Orb: On the Movements of the Earth (OP1)",
    altTitles: ["Chi: Chikyuu no Undou ni Tsuite", "ชิ ว่าด้วยการเคลื่อนที่ของโลก"],
    difficulty: "hard",
    year: 2024,
    youtubeVideoId: "https://www.youtube.com/watch?v=QiF2UjzyNSY&list=RDQiF2UjzyNSY&start_radio=1",
    acceptedAnswers: ["orb", "orb on the movements of the earth", "chi chikyuu no undou ni tsuite", "ชิ ว่าด้วยการเคลื่อนที่ของโลก"],
    note: "Kaijuu (怪獣)"
  },
  {
    id: 443,
    title: "Blue Box (OP1)",
    altTitles: ["Ao no Hako", "กล่องรักวัยใส"],
    difficulty: "easy",
    year: 2024,
    youtubeVideoId: "https://www.youtube.com/watch?v=d0jg9hNHqn8&list=RDd0jg9hNHqn8&start_radio=1",
    acceptedAnswers: ["blue box", "ao no hako", "กล่องรักวัยใส"],
    note: "Same Blue"
  },
  {
    id: 444,
    title: "Blue Box (OP2)",
    altTitles: ["Ao no Hako", "กล่องรักวัยใส"],
    difficulty: "normal",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=jj7DnKGG148&list=RDjj7DnKGG148&start_radio=1",
    acceptedAnswers: ["blue box", "ao no hako", "กล่องรักวัยใส"],
    note: "Saraba (然らば)"
  },
  {
    id: 445,
    title: "Witch Watch (OP1)",
    altTitles: ["วิชวอทช์", "แม่มดจอมป่วนกับยักษ์เฝ้าบ้าน"],
    difficulty: "easy",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=a_NB6QkfzAM&list=RDa_NB6QkfzAM&start_radio=1",
    acceptedAnswers: ["witch watch", "วิชวอทช์", "แม่มดจอมป่วนกับยักษ์เฝ้าบ้าน"],
    note: "Watch me!"
  },
  {
    id: 446,
    title: "Lazarus (OP1)",
    altTitles: ["ลาซารัส"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=XBMrH1ZQs90&list=RDXBMrH1ZQs90&start_radio=1",
    acceptedAnswers: ["lazarus", "ลาซารัส"],
    note: "Vortex"
  },
  {
    id: 447,
    title: "WIND BREAKER Season 2 (OP1)",
    altTitles: ["วินด์เบรกเกอร์ ภาค 2"],
    difficulty: "easy",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=AWlUVr7Du04&list=RDAWlUVr7Du04&start_radio=1",
    acceptedAnswers: ["wind breaker", "wind breaker season 2", "วินด์เบรกเกอร์", "วินด์เบรกเกอร์ ภาค 2"],
    note: "BOYZ"
  },
  {
    id: 448,
    title: "Enen no Shouboutai Season 3 (OP1)",
    altTitles: ["Enen no Shouboutai Season 3", "หน่วยผจญคนไฟลุก ภาค 3"],
    difficulty: "normal",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=_Oyq3V_0wqI",
    acceptedAnswers: ["fire force", "enen no shouboutai", "fire force season 3", "หน่วยผจญคนไฟลุก"],
    note: "Inferno (インフェルノ)"
  },
  {
    id: 449,
    title: "My Hero Academia: Vigilantes (OP1)",
    altTitles: ["Vigilante: Boku no Hero Academia Illegals", "มายฮีโร่ อคาเดเมีย วิจิลันเต"],
    difficulty: "normal",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=amShp0GrLgg",
    acceptedAnswers: ["my hero academia vigilantes", "vigilantes", "boku no hero academia vigilantes", "มายฮีโร่ อคาเดเมีย วิจิลันเต"],
    note: "Kekka Alright (けっかおーらい)"
  },
  {
    id: 450,
    title: "Ameku M.D.: Doctor Detective (OP1)",
    altTitles: ["Ameku Takao no Suiri Karte", "คุณหมออาเมคุ ไขคดีปริศนา"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=3lfnikn920s&list=RD3lfnikn920s&start_radio=1",
    acceptedAnswers: ["ameku m.d. doctor detective", "ameku takao no suiri karte", "คุณหมออาเมคุ ไขคดีปริศนา", "ameku"],
    note: "SCOPE"
  },
  {
    id: 451,
    title: "Medalist (OP1)",
    altTitles: ["เมดัลลิสต์"],
    difficulty: "normal",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=H3SUAiwfyp0&list=RDH3SUAiwfyp0&start_radio=1",
    acceptedAnswers: ["medalist", "เมดัลลิสต์"],
    note: "BOW AND ARROW"
  },
  {
    id: 452,
    title: "Zenshu (OP1)",
    altTitles: ["ZENSHU", "เซ็นชู"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=oygsxvHtU74&list=RDoygsxvHtU74&start_radio=1",
    acceptedAnswers: ["zenshu", "zenshuu", "เซ็นชู"],
    note: "Zen"
  },
  {
    id: 453,
    title: "Tasokare Hotel (OP1)",
    altTitles: ["Who Saw the Peacock Dance in the Jungle?", "ทาโซคาเระ โฮเทล"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=z6AfOdkIFe8&list=RDz6AfOdkIFe8&start_radio=1",
    acceptedAnswers: ["tasokare hotel", "ทาโซคาเระ โฮเทล", "tasokare"],
    note: "Tasokare (たそかれ)"
  },
  {
    id: 454,
    title: "Ameku M.D.: Doctor Detective (OP1)",
    altTitles: ["Ameku Takao no Suiri Karte", "คุณหมออาเมคุ ไขคดีปริศนา"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=3lfnikn920s&list=RD3lfnikn920s&start_radio=1",
    acceptedAnswers: ["ameku m.d. doctor detective", "ameku takao no suiri karte", "ameku", "คุณหมออาเมคุ ไขคดีปริศนา"],
    note: "SCOPE"
  },
  {
    id: 455,
    title: "Guild Receptionist (OP1)",
    altTitles: ["Guild no Uketsukejou desu ga, Zangyou wa Iya nanode Boss wo Solo Toubatsu Shiyou to Omoimasu", "กิลด์รีเซพชั่นนิสต์"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=HTRkYRcRfiA&list=RDHTRkYRcRfiA&start_radio=1",
    acceptedAnswers: ["guild receptionist", "guild no uketsukejou", "กิลด์รีเซพชั่นนิสต์"],
    note: "Perfect Day (パーフェクトデイ)"
  },
  {
    id: 456,
    title: "Okinawa de Suki ni Natta Ko ga Hougen Sugite Tsurasugiru (OP1)",
    altTitles: ["Okinawa de Suki ni Natta Ko ga Hougen Sugite Tsurasugiru", "โอกิตสึระ"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=0XrTdI3l8o4&list=RD0XrTdI3l8o4&start_radio=1",
    acceptedAnswers: ["okitsura", "okinawa de suki ni natta ko ga hougen sugite tsurasugiru", "โอกิตสึระ"],
    note: "Dai Dai Daisuki (大大大好き)"
  },
  {
    id: 457,
    title: "Dr. STONE: SCIENCE FUTURE (OP1)",
    altTitles: ["Dr. Stone Season 4", "ดร.สโตน ภาค 4"],
    difficulty: "easy",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=fG07I9UlnoI&list=RDfG07I9UlnoI&start_radio=1",
    acceptedAnswers: ["dr stone", "dr. stone", "dr stone science future", "ดร.สโตน"],
    note: "CASANOVA POSSE"
  },
  {
    id: 458,
    title: "Dr. STONE: SCIENCE FUTURE Part 2 (OP1)",
    altTitles: ["Dr. Stone Science Future Part 2", "ดร.สโตน ภาค 4 พาร์ท 2"],
    difficulty: "normal",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=08bOLUf2Dzs&list=RD08bOLUf2Dzs&start_radio=1",
    acceptedAnswers: ["dr stone", "dr. stone", "dr stone science future", "dr stone science future part 2", "ดร.สโตน"],
    note: "SUPERNOVA"
  },
  {
    id: 459,
    title: "Solo Leveling Season 2: Arise from the Shadow (OP1)",
    altTitles: ["Ore dake Level Up na Ken Season 2", "โซโลเลเวลลิง ภาค 2"],
    difficulty: "easy",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=C0zMWogztQs&list=RDC0zMWogztQs&start_radio=1",
    acceptedAnswers: ["solo leveling", "solo leveling season 2", "ore dake level up na ken", "โซโลเลเวลลิง"],
    note: "ReawakeR (feat. Felix of Stray Kids)"
  },
  {
    id: 460,
    title: "Watashi no Shiawase na Kekkon 2nd Season (OP1)",
    altTitles: ["Watashi no Shiawase na Kekkon 2nd Season", "ขอให้รักเรานี้ได้มีความสุข ภาค 2"],
    difficulty: "normal",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=oDoErCB-MCY&list=RDoDoErCB-MCY&start_radio=1",
    acceptedAnswers: ["my happy marriage", "watashi no shiawase na kekkon", "my happy marriage season 2", "ขอให้รักเรานี้ได้มีความสุข"],
    note: "Shiawase na Yakusoku. (幸せな約束。)"
  },
  {
    id: 461,
    title: "Kimi no Koto ga Daidaidaidaidaisuki na 100-nin no Kanojo Season 2 (OP1)",
    altTitles: ["Kimi no Koto ga Daidaidaidaidaisuki na 100-nin no Kanojo Season 2", "แฟนสาว 100 คน ภาค 2"],
    difficulty: "normal",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=Itke9o80go0&list=RDItke9o80go0&start_radio=1",
    acceptedAnswers: ["100 girlfriends", "the 100 girlfriends who really really really really really love you", "แฟนสาว 100 คน", "100 kanojo"],
    note: "Daidaidaidai Daisuki na Kimi e♡ (大大大大大好きな君へ♡)"
  },
  {
    id: 462,
    title: "Honey Lemon Soda (OP1)",
    altTitles: ["ฮันนี่เลมอนโซดา"],
    difficulty: "easy",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=6iRn_EwaCqo&list=RD6iRn_EwaCqo&start_radio=1",
    acceptedAnswers: ["honey lemon soda", "ฮันนี่เลมอนโซดา"],
    note: "Magic Hour"
  },
  {
    id: 463,
    title: "Kono Kaisha ni Suki na Hito ga Imasu (OP1)",
    altTitles: ["Can You Keep a Secret?", "Kono Kaisha ni Suki na Hito ga Imasu"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=g9FJdmNgGek&list=RDg9FJdmNgGek&start_radio=1",
    acceptedAnswers: ["i have a crush at work", "can you keep a secret", "kono kaisha ni suki na hito ga imasu"],
    note: "Ano ne, (あのね、)"
  },
  {
    id: 464,
    title: "Kisaki Kyouiku kara Nigetai Watashi (OP1)",
    altTitles: ["Kisaki Kyouiku kara Nigetai Watashi", "ขอหนีจากบทเรียนเจ้าหญิง"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=BHOkQhV9aUQ&list=RDBHOkQhV9aUQ&start_radio=1",
    acceptedAnswers: ["i want to escape from princess lessons", "kisaki kyouiku kara nigetai watashi", "ขอหนีจากบทเรียนเจ้าหญิง"],
    note: "Kimi to shika Koishinai (君としか恋しない)"
  },
  {
    id: 465,
    title: "Flower and Asura (OP1)",
    altTitles: ["Hana wa Saku, Shura no Gotoku", "ดอกไม้และอสูร"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=On8rbqA_Deo&list=RDOn8rbqA_Deo&start_radio=1",
    acceptedAnswers: ["flower and asura", "hana wa saku shura no gotoku", "ดอกไม้และอสูร"],
    note: "Jibun Kakumei (自分革命)"
  },
  {
    id: 466,
    title: "S Rank Monster no Behemoth dakedo (OP1)",
    altTitles: ["S Rank Monster no Behemoth dakedo", "เบเฮเนโกะ"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=yJG9B1p2B-4",
    acceptedAnswers: ["beheneko", "the elf girls cat is secretly an s-ranked monster", "s rank monster no behemoth dakedo", "เบเฮเนโกะ"],
    note: "Saijoukyuu no Kokoro (最上級の心)"
  },
  {
    id: 467,
    title: "Guild no Uketsukejou (OP1)",
    altTitles: ["Guild no Uketsukejou", "กิลด์รีเซพชั่นนิสต์"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=g5yCkyCZ6ZA&list=RDg5yCkyCZ6ZA&start_radio=1",
    acceptedAnswers: ["i may be a guild receptionist but ill solo any boss to clock out on time", "guild receptionist", "guild no uketsukejou", "กิลด์รีเซพชั่นนิสต์"],
    note: "Perfect Day (パーフェクトデイ)"
  },
  {
    id: 468,
    title: "Summer Pockets (OP1)",
    altTitles: ["ซัมเมอร์พ็อกเก็ตส์"],
    difficulty: "normal",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=REuUOArc0W4&list=RDREuUOArc0W4&start_radio=1",
    acceptedAnswers: ["summer pockets", "ซัมเมอร์พ็อกเก็ตส์"],
    note: "Alka Tale (アルカテイル)"
  },
  {
    id: 469,
    title: "Kowloon Generic Romance (OP1)",
    altTitles: ["เกาลูน เจเนอริก โรแมนซ์"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=XBByBaC1WbM&list=RDXBByBaC1WbM&start_radio=1",
    acceptedAnswers: ["kowloon generic romance", "เกาลูน เจเนอริก โรแมนซ์", "kowloon"],
    note: "Summertime Ghost (サマータイムゴースト)"
  },
  {
    id: 470,
    title: "The Beginning After the End (OP1)",
    altTitles: ["Saikyou no Ousama, Nidome no Jinsei wa Nani wo Suru?", "จุดเริ่มต้นและจุดจบ"],
    difficulty: "normal",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=FkgC37ERJCY&list=RDFkgC37ERJCY&start_radio=1",
    acceptedAnswers: ["the beginning after the end", "saikyou no ousama nidome no jinsei wa nani wo suru", "จุดเริ่มต้นและจุดจบ"],
    note: "KINGSBLOOD"
  },
  {
    id: 471,
    title: "Danjo no Yuujou wa Seiritsu suru? (Iya, Shinai!!) (OP1)",
    altTitles: ["Danjo no Yuujou wa Seiritsu suru? (Iya, Shinai!!)", "เพื่อนชายหญิงแท้จริงไม่มีหรอก?"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=-7h--XTyj8A&list=RD-7h--XTyj8A&start_radio=1",
    acceptedAnswers: ["can a boy-girl friendship hold up no it cant", "danjo no yuujou wa seiritsu suru", "เพื่อนชายหญิงแท้จริงไม่มีหรอก"],
    note: "Shitsumon, Koi tte Nan deshou ka? (質問、恋って何でしょうか？)"
  },
  {
    id: 472,
    title: "Apocalypse Hotel (OP1)",
    altTitles: ["อพอคาลิปส์ โฮเทล"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=0Pn6FQXbqhw&list=RD0Pn6FQXbqhw&start_radio=1",
    acceptedAnswers: ["apocalypse hotel", "อพอคาลิปส์ โฮเทล"],
    note: "skirt"
  },
  {
    id: 473,
    title: "Catch Me at the Ballpark! (OP1)",
    altTitles: ["Ballpark de Tsukamaete!", "จับฉันให้ได้ที่สนามเบสบอล!"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=q8m2mO3ykio&list=RDq8m2mO3ykio&start_radio=1",
    acceptedAnswers: ["catch me at the ballpark", "ballpark de tsukamaete", "จับฉันให้ได้ที่สนามเบสบอล"],
    note: "Hurray!!"
  },
  {
    id: 474,
    title: "mono (OP1)",
    altTitles: ["โมโน"],
    difficulty: "normal",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=fmxKvgDOElk&list=RDfmxKvgDOElk&start_radio=1",
    acceptedAnswers: ["mono", "โมโน"],
    note: "Many Merry Memories! (メニメリ・メモリーズ！)"
  },
  {
    id: 475,
    title: "Zatsu Tabi: That's Journey (OP1)",
    altTitles: ["Zatsu Tabi", "ซัตสึทาบิ"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=VbXNzRPlRHM&list=RDVbXNzRPlRHM&start_radio=1",
    acceptedAnswers: ["zatsu tabi", "thats journey", "ซัตสึทาบิ"],
    note: "Tabi Shiyo! don't you? (旅しよ！don't you？)"
  },
  {
    id: 476,
    title: "Ninja to Koroshiya no Futarigurashi (OP1)",
    altTitles: ["A Ninja and an Assassin Under One Roof", "นินจากับนักฆ่าอยู่บ้านเดียวกัน"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=04lt-OgLyH0&list=RD04lt-OgLyH0&start_radio=1",
    acceptedAnswers: ["ninja to koroshiya no futarigurashi", "a ninja and an assassin under one roof", "นินจากับนักฆ่าอยู่บ้านเดียวกัน"],
    note: "Yarenno? Endless (やれんの？エンドレス)"
  },
  {
    id: 477,
    title: "Aharen-san wa Hakarenai Season 2 (OP1)",
    altTitles: ["Aharen-san wa Hakarenai 2nd Season", "คุณอาฮาเรน ภาค 2"],
    difficulty: "normal",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=a6WTDZQrbeE&list=RDa6WTDZQrbeE&start_radio=1",
    acceptedAnswers: ["aharen san wa hakarenai", "aharen san wa hakarenai season 2", "คุณอาฮาเรน"],
    note: "Binetsuma (微熱魔)"
  },
  {
    id: 478,
    title: "Black Butler: Emerald Witch Arc (OP1)",
    altTitles: ["Kuroshitsuji: Midori no Majo-hen", "คนลึกไขปริศนาลับ ภาคแม่มดมรกต"],
    difficulty: "normal",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=KmAT3soCBFQ&list=RDKmAT3soCBFQ&start_radio=1",
    acceptedAnswers: ["black butler", "kuroshitsuji", "black butler emerald witch arc", "คนลึกไขปริศนาลับ"],
    note: "MAISIE"
  },
  {
    id: 479,
    title: "Rock Is a Lady's Modesty (OP1)",
    altTitles: ["Rock wa Lady no Tashinami deshite", "ร็อกคือความสง่างามของคุณหนู"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=X7slC9FW1pQ&list=RDX7slC9FW1pQ&start_radio=1",
    acceptedAnswers: ["rock is a ladys modesty", "rock wa lady no tashinami deshite", "ร็อกคือความสง่างามของคุณหนู"],
    note: "Ready to Rock"
  },
  {
    id: 480,
    title: "Anne Shirley (OP1)",
    altTitles: ["แอน เชอร์ลีย์"],
    difficulty: "normal",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=35zmW9MlQWs&list=RD35zmW9MlQWs&start_radio=1",
    acceptedAnswers: ["anne shirley", "แอน เชอร์ลีย์"],
    note: "Yokan (予感)"
  },
  {
    id: 481,
    title: "YAIBA: Samurai Legend (OP1)",
    altTitles: ["Shin Samurai-den YAIBA", "ไยบะ"],
    difficulty: "normal",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=aWGC4AvH7Sw&list=RDaWGC4AvH7Sw&start_radio=1",
    acceptedAnswers: ["yaiba", "yaiba samurai legend", "shin samurai den yaiba", "ไยบะ"],
    note: "BLADE"
  },
  {
    id: 482,
    title: "DAN DA DAN Season 2 (OP1)",
    altTitles: ["Dan Da Dan Season 2", "ดันดาดัน ภาค 2"],
    difficulty: "easy",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=DCCRNzKvWRg&list=RDDCCRNzKvWRg&start_radio=1",
    acceptedAnswers: ["dandadan", "dan da dan", "dandadan season 2", "ดันดาดัน", "ดันดาดัน ภาค 2"],
    note: "Kakumei Douchuu (革命道中)"
  },
  {
    id: 483,
    title: "The Fragrant Flower Blooms with Dignity (OP1)",
    altTitles: ["Kaoru Hana wa Rin to Saku", "ดอกรักผลิบานที่กลางใจ"],
    difficulty: "normal",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=KRLTEifai74&list=RDKRLTEifai74&start_radio=1",
    acceptedAnswers: ["the fragrant flower blooms with dignity", "kaoru hana wa rin to saku", "ดอกรักผลิบานที่กลางใจ"],
    note: "Manazashi wa Hikari (まなざしは光)"
  },
  {
    id: 484,
    title: "Rascal Does Not Dream of Santa Claus (OP1)",
    altTitles: ["Seishun Buta Yarou wa Santa Claus no Yume wo Minai", "เรื่องฝันปั่นป่วยของผมกับซานตาคลอส"],
    difficulty: "normal",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=768epU6Wz34&list=RD768epU6Wz34&start_radio=1",
    acceptedAnswers: ["rascal does not dream of santa claus", "seishun buta yarou wa santa claus no yume wo minai", "บันนี่เกิร์ล", "เรื่องฝันปั่นป่วยของผมกับซานตาคลอส"],
    note: "Snowdrop (スノウドロップ)"
  },
  {
    id: 485,
    title: "Gachiakuta (OP1)",
    altTitles: ["กาจิอาคุตะ"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=9f89PWhv8YE&list=RD9f89PWhv8YE&start_radio=1",
    acceptedAnswers: ["gachiakuta", "กาจิอาคุตะ"],
    note: "HUGs"
  },
  {
    id: 486,
    title: "Clevatess (OP1)",
    altTitles: ["Clevatess: Majuu no Ou to Akago to Shikabane no Yuusha", "เคลวาเทส"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=jQnIPTsWyC4&list=RDjQnIPTsWyC4&start_radio=1",
    acceptedAnswers: ["clevatess", "clevatess majuu no ou to akago to shikabane no yuusha", "เคลวาเทส"],
    note: "Ruler"
  },
  {
    id: 487,
    title: "Tougen Anki (OP1)",
    altTitles: ["โทเก็นอันคิ"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=bCjTTzgefSs&list=RDbCjTTzgefSs&start_radio=1",
    acceptedAnswers: ["tougen anki", "โทเก็นอันคิ"],
    note: "OVERNIGHT"
  },
  {
    id: 488,
    title: "Kaiju No. 8 Season 2 (OP1)",
    altTitles: ["ไคจูหมายเลข 8 ภาค 2"],
    difficulty: "easy",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=rH8FCwzOdpI&list=RDrH8FCwzOdpI&start_radio=1",
    acceptedAnswers: ["kaiju no 8", "kaiju no. 8", "kaiju no 8 season 2", "ไคจูหมายเลข 8"],
    note: "You Can't Run From Yourself"
  },
  {
    id: 489,
    title: "Yofukashi no Uta Season 2 (OP1)",
    altTitles: ["Yofukashi no Uta Season 2", "เพลงรักมนุษย์ค้างคาว ภาค 2"],
    difficulty: "normal",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=qA6ttnGzSUM&list=RDqA6ttnGzSUM&start_radio=1",
    acceptedAnswers: ["call of the night", "yofukashi no uta", "call of the night season 2", "เพลงรักมนุษย์ค้างคาว"],
    note: "Mirage"
  },
  {
    id: 490,
    title: "Sono Bisque Doll wa Koi wo Suru Season 2 (OP1)",
    altTitles: ["Sono Bisque Doll wa Koi wo Suru Season 2", "หนุ่มเย็บผ้ากับสาวนักคอสเพลย์ ภาค 2"],
    difficulty: "easy",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=ie5GcVid_8k&list=RDie5GcVid_8k&start_radio=1",
    acceptedAnswers: ["my dress up darling", "sono bisque doll wa koi wo suru", "my dress up darling season 2", "หนุ่มเย็บผ้ากับสาวนักคอสเพลย์"],
    note: "Ao to Kirameki (アオとキラメキ)"
  },
  {
    id: 491,
    title: "Kanojo, Okarishimasu 4th Season (OP1)",
    altTitles: ["Kanojo, Okarishimasu 4th Season", "สะดุดรักยัยแฟนเช่า ภาค 4"],
    difficulty: "normal",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=PEKJKhLY4Qw&list=RDPEKJKhLY4Qw&start_radio=1",
    acceptedAnswers: ["rent a girlfriend", "kanojo okarishimasu", "rent a girlfriend season 4", "สะดุดรักยัยแฟนเช่า"],
    note: "Umitsuki"
  },
  {
    id: 492,
    title: "Silent Witch: Chinmoku no Majo no Kakushigoto (OP1)",
    altTitles: ["Silent Witch: Chinmoku no Majo no Kakushigoto", "ความลับของแม่มดเงียบ"],
    difficulty: "hard",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=DWNiF9QdQ_E&list=RDDWNiF9QdQ_E&start_radio=1",
    acceptedAnswers: ["secrets of the silent witch", "silent witch", "silent witch chinmoku no majo no kakushigoto", "ความลับของแม่มดเงียบ"],
    note: "Feel"
  },
  {
    id: 493,
    title: "City The Animation (OP1)",
    altTitles: ["CITY THE ANIMATION", "ซิตี้ ดิ แอนิเมชัน"],
    difficulty: "normal",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=10eZAXGuVT4&list=RD10eZAXGuVT4&start_radio=1",
    acceptedAnswers: ["city the animation", "city", "ซิตี้ ดิ แอนิเมชัน"],
    note: "Hello"
  },
  {
    id: 494,
    title: "Witch Watch (OP2)",
    altTitles: ["วิชวอทช์"],
    difficulty: "normal",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=bNebhCcS_2g&list=RDbNebhCcS_2g&start_radio=1",
    acceptedAnswers: ["witch watch", "วิชวอทช์"],
    note: "Tokihanate! (ときはなて！)"
  },
  {
    id: 495,
    title: "One-Punch Man Season 3 (OP1)",
    altTitles: ["วันพั้นช์แมน ภาค 3"],
    difficulty: "easy",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=6qI-a3YXEPc&list=RD6qI-a3YXEPc&start_radio=1",
    acceptedAnswers: ["one punch man", "one-punch man", "one punch man season 3", "วันพั้นช์แมน"],
    note: "Get No Satisfied !"
  },
  {
    id: 496,
    title: "Spy x Family Season 3 (OP1)",
    altTitles: ["สปาย x แฟมิลี ภาค 3"],
    difficulty: "easy",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=PcmmU4aEQu0&list=RDPcmmU4aEQu0&start_radio=1",
    acceptedAnswers: ["spy x family", "spy family", "spy x family season 3", "สปาย x แฟมิลี"],
    note: "Hi wo Mamoru (灯を護る)"
  },
  {
    id: 497,
    title: "Chainsaw Man – The Movie: Reze Arc (op movie)",
    altTitles: ["Chainsaw Man Movie", "เชนซอว์แมน เดอะมูฟวี่ เรเซ่อาร์ค"],
    difficulty: "easy",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=ux3QETpLcPs&list=RDux3QETpLcPs&start_radio=1",
    acceptedAnswers: ["chainsaw man", "chainsaw man reze arc", "chainsaw man movie", "เชนซอว์แมน"],
    note: "IRIS OUT"
  },
  {
    id: 498,
    title: "Blue Box Season 2 (OP1)",
    altTitles: ["Ao no Hako Season 2", "กล่องรักวัยใส ภาค 2"],
    difficulty: "easy",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=d0jg9hNHqn8&list=RDd0jg9hNHqn8&start_radio=1",
    acceptedAnswers: ["blue box", "ao no hako", "blue box season 2", "กล่องรักวัยใส"],
    note: ""
  },
  {
    id: 499,
    title: "My Hero Academia: FINAL SEASON (OP1)",
    altTitles: ["Boku no Hero Academia Final Season", "มายฮีโร่ อคาเดเมีย ไฟนอลซีซัน"],
    difficulty: "easy",
    year: 2025,
    youtubeVideoId: "https://www.youtube.com/watch?v=K0v0lTbZnvM&list=RDK0v0lTbZnvM&start_radio=1",
    acceptedAnswers: ["my hero academia", "boku no hero academia", "my hero academia final season", "มายฮีโร่ อคาเดเมีย"],
    note: "THE REVO"
  },
  {
    id: 500,
    title: "Sousou no Frieren Season 2 (OP1)",
    altTitles: ["Sousou no Frieren Season 2", "คำอธิษฐานในวันที่จากลา ภาค 2"],
    difficulty: "easy",
    year: 2026,
    youtubeVideoId: "https://www.youtube.com/watch?v=C0BG3B7aksU&list=RDC0BG3B7aksU&start_radio=1",
    acceptedAnswers: ["frieren", "sousou no frieren", "frieren beyond journeys end season 2", "ฟรีเรน", "คำอธิษฐานในวันที่จากลา"],
    note: "lulu."
  },
  {
    id: 501,
    title: "High School DxD New (OP1)",
    altTitles: ["ไฮสคูล DxD New", "High School DxD Season 2"],
    difficulty: "normal",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=51IqO09zGdc&list=RD51IqO09zGdc&start_radio=1",
    acceptedAnswers: ["high school dxd", "high school dxd new", "ไฮสคูล dxd", "ไฮสคูล dxd new"],
    note: "Sympathy"
  },
  {
    id: 502,
    title: "High School DxD New (OP2)",
    altTitles: ["ไฮสคูล DxD New", "High School DxD Season 2"],
    difficulty: "hard",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=ffTjlMgHYck&list=RDffTjlMgHYck&start_radio=1",
    acceptedAnswers: ["high school dxd", "high school dxd new", "ไฮสคูล dxd", "ไฮสคูล dxd new"],
    note: "Gekijouron (激情論)"
  },
  {
    id: 503,
    title: "High School DxD BorN (OP1)",
    altTitles: ["ไฮสคูล DxD BorN", "High School DxD Season 3"],
    difficulty: "normal",
    year: 2015,
    youtubeVideoId: "https://www.youtube.com/watch?v=SycL40fnUlw&list=RDSycL40fnUlw&start_radio=1",
    acceptedAnswers: ["high school dxd", "high school dxd born", "ไฮสคูล dxd", "ไฮสคูล dxd born"],
    note: "BLESS YoUr NAME"
  },
  {
    id: 504,
    title: "High School DxD Hero (OP1)",
    altTitles: ["ไฮสคูล DxD Hero", "High School DxD Season 4"],
    difficulty: "normal",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=wrNvWEEHzTk&list=RDwrNvWEEHzTk&start_radio=1",
    acceptedAnswers: ["high school dxd", "high school dxd hero", "ไฮสคูล dxd", "ไฮสคูล dxd hero"],
    note: "SWITCH"
  },
  {
    id: 505,
    title: "umamusume s1  (OP1)",
    altTitles: ["สาวม้าโมเอะ", "umamusume s1"],
    difficulty: "normal",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=nuuq0Ul_-_c&list=PL_y7yIiv8j3GPkNaoSpZafmoAl0F-nXeQ",
    acceptedAnswers: ["สาวม้า", "umamusume", "สาวม้าโมเอะ", "umamusume s1"],
    note: "Kokoro e"
  },
  {
    id: 506,
    title: "umamusume s1  (ED2)",
    altTitles: ["สาวม้าโมเอะ", "umamusume s1"],
    difficulty: "normal",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=IKcH4Bxm9bU&list=PL_y7yIiv8j3GPkNaoSpZafmoAl0F-nXeQ&index=2",
    acceptedAnswers: ["สาวม้า", "umamusume", "สาวม้าโมเอะ", "umamusume s1"],
    note: "Faraway"
  },
  {
    id: 507,
    title: "shingeki no kyojin (Attack On Titan) season 1  (ED2)",
    altTitles: ["shingeki no kyojin", "attack on titan", "ผ่าภิภพไททัน "],
    difficulty: "normal",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=sFdzNhJAdco&list=PLYplBcwXEFYuwwXJOsRscA33x6KMGO6Ch&index=31",
    acceptedAnswers: ["attack on titan", "shingeki no kyojin", "ผ่าพิภพไททัน"],
    note: "great escape",
  },
  {
    id: 508, 
    title: "shingeki no kyojin (Attack On Titan) season 2  (ED1)",
    altTitles: ["shingeki no kyojin", "attack on titan", "ผ่าภิภพไททัน "],
    difficulty: "normal",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=rbfHY8mkhT8&list=PLYplBcwXEFYuwwXJOsRscA33x6KMGO6Ch&index=33",
    acceptedAnswers: ["attack on titan", "shingeki no kyojin", "ผ่าพิภพไททัน"],
    note: "Utsukushiki Zankoku na Sekai (美しき残酷な世界)"
  },
  {
    id: 509,
    title: "Rokudenashi Majutsu Koushi to Akashic Records  (OP1)",
    altTitles: ["Rokudenashi Majutsu Koushi to Akashic Records", "อาจารย์จอมเวทกับบันทึกพิศวง"],  
    difficulty: "normal",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=TYCIdFby_90&list=PLYplBcwXEFYuwwXJOsRscA33x6KMGO6Ch&index=115",
    acceptedAnswers: ["rokudenashi majutsu koushi to akashic records", "rokudenashi majutsu koushi", "อาจารย์จอมเวทกับบันทึกพิศวง"],
    note: "Blow out"
  },
  {
    id: 510,
    title: "Ajin: Demi-Human (OP1)",
    altTitles: ["Ajin: Demi-Human", "อาจิน มนุษย์กึ่งอมตะ"],  
    difficulty: "normal",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=7BmxmRnKnZg&list=RD7BmxmRnKnZg&start_radio=1",
    acceptedAnswers: ["ajin: demi-human", "อาจิน","มนุษย์กึ่งอมตะ"],
    note: "Yoru wa Nemureru kai? (夜は眠れるかい？)"
  },        

];

const answerModeConfig = {
  choice6: {
    label: "6 ตัวเลือก",
    description: "เดาจากตัวเลือก 6 ข้อ",
    choices: true
  },
  typing: {
    label: "พิมพ์ตอบเอง",
    description: "พิมพ์ชื่อเรื่องด้วยตัวเอง",
    choices: false
  }
};

const genreConfig = {
  action: { label: "แอ็กชัน" },
  fantasy: { label: "แฟนตาซี" },
  isekai: { label: "ต่างโลก" },
  scifi: { label: "ไซไฟ" },
  sports: { label: "กีฬา" },
  mystery: { label: "สืบสวน/จิตวิทยา" },
  romance: { label: "โรแมนซ์" },
  comedy: { label: "คอมเมดี้" },
  music: { label: "ดนตรี/ไอดอล" },
  mecha: { label: "หุ่นยนต์" },
  slice: { label: "ชีวิตประจำวัน" },
  other: { label: "อื่นๆ" }
};

function getFallbackGenreLabel(anime) {
  const key = String(anime?.genre || "").trim();
  if (key) return genreConfig[key]?.label || key;
  return genreConfig.other.label;
}

const genreKeywordRules = [
  { genre: "sports", keywords: ["haikyuu", "slam dunk", "kuroko", "blue lock", "diamond no ace", "yowamushi", "prince of tennis"] },
  { genre: "music", keywords: ["k-on", "bocchi", "paripi", "zombieland saga", "your lie in april", "idol", "love live", "macross"] },
  { genre: "mecha", keywords: ["gundam", "evangelion", "code geass", "darling in the franxx", "gurren lagann", "mecha", "eureka seven"] },
  { genre: "isekai", keywords: ["re:zero", "konosuba", "slime", "shield hero", "mushoku", "overlord", "tanya", "log horizon", "sao", "sword art", "no game no life"] },
  { genre: "scifi", keywords: ["steins", "psycho", "ghost in the shell", "cyberpunk", "86", "dr. stone", "vivy", "akudama", "edgerunners", "science"] },
  { genre: "mystery", keywords: ["death note", "conan", "erased", "neverland", "parasyte", "monster", "summertime", "boku dake", "higurashi"] },
  { genre: "romance", keywords: ["kaguya", "toradora", "your name", "horimiya", "clannad", "bunny girl", "kimi ni todoke", "fruits basket", "shigatsu"] },
  { genre: "comedy", keywords: ["gintama", "nichijou", "asobi", "saiki", "grand blue", "osomatsu", "komi", "spy x family"] },
  { genre: "fantasy", keywords: ["fate", "frieren", "made in abyss", "vinland", "seven deadly sins", "black clover", "fairy tail", "akame", "magi"] },
  { genre: "slice", keywords: ["barakamon", "non non", "yuru camp", "hyouka", "violet", "anohana", "daily life", "slice"] }
];

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function stripOpEdSuffix(text) {
  return String(text || "")
    .replace(/\s*\(\s*(?:op|ed)\s*\d+\s*\)\s*$/i, "")
    .replace(/\s+(?:op|ed)\s*\d+\s*$/i, "")
    .trim();
}

function extractBaseTitle(text) {
  const normalized = normalize(text);
  const noSongSuffix = stripOpEdSuffix(normalized);

  return noSongSuffix
    .replace(/\s*[\-:\/|]\s*(?:season|s|part|pt|vol|volume|cour|arc|chapter|final season|2nd|3rd|4th|5th|6th|7th).*/gi, "")
    .replace(/\s+(?:season|s|part|pt|vol|volume|cour|arc)\s*\d+.*/gi, "")
    .replace(/\s+final.*/gi, "")
    .trim()
    .replace(/\s+/g, " ");
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function readLocalJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = safeJsonParse(raw);
    return parsed == null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function baseSeriesKeyFromTitle(title) {
  const t = String(title || "").trim();
  if (!t) return "";
  const withoutSongMarker = t.replace(/\s*\(\s*(?:op|ed|insert|ost)\s*\d*\s*\)\s*$/i, "").trim();
  return normalize(withoutSongMarker);
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function makeRoomCode(payload) {
  try {
    const json = JSON.stringify(payload || {});
    const b64 = btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
    return `R1.${b64}`;
  } catch {
    return "";
  }
}

function parseRoomCode(code) {
  const raw = String(code || "").trim();
  if (!raw.startsWith("R1.")) return null;
  const b64url = raw.slice(3).replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64url.length % 4 ? "=".repeat(4 - (b64url.length % 4)) : "";
  try {
    const json = decodeURIComponent(escape(atob(b64url + pad)));
    return safeJsonParse(json);
  } catch {
    return null;
  }
}

function inferGenre(anime) {
  const haystack = normalize([anime.title, ...(anime.altTitles || []), anime.note || ""].join(" "));
  const matched = genreKeywordRules.find((rule) =>
    rule.keywords.some((keyword) => haystack.includes(normalize(keyword)))
  );

  return matched?.genre || "action";
}

function buildChoices(correctAnime, pool, choiceCount = 6) {
  const targetCount = Math.max(choiceCount - 1, 0);
  const correctKey = extractBaseTitle(correctAnime.title || "");
  const usedKeys = new Set([correctKey]);

  const others = [];
  const candidates = shuffleArray(pool.filter((a) => a.id !== correctAnime.id));
  for (const candidate of candidates) {
    if (others.length >= targetCount) break;
    const key = extractBaseTitle(candidate.title || "");
    if (!key) continue;
    if (usedKeys.has(key)) continue;
    usedKeys.add(key);
    others.push(candidate);
  }

  // Fallback: if pool is too small, fill remaining slots without key-deduping.
  if (others.length < targetCount) {
    const remaining = candidates.filter((a) => !others.some((b) => b.id === a.id)).slice(0, targetCount - others.length);
    others.push(...remaining);
  }

  return shuffleArray([correctAnime, ...others]);
}

function getYouTubeId(videoSource) {
  const raw = String(videoSource || "").trim();
  if (!raw) return "";

  const pickFromCandidate = (candidate) => {
    const v = String(candidate || "").trim();
    if (!v) return "";
    // Most YouTube video IDs are 11 chars, but we'll accept a safe subset.
    // Keep only the first token before any separators.
    const token = v.split(/[?&#/\s]+/)[0] || "";
    if (/^[a-zA-Z0-9_-]{6,20}$/.test(token)) return token;
    return "";
  };

  // If already looks like an ID, return it.
  const direct = pickFromCandidate(raw);
  if (direct && !raw.includes(".")) return direct;

  // Regex fallback for non-URL strings.
  const m = raw.match(
    /(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{6,20})/i
  );
  if (m && m[1]) return pickFromCandidate(m[1]);

  // Try parsing as URL. If missing scheme, prefix https://
  const toUrl = (s) => {
    const str = String(s || "").trim();
    if (!str) return null;
    if (/^https?:\/\//i.test(str)) return new URL(str);
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(str)) return new URL(`https://${str}`);
    return null;
  };

  try {
    const url = toUrl(raw);
    if (!url) return "";

    const queryId = url.searchParams.get("v");
    if (queryId) return pickFromCandidate(queryId);

    if (url.hostname.includes("youtu.be")) {
      return pickFromCandidate(url.pathname.replace(/^\//, ""));
    }

    const parts = url.pathname.split("/").filter(Boolean);
    const embedIndex = parts.indexOf("embed");
    if (embedIndex !== -1 && parts[embedIndex + 1]) {
      return pickFromCandidate(parts[embedIndex + 1]);
    }

    const shortsIndex = parts.indexOf("shorts");
    if (shortsIndex !== -1 && parts[shortsIndex + 1]) {
      return pickFromCandidate(parts[shortsIndex + 1]);
    }
  } catch {
    // ignore
  }

  return "";
}

function buildYouTubeEmbedUrl(videoSource, { start = 0 } = {}) {
  const videoId = getYouTubeId(videoSource);
  if (!videoId) return "";
  const origin = (() => {
    try {
      return typeof window !== "undefined" && window.location?.origin ? String(window.location.origin) : "";
    } catch {
      return "";
    }
  })();
  const ref = (() => {
    try {
      return typeof window !== "undefined" && window.location?.href ? String(window.location.href) : "";
    } catch {
      return "";
    }
  })();

  const params = new URLSearchParams({
    start: String(start),
    rel: "0",
    modestbranding: "1",
    iv_load_policy: "3",
    playsinline: "1",
    ...(origin ? { origin } : {}),
    ...(ref ? { widget_referrer: ref } : {})
  });

  // Use youtube.com embed for better compatibility with consent/age-restricted playback.
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

function getYouTubeThumbUrl(videoSource) {
  const videoId = getYouTubeId(videoSource);
  if (!videoId) return "";
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function getAnimeImageUrl(anime) {
  if (!anime) return "";
  // You can set `imageUrl` to either:
  // - a full URL (https://...)
  // - a local public asset path (e.g. /covers/aot.jpg)
  return anime.imageUrl || getYouTubeThumbUrl(anime.youtubeVideoId);
}

function SmartImage({ src, fallbackSrc, alt, className }) {
  const [currentSrc, setCurrentSrc] = React.useState(src);
  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => {
        if (fallbackSrc && currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
      }}
    />
  );
}

function GitHubProfileCard({ username, roleLabel }) {
  const user = String(username || "").trim();
  const role = String(roleLabel || "").trim();
  const [data, setData] = React.useState(null);
  const [status, setStatus] = React.useState("idle"); // idle | loading | ok | error

  React.useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setStatus("loading");

    fetch(`https://api.github.com/users/${encodeURIComponent(user)}`, {
      headers: {
        Accept: "application/vnd.github+json"
      }
    })
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text().catch(() => "");
          throw new Error(`${r.status}:${text || r.statusText || "fetch_failed"}`);
        }
        return r.json();
      })
      .then((json) => {
        if (cancelled) return;
        setData(json && typeof json === "object" ? json : null);
        setStatus("ok");
      })
      .catch(() => {
        if (cancelled) return;
        setData(null);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const profileUrl = data?.html_url || `https://github.com/${user}`;
  const avatarUrl = data?.avatar_url || "";
  const displayName = String(data?.name || "").trim() || user;
  const login = String(data?.login || "").trim() || user;
  const bio = String(data?.bio || "").trim();
  const followers = Number.isFinite(data?.followers) ? data.followers : null;
  const repos = Number.isFinite(data?.public_repos) ? data.public_repos : null;

  return (
    <Card className="rounded-3xl border border-slate-200 bg-white/70 shadow-[0_16px_28px_rgba(15,23,42,0.08)] overflow-hidden dark:border-slate-700 dark:bg-slate-950/35">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={login}
                loading="lazy"
                className="h-14 w-14 rounded-2xl object-cover border border-slate-200 bg-white dark:border-slate-700"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-14 w-14 rounded-2xl border border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-950/45" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 truncate">
                  {displayName}
                </div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">@{login}</div>
              </div>
              {role ? (
                <Badge
                  variant="outline"
                  className="rounded-full border-slate-200 bg-white/60 text-slate-800 dark:border-slate-700 dark:bg-slate-950/35 dark:text-slate-100"
                >
                  {role}
                </Badge>
              ) : null}
            </div>

            {bio ? (
              <div className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200/90 whitespace-pre-line">
                {bio}
              </div>
            ) : status === "loading" ? (
              <div className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">กำลังโหลดโปรไฟล์ GitHub…</div>
            ) : status === "error" ? (
              <div className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                โหลดโปรไฟล์ไม่สำเร็จ (อาจติด rate limit) — กดปุ่มเพื่อเปิด GitHub ได้เลย
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {followers != null ? (
                <Badge variant="outline" className="rounded-full tabular-nums">👥 {followers.toLocaleString()} followers</Badge>
              ) : null}
              {repos != null ? (
                <Badge variant="outline" className="rounded-full tabular-nums">📦 {repos.toLocaleString()} repos</Badge>
              ) : null}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-semibold"
                onClick={() => window.open(profileUrl, "_blank", "noopener,noreferrer")}
              >
                เปิด GitHub
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SynopsisInline({ title, synopsisCache, synopsisLoading, ensureSynopsis }) {
  const cacheKey = normalizeSynopsisKey(title);

  React.useEffect(() => {
    if (!cacheKey || !title) return;
    const existing = synopsisCache?.[cacheKey];
    // Allow retries for cached misses so newly-added synopsis can appear.
    if (existing && (existing?.text || existing?.url || existing?.error)) return;
    if (synopsisLoading?.[cacheKey]) return;
    ensureSynopsis({ cacheKey, searchTitle: title });
  }, [cacheKey, title, synopsisCache, synopsisLoading, ensureSynopsis]);

  const cached = synopsisCache?.[cacheKey];
  const text = cached?.text || "";
  const url = cached?.url || "";
  const hadError = Boolean(cached?.error);
  const isLoading = Boolean(synopsisLoading?.[cacheKey]);

  return (
    <div className="text-sm leading-6 text-slate-700 dark:text-slate-200/90">
      {isLoading ? (
        <div className="text-xs text-slate-600 dark:text-slate-300">กำลังโหลดเรื่องย่อ…</div>
      ) : null}

      {text ? (
        <>
          <div className="whitespace-pre-line">{text}</div>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-xs font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
            >
              อ่านต่อ (แหล่งข้อมูล)
            </a>
          ) : null}
        </>
      ) : (
        <div className="text-slate-600 dark:text-slate-300">
          {hadError ? "โหลดเรื่องย่อไม่สำเร็จ (ลองใหม่ได้)" : "ยังไม่มีเรื่องย่อ"}
          {url ? (
            <>
              {" "}—{" "}
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
              >
                เปิดแหล่งข้อมูล
              </a>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

function isSongEntryTitle(title) {
  const t = String(title || "");
  // Heuristic: entries that are explicitly OP/ED/Insert tracks.
  return /\(\s*(OP|ED)\b/i.test(t) || /\b(OP\d+|ED\d+)\b/i.test(t) || /\b(Insert)\b/i.test(t);
}

function buildLegalSearchUrl(query) {
  const q = encodeURIComponent(query);
  return `https://www.google.com/search?q=${q}`;
}

function buildProviderSearchUrl(providerKey, term) {
  const rawTerm = String(term || "").trim();
  const q = encodeURIComponent(rawTerm);
  switch (providerKey) {
    case "youtube":
    case "muse":
    case "anione":
    case "gundaminfo":
    case "pokemonasia":
      return `https://www.youtube.com/results?search_query=${q}`;
    case "ytmusic":
      return `https://music.youtube.com/search?q=${q}`;
    case "spotify":
      return `https://open.spotify.com/search/${q}`;
    case "applemusic":
      return `https://music.apple.com/search?term=${q}`;
    case "netflix":
      return `https://www.netflix.com/search?q=${q}`;
    case "prime":
      return `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${q}`;
    case "disney":
      return `https://www.disneyplus.com/search/${q}`;
    case "crunchyroll":
      return `https://www.crunchyroll.com/search?q=${q}`;
    case "iqiyi":
      return `https://www.iq.com/search?query=${q}`;
    case "bilibili":
      return rawTerm ? `https://www.bilibili.tv/th/search-result?q=${q}` : "https://www.bilibili.tv/th/search-result";
    case "trueid":
      return rawTerm ? `https://www.trueid.net/search/${q}` : "https://www.trueid.net/search";
    case "viu":
      return `https://www.viu.com/ott/th/th/search?keyword=${q}`;
    case "flixer":
      return `https://flixer.tv/search?keyword=${q}`;
    case "pops":
      return `https://pops.tv/search?keyword=${q}`;
    case "linetv":
      return `https://www.linetv.me/search?keyword=${q}`;
    case "x":
      return `https://x.com/search?q=${q}&src=typed_query`;
    case "appletv":
      return `https://tv.apple.com/search?term=${q}`;
    default:
      return `https://www.google.com/search?q=${q}`;
  }
}

const LEGAL_PROVIDER_PRESETS = {
  netflix: { label: "Netflix", short: "N" },
  prime: { label: "Prime Video", short: "PV" },
  disney: { label: "Disney+", short: "D+" },
  crunchyroll: { label: "Crunchyroll", short: "CR" },
  iqiyi: { label: "iQIYI", short: "IQ" },
  bilibili: { label: "Bilibili", short: "B" },
  trueid: { label: "TrueID", short: "T" },
  viu: { label: "Viu", short: "V" },
  muse: { label: "Muse Thailand", short: "M" },
  anione: { label: "Ani-One Asia", short: "A1" },
  flixer: { label: "Flixer", short: "F" },
  gundaminfo: { label: "GundamInfo", short: "GI" },
  pops: { label: "POPS", short: "P" },
  linetv: { label: "LINE TV", short: "LT" },
  x: { label: "X", short: "X" },
  appletv: { label: "Apple TV", short: "ATV" },
  pokemonasia: { label: "Pokémon Asia (YouTube)", short: "PK" },
  youtube: { label: "YouTube", short: "Y" },
  spotify: { label: "Spotify", short: "S" },
  applemusic: { label: "Apple Music", short: "AM" },
  ytmusic: { label: "YouTube Music", short: "YM" }
};

function ProviderIconButton({ providerKey, term, title, iconSrc, size = "md" }) {
  const provider = LEGAL_PROVIDER_PRESETS[providerKey];
  if (!provider) return null;

  const isYouTube = providerKey === "ytmusic" || providerKey === "youtube" || providerKey === "pokemonasia" || providerKey === "gundaminfo";
  const isMusic = providerKey === "spotify" || providerKey === "applemusic" || providerKey === "ytmusic";
  const openUrl = buildProviderSearchUrl(providerKey, term);
  const openFeatures = providerKey === "bilibili" ? "noopener" : "noopener,noreferrer";

  const s = String(size || "md");
  const box = s === "sm" ? "h-[38px] w-[38px] rounded-lg" : "h-[50px] w-[50px] rounded-xl";
  const icon = s === "sm" ? "h-[20px] w-[20px]" : "h-[28px] w-[28px]";
  const fallbackIcon = s === "sm" ? "h-[18px] w-[18px]" : "h-[22px] w-[22px]";

  return (
    <button
      type="button"
      onClick={(e) => {
        try {
          e?.preventDefault?.();
          e?.stopPropagation?.();
        } catch {
          // ignore
        }
        window.open(openUrl, "_blank", openFeatures);
      }}
      title={title || provider.label}
      className={`inline-flex items-center justify-center ${box} border border-slate-200 bg-white/70 text-slate-900 hover:bg-white hover:border-slate-300 transition-colors dark:border-slate-700 dark:bg-slate-950/45 dark:text-slate-100 dark:hover:bg-slate-900/55`}
    >
      {iconSrc ? (
        <img
          src={iconSrc}
          alt={provider.label}
          loading="lazy"
          className={`${icon} object-contain`}
          referrerPolicy="no-referrer"
        />
      ) : isYouTube ? (
        <Youtube className={fallbackIcon} />
      ) : isMusic ? (
        <Music2 className={fallbackIcon} />
      ) : (
        <Film className={fallbackIcon} />
      )}
      <span className="sr-only">{provider.label}</span>
    </button>
  );
}

function ProviderTextBadge({ providerKey }) {
  const provider = LEGAL_PROVIDER_PRESETS[providerKey];
  if (!provider) return null;
  return (
    <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-lg bg-slate-900/5 text-slate-700 text-[11px] font-extrabold dark:bg-white/10 dark:text-slate-100">
      {provider.short}
    </span>
  );
}

function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function hashStringToUint(str) {
  // Simple deterministic hash (FNV-1a-ish)
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const SYNOPSIS_CACHE_STORAGE_KEY = "animequiz_synopsis_cache_v6";

function normalizeSynopsisKey(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .trim();
}

// Alternative normalization: turn punctuation into spaces (helps when DB keys were
// created by splitting on punctuation, e.g. "Fate/Zero" -> "fate zero").
function normalizeSynopsisKeySpaced(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function synopsisKeyVariants(title) {
  const a = normalizeSynopsisKey(title);
  const b = normalizeSynopsisKeySpaced(title);
  if (a && b && a !== b) return [a, b];
  return a ? [a] : b ? [b] : [];
}

function findManualSynopsisEntry(db, searchTitle) {
  const title = String(searchTitle || "").trim();
  if (!title) return null;
  const items = db?.items || {};
  const byTitle = db?.byTitle || {};
  const baseTitle = availabilityBaseKeyFromTitle(title) || title;
  const keysToTry = [...synopsisKeyVariants(title), ...synopsisKeyVariants(baseTitle)];
  for (const k of keysToTry) {
    const entry = items?.[k] || byTitle?.[k] || null;
    if (entry) return entry;
  }
  return null;
}

function pickAltTitleLabel(entry, currentTitle) {
  if (!entry) return "";
  const cur = String(currentTitle || "").trim();
  if (!cur) return "";

  const curKeys = new Set(synopsisKeyVariants(cur));

  const aliases = Array.isArray(entry?.aliases) ? entry.aliases : [];
  for (const a of aliases) {
    const t = String(a || "").trim();
    if (!t) continue;
    const keys = synopsisKeyVariants(t);
    if (!keys.some((k) => curKeys.has(k))) return t;
  }

  const primary = String(entry?.title || "").trim();
  if (primary) {
    const keys = synopsisKeyVariants(primary);
    if (!keys.some((k) => curKeys.has(k))) return primary;
  }

  return "";
}

function normalizeAvailabilityKey(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    // Keep ASCII punctuation (e.g. apostrophes) to match the raw list keys.
    .replace(/[^\u0000-\u007F\p{L}\p{N} ]/gu, "")
    .trim();
}

// Loose matching for catalog/availability keys: ignore ASCII punctuation differences.
// Example: "Cardfight Vanguard" should match "Cardfight!! Vanguard".
function normalizeAvailabilityKeyLoose(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildLooseKeyIndex(map) {
  const out = {};
  if (!map || typeof map !== "object") return out;
  for (const [k, v] of Object.entries(map)) {
    const lk = normalizeAvailabilityKeyLoose(k);
    if (lk && !out[lk]) out[lk] = v;

    const t = v && typeof v === "object" ? v.title : "";
    const lt = normalizeAvailabilityKeyLoose(t);
    if (lt && !out[lt]) out[lt] = v;
  }
  return out;
}

function withLooseIndexes(data) {
  if (!data || typeof data !== "object") return data;
  const byTitle = data.byTitle && typeof data.byTitle === "object" ? data.byTitle : null;
  const byBase = data.byBase && typeof data.byBase === "object" ? data.byBase : null;
  return {
    ...data,
    byTitleLoose: buildLooseKeyIndex(byTitle),
    byBaseLoose: buildLooseKeyIndex(byBase)
  };
}

function availabilityBaseKeyFromTitle(title) {
  const s = normalizeAvailabilityKey(title);
  return s
    .replace(/\s*[\-:\/|]\s*(season|s|part|pt|vol|volume|cour|arc|chapter|final season|2nd|3rd|4th|5th|6th|7th|8th|9th|10th).*$/i, "")
    .replace(/\s+(season|s|part|pt|vol|volume|cour|arc)\s*\d+.*$/i, "")
    .replace(/\s+(?:the\s+)?(2nd|3rd|4th|5th|6th|7th|8th|9th|10th)\s+season.*$/i, "")
    .replace(/\s+the final season.*$/i, "")
    .replace(/\s+final.*$/i, "")
    .trim();
}

function loadSynopsisCache() {
  try {
    const raw = localStorage.getItem(SYNOPSIS_CACHE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function toPlainTextDescription(desc) {
  if (!desc) return "";
  const s = String(desc).replace(/<br\s*\/?\s*>/gi, "\n");
  try {
    if (typeof window !== "undefined" && window.DOMParser) {
      const doc = new window.DOMParser().parseFromString(s, "text/html");
      return (doc.body?.textContent || "").trim();
    }
  } catch {
    // fall through
  }
  return s.replace(/<[^>]*>/g, "").trim();
}

function truncateSynopsis(text, maxLen = 320) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (t.length <= maxLen) return t;
  return `${t.slice(0, Math.max(0, maxLen - 1)).trimEnd()}…`;
}

let manualSynopsisDbPromise = null;
async function loadManualSynopsisDb() {
  if (manualSynopsisDbPromise) return manualSynopsisDbPromise;
  manualSynopsisDbPromise = fetch("/synopsis_th.json")
    .then((r) => (r.ok ? r.json() : null))
    .then((json) => {
      const items = json?.items;
      const safeItems = items && typeof items === "object" ? items : {};

      // Some editors may add new items with a wrong key. Build an index by normalized
      // `entry.title` so lookups can still succeed.
      const byTitle = {};
      for (const entry of Object.values(safeItems)) {
        const primaryTitle = String(entry?.title || "").trim();
        const aliases = Array.isArray(entry?.aliases) ? entry.aliases : [];
        const candidateTitles = [primaryTitle, ...aliases]
          .map((x) => String(x || "").trim())
          .filter(Boolean);

        for (const t of candidateTitles) {
          const keys = synopsisKeyVariants(t);
          for (const k of keys) {
            if (!k || byTitle[k]) continue;
            byTitle[k] = entry;
          }
        }
      }
      return {
        items: safeItems,
        byTitle,
        version: Number(json?.version || 0) || 0,
        generatedAt: String(json?.generatedAt || "")
      };
    })
    .catch(() => ({ items: {}, byTitle: {}, version: 0, generatedAt: "" }));
  return manualSynopsisDbPromise;
}

async function fetchAniListSynopsis(searchTitle) {
  const title = String(searchTitle || "").trim();
  if (!title) {
    return { text: "", url: "", fetchedAt: Date.now(), miss: true, sourceVersion: 0, sourceGeneratedAt: "" };
  }

  const db = await loadManualSynopsisDb();
  const items = db?.items || {};
  const byTitle = db?.byTitle || {};
  const sourceVersion = Number(db?.version || 0) || 0;
  const sourceGeneratedAt = String(db?.generatedAt || "");
  const baseTitle = availabilityBaseKeyFromTitle(title) || title;
  const keysToTry = [...synopsisKeyVariants(title), ...synopsisKeyVariants(baseTitle)];

  let entry = null;
  for (const k of keysToTry) {
    entry = items?.[k] || byTitle?.[k] || null;
    if (entry) break;
  }
  const text = entry?.text ? truncateSynopsis(entry.text, 320) : "";
  return {
    text,
    url: "",
    fetchedAt: Date.now(),
    miss: !text,
    sourceVersion,
    sourceGeneratedAt
  };
}

export default function AnimeOPQuizStarter() {
  const [page, setPage] = useState("home");
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [answerMode, setAnswerMode] = useState("choice6");
  const [questionCount, setQuestionCount] = useState(5);
  const [playMode, setPlayMode] = useState("normal"); // normal | solo_challenge | group | time_attack_3m
  const [soloHp, setSoloHp] = useState(10);
  const [soloWrongMultiplier, setSoloWrongMultiplier] = useState(1);

  const LS_FAVORITES = "otoverse:favorites:v1";
  const LS_LOCAL_STATS = "otoverse:localstats:v1";
  const LS_DAILY = "otoverse:daily:v1";

  const [ruleAvoidSameGenre, setRuleAvoidSameGenre] = useState(true);
  const [ruleNoRepeatSeriesWindow, setRuleNoRepeatSeriesWindow] = useState(3); // 0 = ปิด

  const [sessionMode, setSessionMode] = useState("normal"); // normal | daily | favorites | anime | popular | room
  const [sessionDailyKey, setSessionDailyKey] = useState("");
  const [sessionRoomCode, setSessionRoomCode] = useState("");
  const [dailyLastResult, setDailyLastResult] = useState(() => readLocalJson(LS_DAILY, {}));

  const [favoriteIds, setFavoriteIds] = useState(() => {
    const arr = readLocalJson(LS_FAVORITES, []);
    return Array.isArray(arr) ? arr.map((x) => Number(x)).filter((n) => Number.isFinite(n)) : [];
  });
  const favoriteSet = useMemo(() => new Set((favoriteIds || []).filter((x) => x != null)), [favoriteIds]);

  const toggleFavoriteId = (animeId) => {
    const id = Number(animeId);
    if (!Number.isFinite(id)) return;
    setFavoriteIds((prev) => {
      const list = Array.isArray(prev) ? prev.slice() : [];
      const idx = list.indexOf(id);
      if (idx >= 0) {
        list.splice(idx, 1);
        return list;
      }
      list.unshift(id);
      return list.slice(0, 500);
    });
  };

  const [localStats, setLocalStats] = useState(() => {
    const raw = readLocalJson(LS_LOCAL_STATS, { byId: {} });
    const byId = raw && typeof raw === "object" && raw.byId && typeof raw.byId === "object" ? raw.byId : {};
    return { byId };
  });

  const normalizeIdList = (arr, max = 500) => {
    const list = Array.isArray(arr) ? arr : [];
    const out = [];
    const seen = new Set();
    for (const x of list) {
      const n = Number(x);
      if (!Number.isFinite(n)) continue;
      if (seen.has(n)) continue;
      seen.add(n);
      out.push(n);
      if (out.length >= max) break;
    }
    return out;
  };

  const isSameNumberArray = (a, b) => {
    const aa = Array.isArray(a) ? a : [];
    const bb = Array.isArray(b) ? b : [];
    if (aa.length !== bb.length) return false;
    for (let i = 0; i < aa.length; i += 1) {
      if (Number(aa[i]) !== Number(bb[i])) return false;
    }
    return true;
  };

  const normalizeStatsPayload = (payload) => {
    const byId = payload && typeof payload === "object" && payload.byId && typeof payload.byId === "object" ? payload.byId : {};
    const out = {};
    const entries = Object.entries(byId);
    for (const [k, v] of entries) {
      const key = String(k || "").trim();
      if (!key) continue;
      const obj = v && typeof v === "object" ? v : {};
      out[key] = {
        plays: Number(obj.plays || 0) || 0,
        correct: Number(obj.correct || 0) || 0,
        wrong: Number(obj.wrong || 0) || 0,
        timeMs: Number(obj.timeMs || 0) || 0,
        lastAt: Number(obj.lastAt || 0) || 0
      };
    }
    return { byId: out };
  };

  const mergeStats = (a, b) => {
    const aa = normalizeStatsPayload(a);
    const bb = normalizeStatsPayload(b);
    const out = { byId: { ...(aa.byId || {}) } };
    for (const [id, row] of Object.entries(bb.byId || {})) {
      const prev = out.byId[id] && typeof out.byId[id] === "object" ? out.byId[id] : {};
      const next = row && typeof row === "object" ? row : {};
      out.byId[id] = {
        plays: Math.max(Number(prev.plays || 0) || 0, Number(next.plays || 0) || 0),
        correct: Math.max(Number(prev.correct || 0) || 0, Number(next.correct || 0) || 0),
        wrong: Math.max(Number(prev.wrong || 0) || 0, Number(next.wrong || 0) || 0),
        timeMs: Math.max(Number(prev.timeMs || 0) || 0, Number(next.timeMs || 0) || 0),
        lastAt: Math.max(Number(prev.lastAt || 0) || 0, Number(next.lastAt || 0) || 0)
      };
    }
    return out;
  };

  const [runQuestionStats, setRunQuestionStats] = useState([]); // [{id, genre, seriesKey, correct, ms}]
  const [runMaxStreak, setRunMaxStreak] = useState(0);
  const [runCurrStreak, setRunCurrStreak] = useState(0);
  const questionStartedAtRef = useRef(0);
  const questionRecordedRef = useRef(false);
  const lastGenreRef = useRef("");
  const recentSeriesRef = useRef([]); // queue of seriesKey

  const [animeSeriesQuery, setAnimeSeriesQuery] = useState("");
  const [selectedSeriesKey, setSelectedSeriesKey] = useState("");
  const [roomCodeDraft, setRoomCodeDraft] = useState("");
  const [roomNotice, setRoomNotice] = useState("");
  const [groupSetupPlayers, setGroupSetupPlayers] = useState([]); // [{id,name}]
  const [groupPlayerName, setGroupPlayerName] = useState("");
  const [groupPlayers, setGroupPlayers] = useState([]); // [{id,name,hp,mult,score,eliminated}]
  const [groupCorrectPickId, setGroupCorrectPickId] = useState(""); // per-question correct picker
  const [groupTurnIndex, setGroupTurnIndex] = useState(0);
  const [groupWrongPickId, setGroupWrongPickId] = useState("");
  const [homeSetupOpen, setHomeSetupOpen] = useState(false);
  const [specialModesOpen, setSpecialModesOpen] = useState(false);
  const [gameList, setGameList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [playStartedAtMs, setPlayStartedAtMs] = useState(null);
  const [playElapsedMs, setPlayElapsedMs] = useState(0);
  const [aboutSection, setAboutSection] = useState(null);
  const [reportText, setReportText] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [reportNotice, setReportNotice] = useState("");

  const [videoReportOpen, setVideoReportOpen] = useState(false);
  const [videoReportSubject, setVideoReportSubject] = useState("");
  const [videoReportDetails, setVideoReportDetails] = useState("");
  const [videoReportBusy, setVideoReportBusy] = useState(false);
  const [videoReportNotice, setVideoReportNotice] = useState("");

  const [onlineRooms, setOnlineRooms] = useState([]);
  const [onlineRoomsError, setOnlineRoomsError] = useState("");
  const [onlineRoomId, setOnlineRoomId] = useState("");
  const [onlineRoom, setOnlineRoom] = useState(null);
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [onlineBusy, setOnlineBusy] = useState(false);
  const [onlineNotice, setOnlineNotice] = useState("");
  const [onlineNowMs, setOnlineNowMs] = useState(() => Date.now());
  const [onlineCreateName, setOnlineCreateName] = useState("");
  const [onlineCreateCode, setOnlineCreateCode] = useState("");
  const [onlineCreateGameMode, setOnlineCreateGameMode] = useState("standard");
  const [onlineCreateAnswerMode, setOnlineCreateAnswerMode] = useState("choice6");
  const [onlineCreateQuestionCount, setOnlineCreateQuestionCount] = useState(5);
  const [onlineCreatePerQuestionMs, setOnlineCreatePerQuestionMs] = useState(15000);
  const [onlineJoinCode, setOnlineJoinCode] = useState("");
  const [onlineTypingDraft, setOnlineTypingDraft] = useState("");
  const [onlineMessages, setOnlineMessages] = useState([]);
  const [onlineChatDraft, setOnlineChatDraft] = useState("");
  const [onlineLobbyRoomName, setOnlineLobbyRoomName] = useState("");
  const [onlineLobbyGameMode, setOnlineLobbyGameMode] = useState("standard");
  const [onlineLobbyAnswerMode, setOnlineLobbyAnswerMode] = useState("choice6");
  const [onlineLobbyQuestionCount, setOnlineLobbyQuestionCount] = useState(5);
  const [onlineLobbyPerQuestionMs, setOnlineLobbyPerQuestionMs] = useState(15000);
  const [onlineLobbyDirty, setOnlineLobbyDirty] = useState(false);
  const [onlineResultsOpen, setOnlineResultsOpen] = useState(false);
  const onlineCountdownStartRef = useRef({ roomId: "", endsAtMs: 0 });
  const onlineStartingRef = useRef(false);
  const onlinePlayersRef = useRef([]);
  const onlineFinishRef = useRef({ lastRoomId: "", lastStartMs: 0 });
  const onlineLobbyInitRef = useRef({ roomId: "", didInit: false });
  const onlineAutoAdvanceRef = useRef({ lastIdx: -1, lastStartMs: 0 });
  const onlineAdvancingRef = useRef(false);
  const isDark = true;
  const [libraryTab, setLibraryTab] = useState("catalog");
  const [libraryListMode, setLibraryListMode] = useState("works");
  const [legalSearch, setLegalSearch] = useState("");
  const [legalProviderFilter, setLegalProviderFilter] = useState("all");
  const [legalGenreFilter, setLegalGenreFilter] = useState("all");
  const [legalYearFilter, setLegalYearFilter] = useState("all");
  const [legalSelectedKey, setLegalSelectedKey] = useState("");
  const [synopsisCache, setSynopsisCache] = useState(() => loadSynopsisCache());
  const [synopsisLoading, setSynopsisLoading] = useState({});
  const [manualSynopsisDb, setManualSynopsisDb] = useState(null);
  const [providerIcons, setProviderIcons] = useState(null);
  const [legalAvailability, setLegalAvailability] = useState(null);
  const [legalCatalogTH, setLegalCatalogTH] = useState(null);
  const [legalBotMessages, setLegalBotMessages] = useState([]); // [{id, role:'user'|'bot', text, ts}]
  const [legalBotInput, setLegalBotInput] = useState("");
  const [legalBotOpen, setLegalBotOpen] = useState(false);
  const [songRequestBusy, setSongRequestBusy] = useState(false);
  const iframeRef = useRef(null);
  const playFocusRef = useRef(null);
  const playScrollKeyRef = useRef("");
  const usedAnimeIdsRef = useRef(new Set());
  const libraryLazyRef = useRef(new Set());
  const historyReadyRef = useRef(false);
  const appliedProfileSettingsRef = useRef(null);
  const legalBotScrollRef = useRef(null);

  const TIME_ATTACK_MS = 3 * 60 * 1000;

  const isNormalPlay = playMode === "normal";
  const isSoloChallenge = playMode === "solo_challenge";
  const isGroupMode = playMode === "group";
  const isTimeAttack = playMode === "time_attack_3m";

  const formatPlayElapsed = (ms) => {
    const totalSeconds = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const formatPlayElapsedThai = (ms) => {
    const totalSeconds = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} นาที ${seconds} วิ`;
  };

  const formatRemainingThai = (ms) => {
    const totalSeconds = Math.max(0, Math.ceil((Number(ms) || 0) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} นาที ${seconds} วิ`;
  };

  useEffect(() => {
    if (page !== "play") return;

    const startedAt = typeof playStartedAtMs === "number" ? playStartedAtMs : 0;
    if (!startedAt) return;

    const tick = () => {
      setPlayElapsedMs(Math.max(0, Date.now() - startedAt));
    };

    tick();
    const id = window.setInterval(tick, 1000);

    return () => {
      window.clearInterval(id);
      tick();
    };
  }, [page, playStartedAtMs]);

  useEffect(() => {
    if (page !== "play") return;
    if (!isTimeAttack) return;
    if (playElapsedMs < TIME_ATTACK_MS) return;
    setPage("result");
  }, [TIME_ATTACK_MS, isTimeAttack, page, playElapsedMs]);

  const makeLegalBotId = () => {
    try {
      if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    } catch {
      // ignore
    }
    return `m_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  };

  const appendLegalBotMessage = (role, text) => {
    const msg = {
      id: makeLegalBotId(),
      role,
      text: String(text || "").trim(),
      ts: Date.now()
    };
    if (!msg.text) return;
    setLegalBotMessages((prev) => [...(prev || []), msg]);
  };

  useEffect(() => {
    if (page !== "library" || libraryTab !== "legal") return;
    if (Array.isArray(legalBotMessages) && legalBotMessages.length) return;

    appendLegalBotMessage(
      "bot",
      "สวัสดี! ถามได้เลย เช่น “Jujutsu Kaisen ดูที่ไหน” หรือ “เพลง OP ของ Demon Slayer ฟังที่ไหน”"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, libraryTab]);

  useEffect(() => {
    if (page !== "library" || libraryTab !== "legal") {
      setLegalBotOpen(false);
    }
  }, [page, libraryTab]);

  useEffect(() => {
    if (page !== "library" || libraryTab !== "legal") return;
    const el = legalBotScrollRef.current;
    if (!el) return;
    try {
      el.scrollTop = el.scrollHeight;
    } catch {
      // ignore
    }
  }, [page, libraryTab, legalBotMessages]);

  const scrollPlayFocusToFit = (behavior) => {
    try {
      const el = playFocusRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight || 0;
      const absoluteTop = window.pageYOffset + rect.top;
      const padding = 16;
      const targetTop = rect.height > 0 && rect.height < vh
        ? absoluteTop - Math.max(padding, (vh - rect.height) / 2)
        : absoluteTop - padding;

      window.scrollTo({ top: Math.max(0, Math.round(targetTop)), behavior: behavior || "smooth" });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (page !== "play") {
      playScrollKeyRef.current = "";
      return;
    }

    const key = String(currentIndex);
    if (playScrollKeyRef.current === key) return;
    playScrollKeyRef.current = key;

    const prefersReduced = !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = prefersReduced ? "auto" : "smooth";
    const id = window.requestAnimationFrame(() => scrollPlayFocusToFit(behavior));
    return () => window.cancelAnimationFrame(id);
  }, [page, currentIndex]);

  useEffect(() => {
    if (!isGroupMode) return;
    if (groupSetupPlayers.length) return;
    const seed = Date.now();
    setGroupSetupPlayers([
      { id: `p-${seed}-1`, name: "ผู้เล่น 1" },
      { id: `p-${seed}-2`, name: "ผู้เล่น 2" }
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGroupMode]);

  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");

  const AUTH_PENDING_LINK_STORAGE_KEY = "otoverse_auth_pending_link_v1";
  const [pendingLink, setPendingLink] = useState(null);

  const persistPendingLink = (next) => {
    setPendingLink(next);
    try {
      if (!next) {
        sessionStorage.removeItem(AUTH_PENDING_LINK_STORAGE_KEY);
        return;
      }
      sessionStorage.setItem(AUTH_PENDING_LINK_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const readPersistedPendingLink = () => {
    try {
      const raw = sessionStorage.getItem(AUTH_PENDING_LINK_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      if (!parsed.credentialJson) return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const providerIdToThai = (providerId) => {
    const id = String(providerId || "");
    if (id === "google.com") return "Google";
    if (id === "github.com") return "GitHub";
    if (id === "password") return "อีเมล/รหัสผ่าน";
    return id || "ผู้ให้บริการเดิม";
  };

  const describeSignInMethodsThai = (methods) => {
    const unique = Array.from(new Set((methods || []).map((m) => String(m || "").trim()).filter(Boolean)));
    if (!unique.length) return "";
    return unique.map(providerIdToThai).join(" หรือ ");
  };

  const consumePendingLinkForUser = async (currentUser) => {
    if (!currentUser) return false;
    const pending = pendingLink || readPersistedPendingLink();
    if (!pending) return false;

    const pendingEmail = String(pending.email || "").trim().toLowerCase();
    const userEmail = String(currentUser.email || "").trim().toLowerCase();
    if (pendingEmail && userEmail && pendingEmail !== userEmail) {
      return false;
    }

    let credential;
    try {
      credential = OAuthProvider.credentialFromJSON(pending.credentialJson);
    } catch {
      credential = null;
    }
    if (!credential) {
      persistPendingLink(null);
      return false;
    }

    try {
      await linkWithCredential(currentUser, credential);
      persistPendingLink(null);
      return true;
    } catch (e) {
      const code = String(e?.code || "");
      if (code === "auth/provider-already-linked") {
        persistPendingLink(null);
        return true;
      }
      if (code === "auth/credential-already-in-use") {
        setAuthError("ไม่สามารถเชื่อมบัญชีได้: GitHub นี้ถูกใช้กับบัญชีอื่นแล้ว");
        return false;
      }
      setAuthError(firebaseErrorToThai(e));
      return false;
    }
  };

  useEffect(() => {
    const persisted = readPersistedPendingLink();
    if (persisted) setPendingLink(persisted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState("");
  const [profileMissing, setProfileMissing] = useState(false);
  const [profileFixBusy, setProfileFixBusy] = useState(false);
  const [profileNotice, setProfileNotice] = useState("");
  const [profileSaveBusy, setProfileSaveBusy] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState("");

  const [userPrivate, setUserPrivate] = useState(null);
  const [userPrivateError, setUserPrivateError] = useState("");
  const [userPrivateLoadedUid, setUserPrivateLoadedUid] = useState(null);
  const appliedUserPrivateRef = useRef(null);
  const favoritesSyncTimerRef = useRef(null);
  const statsSyncTimerRef = useRef(null);
  const publicFavoritesSyncTimerRef = useRef(null);
  const bestStreakSyncTimerRef = useRef(null);
  const bestStreakSentRef = useRef(0);

  const [favoritesPopupOpen, setFavoritesPopupOpen] = useState(false);
  const [favoritesPopupLabel, setFavoritesPopupLabel] = useState("เรื่องโปรด");
  const [favoritesPopupIds, setFavoritesPopupIds] = useState([]);

  const openFavoritesPopup = ({ label, ids } = {}) => {
    setFavoritesPopupLabel(String(label || "เรื่องโปรด"));
    setFavoritesPopupIds(Array.isArray(ids) ? ids : []);
    setFavoritesPopupOpen(true);
  };

  const [communitySearch, setCommunitySearch] = useState("");
  const [communityProfiles, setCommunityProfiles] = useState([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityError, setCommunityError] = useState("");

  const [postTitleDraft, setPostTitleDraft] = useState("");
  const [postBodyDraft, setPostBodyDraft] = useState("");
  const [postImageFile, setPostImageFile] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState("");
  const [postBusy, setPostBusy] = useState(false);
  const [postNotice, setPostNotice] = useState("");
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [postEditingId, setPostEditingId] = useState("");
  const [postStep, setPostStep] = useState(""); // uploading | saving | deleting
  const [postUploadPct, setPostUploadPct] = useState(0);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState("");

  const [activeCommentsPostId, setActiveCommentsPostId] = useState("");
  const [activeComments, setActiveComments] = useState([]);
  const [activeCommentsLoading, setActiveCommentsLoading] = useState(false);
  const [activeCommentsError, setActiveCommentsError] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);

  const likeBusyRef = useRef(new Set());
  const postOpRef = useRef(0);

  const [publicProfileOpen, setPublicProfileOpen] = useState(false);
  const [publicProfileUid, setPublicProfileUid] = useState("");
  const [publicProfile, setPublicProfile] = useState(null);
  const [publicProfileError, setPublicProfileError] = useState("");
  const [publicProfileFollowers, setPublicProfileFollowers] = useState(null);
  const [publicProfileBusy, setPublicProfileBusy] = useState(false);
  const [publicProfileNotice, setPublicProfileNotice] = useState("");

  const [chatOpen, setChatOpen] = useState(false);
  const [chatTargetUid, setChatTargetUid] = useState("");
  const [chatId, setChatId] = useState("");
  const [chatThreads, setChatThreads] = useState([]);
  const [chatThreadsLoading, setChatThreadsLoading] = useState(false);
  const [chatThreadsError, setChatThreadsError] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [chatDraft, setChatDraft] = useState("");
  const [chatBusy, setChatBusy] = useState(false);

  const [chatNotif, setChatNotif] = useState(null);
  const chatLastSeenRef = useRef(new Map());
  const chatNotifPrimedRef = useRef(false);

  const CHAT_READ_STORAGE_PREFIX = "otoverse_chat_read_v1:";
  const [chatReadMap, setChatReadMap] = useState({});
  const [chatThreadsAll, setChatThreadsAll] = useState([]);

  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardError, setLeaderboardError] = useState("");

  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarInputKey, setAvatarInputKey] = useState(0);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (!firebaseReady || !firebaseAuth) return;
    let unsub = () => {};
    let cancelled = false;

    (async () => {
      try {
        await firebaseAuthPersistenceReady;
      } catch {
        // ignore
      }

      if (cancelled) return;

      console.info("[firebase] init", {
        host: typeof window !== "undefined" ? window.location.host : "",
        projectId: firebaseProjectId || firebaseAuth?.app?.options?.projectId || ""
      });

      // If we previously fell back to redirect-based OAuth sign-in,
      // we must resolve the redirect result on app load.
      getRedirectResult(firebaseAuth)
        .then(async (result) => {
          if (!result?.user) return;
          await consumePendingLinkForUser(result.user).catch(() => {});
          setAuthOpen(false);
          setAuthPassword("");
          setAuthError("");
        })
        .catch((e) => {
          // Surface redirect errors in the auth modal.
          setAuthError(firebaseErrorToThai(e));
        });

      unsub = onAuthStateChanged(firebaseAuth, async (nextUser) => {
        console.info("[auth] state", {
          uid: nextUser?.uid || null,
          projectId: firebaseProjectId || firebaseAuth?.app?.options?.projectId || ""
        });

        setUser(nextUser || null);
        setAuthChecked(true);
        setProfileNotice("");
        if (nextUser) {
          const accountCreatedAt = (() => {
            try {
              const raw = nextUser?.metadata?.creationTime;
              if (!raw) return null;
              const d = new Date(raw);
              return Number.isFinite(d.getTime()) ? d : null;
            } catch {
              return null;
            }
          })();

          await consumePendingLinkForUser(nextUser).catch(() => {});
          await ensureProfile(nextUser.uid, {
            email: nextUser.email || "",
            displayName: nextUser.displayName || "",
            photoURL: nextUser.photoURL || undefined,
            accountCreatedAt
          }).catch(() => {});

          // Personal client-side data should sync across devices.
          await ensureUserPrivate(nextUser.uid).catch(() => {});
        } else {
          setProfile(null);
          setProfileOpen(false);
          setPublicProfileOpen(false);
          setChatOpen(false);
        }
      });
    })();

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setUserPrivate(null);
      setUserPrivateError("");
      setUserPrivateLoadedUid(null);
      appliedUserPrivateRef.current = null;

      bestStreakSentRef.current = 0;
      if (bestStreakSyncTimerRef.current) clearTimeout(bestStreakSyncTimerRef.current);
      return;
    }

    setUserPrivateError("");
    return subscribeUserPrivate(
      user.uid,
      (next) => {
        setUserPrivate(next);
        setUserPrivateLoadedUid(user.uid);
      },
      (err) => {
        const msg = String(err?.code || err?.message || "user_private_subscribe_failed");
        setUserPrivateError(msg);
        console.warn("subscribeUserPrivate failed:", err);
      }
    );
  }, [user?.uid]);

  // Persist best consecutive-correct streak (bestStreak) to profile (debounced).
  useEffect(() => {
    if (!user?.uid) return;
    if (isGroupMode) return;

    const uid = user.uid;
    const localBest = typeof profile?.bestStreak === "number" ? profile.bestStreak : 0;
    const next = Math.max(0, Math.floor(Number(runMaxStreak) || 0));
    if (next <= localBest) return;
    if (bestStreakSentRef.current >= next) return;

    bestStreakSentRef.current = next;
    if (bestStreakSyncTimerRef.current) clearTimeout(bestStreakSyncTimerRef.current);
    bestStreakSyncTimerRef.current = setTimeout(() => {
      updateProfileBestStreak(uid, next).then((r) => {
        if (r && r.ok === false) console.warn("updateProfileBestStreak failed:", r.error);
      });
    }, 1500);

    return () => {
      if (bestStreakSyncTimerRef.current) clearTimeout(bestStreakSyncTimerRef.current);
    };
  }, [runMaxStreak, user?.uid, profile?.bestStreak, isGroupMode]);

  // Initial reconcile: pull cloud favorites/localStats (private) or push local up.
  useEffect(() => {
    if (!user?.uid) return;
    const uid = user.uid;
    if (appliedUserPrivateRef.current === uid) return;
    if (userPrivateLoadedUid !== uid) return;

    const remoteFavs = normalizeIdList(userPrivate?.favorites || [], 500);
    const localFavs = normalizeIdList(favoriteIds || [], 500);
    const mergedFavs = normalizeIdList([...remoteFavs, ...localFavs], 500);

    if (!isSameNumberArray(localFavs, mergedFavs)) {
      setFavoriteIds(mergedFavs);
    }

    const remoteStats = userPrivate?.localStats;
    const mergedStats = mergeStats(localStats, remoteStats);
    const localStatsNorm = normalizeStatsPayload(localStats);
    const mergedStatsNorm = normalizeStatsPayload(mergedStats);
    const localStatsChanged = JSON.stringify(localStatsNorm) !== JSON.stringify(mergedStatsNorm);
    if (localStatsChanged) {
      setLocalStats(mergedStatsNorm);
    }

    // If cloud is missing anything we have locally, backfill once.
    const needsFavBackfill = !isSameNumberArray(remoteFavs, mergedFavs);
    const needsStatsBackfill = JSON.stringify(normalizeStatsPayload(remoteStats)) !== JSON.stringify(mergedStatsNorm);
    if (needsFavBackfill || needsStatsBackfill) {
      updateUserPrivate(uid, {
        favorites: mergedFavs,
        localStats: mergedStatsNorm
      }).catch(() => {});
    }

    appliedUserPrivateRef.current = uid;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, userPrivate?.favorites, userPrivate?.localStats, userPrivateLoadedUid]);

  // Ongoing reconcile: if another device updates cloud, merge it into local state (never decreases).
  useEffect(() => {
    if (!user?.uid) return;
    const uid = user.uid;
    if (appliedUserPrivateRef.current !== uid) return;
    if (userPrivateLoadedUid !== uid) return;

    const remoteFavs = normalizeIdList(userPrivate?.favorites || [], 500);
    const localFavs = normalizeIdList(favoriteIds || [], 500);
    const mergedFavs = normalizeIdList([...remoteFavs, ...localFavs], 500);
    if (!isSameNumberArray(localFavs, mergedFavs)) setFavoriteIds(mergedFavs);

    const mergedStatsNorm = normalizeStatsPayload(mergeStats(localStats, userPrivate?.localStats));
    const localStatsNorm = normalizeStatsPayload(localStats);
    if (JSON.stringify(localStatsNorm) !== JSON.stringify(mergedStatsNorm)) setLocalStats(mergedStatsNorm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, userPrivate?.favorites, userPrivate?.localStats, userPrivateLoadedUid]);

  // Cross-tab sync: reflect changes from other tabs immediately.
  useEffect(() => {
    const onStorage = (e) => {
      try {
        if (!e || e.storageArea !== window.localStorage) return;
        if (e.key === LS_FAVORITES) {
          const parsed = safeJsonParse(e.newValue);
          const next = normalizeIdList(parsed, 500);
          setFavoriteIds((prev) => (isSameNumberArray(prev, next) ? prev : next));
        }
        if (e.key === LS_LOCAL_STATS) {
          const parsed = safeJsonParse(e.newValue);
          const next = normalizeStatsPayload(parsed);
          setLocalStats((prev) => {
            const prevNorm = normalizeStatsPayload(prev);
            return JSON.stringify(prevNorm) === JSON.stringify(next) ? prev : next;
          });
        }
        if (e.key === LS_DAILY) {
          const parsed = safeJsonParse(e.newValue);
          setDailyLastResult((prev) => {
            const a = prev && typeof prev === "object" ? prev : {};
            const b = parsed && typeof parsed === "object" ? parsed : {};
            return JSON.stringify(a) === JSON.stringify(b) ? prev : b;
          });
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [LS_DAILY, LS_FAVORITES, LS_LOCAL_STATS]);

  // Persist favorites to private cloud doc (debounced) so they survive across devices.
  useEffect(() => {
    if (!user?.uid) return;
    if (appliedUserPrivateRef.current !== user.uid) return;

    const uid = user.uid;
    const next = normalizeIdList(favoriteIds || [], 500);
    const remote = normalizeIdList(userPrivate?.favorites || [], 500);
    const merged = normalizeIdList([...remote, ...next], 500);
    if (isSameNumberArray(merged, remote)) return;

    if (favoritesSyncTimerRef.current) clearTimeout(favoritesSyncTimerRef.current);
    favoritesSyncTimerRef.current = setTimeout(() => {
      updateUserPrivate(uid, { favorites: merged }).catch(() => {});
    }, 1200);

    return () => {
      if (favoritesSyncTimerRef.current) clearTimeout(favoritesSyncTimerRef.current);
    };
  }, [favoriteIds, user?.uid, userPrivate?.favorites]);

  // Persist favorites to public profile (debounced) so other users can see "เรื่องโปรด".
  useEffect(() => {
    if (!user?.uid) return;
    if (appliedUserPrivateRef.current !== user.uid) return;

    const uid = user.uid;
    const next = normalizeIdList(favoriteIds || [], 500);
    const remote = normalizeIdList(profile?.publicFavorites || [], 500);
    if (isSameNumberArray(next, remote)) return;

    if (publicFavoritesSyncTimerRef.current) clearTimeout(publicFavoritesSyncTimerRef.current);
    publicFavoritesSyncTimerRef.current = setTimeout(() => {
      updateProfilePublicFavorites(uid, next).then((r) => {
        if (r && r.ok === false) {
          // non-blocking notice; keep console for debugging
          console.warn("updateProfilePublicFavorites failed:", r.error);
        }
      });
    }, 1500);

    return () => {
      if (publicFavoritesSyncTimerRef.current) clearTimeout(publicFavoritesSyncTimerRef.current);
    };
  }, [favoriteIds, user?.uid, profile?.publicFavorites]);

  // Persist localStats to private cloud doc (debounced) so "ยอดนิยมของคุณ" ไม่หายข้ามอุปกรณ์.
  useEffect(() => {
    if (!user?.uid) return;
    if (appliedUserPrivateRef.current !== user.uid) return;

    const uid = user.uid;
    const next = normalizeStatsPayload(localStats);
    const remote = normalizeStatsPayload(userPrivate?.localStats);
    const merged = normalizeStatsPayload(mergeStats(next, userPrivate?.localStats));
    if (JSON.stringify(merged) === JSON.stringify(remote)) return;

    if (statsSyncTimerRef.current) clearTimeout(statsSyncTimerRef.current);
    statsSyncTimerRef.current = setTimeout(() => {
      updateUserPrivate(uid, { localStats: merged }).catch(() => {});
    }, 5000);

    return () => {
      if (statsSyncTimerRef.current) clearTimeout(statsSyncTimerRef.current);
    };
  }, [localStats, user?.uid, userPrivate?.localStats]);

  useEffect(() => {
    if (!user?.uid) return;

    const uid = user.uid;
    let alive = true;

    setUserPresence(uid, { online: true }).catch(() => {});

    const beat = setInterval(() => {
      if (!alive) return;
      touchUserPresence(uid).catch(() => {});
    }, 60_000);

    const onVisibility = () => {
      if (!alive) return;
      if (document.visibilityState === "hidden") {
        setUserPresence(uid, { online: false }).catch(() => {});
      } else {
        setUserPresence(uid, { online: true }).catch(() => {});
      }
    };

    const onBeforeUnload = () => {
      try {
        setUserPresence(uid, { online: false });
      } catch {
        // ignore
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      alive = false;
      clearInterval(beat);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onBeforeUnload);
      setUserPresence(uid, { online: false }).catch(() => {});
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!firebaseReady) return;
    if (!authChecked) return;
    if (user) return;
    setAuthOpen(true);
  }, [firebaseReady, authChecked, user]);

  const loginGateState = !firebaseReady ? "firebase" : !authChecked ? "checking" : !user ? "login" : "ok";

  const headerAvatarUrl = profile?.photoURL || user?.photoURL || "";

  useEffect(() => {
    if (page === "online") return;
    if (user?.uid && onlineRoomId) {
      leaveOnlineRoom({ roomId: onlineRoomId, uid: user.uid }).catch(() => {});
    }
    setOnlineRoomId("");
    setOnlineRoom(null);
    setOnlinePlayers([]);
    setOnlineMessages([]);
    setOnlineChatDraft("");
    setOnlineLobbyRoomName("");
    setOnlineLobbyGameMode("standard");
    setOnlineLobbyAnswerMode("choice6");
    setOnlineLobbyQuestionCount(5);
    setOnlineLobbyPerQuestionMs(15000);
    setOnlineLobbyDirty(false);
    setOnlineResultsOpen(false);
    onlineFinishRef.current = { lastRoomId: "", lastStartMs: 0 };
    onlineLobbyInitRef.current = { roomId: "", didInit: false };
    setOnlineRooms([]);
    setOnlineRoomsError("");
    setOnlineNotice("");
    setOnlineBusy(false);
    onlineAutoAdvanceRef.current = { lastIdx: -1, lastStartMs: 0 };
    onlineAdvancingRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);



  useEffect(() => {
    if (page !== "online") return;
    if (!user?.uid) return;

    setOnlineRoomsError("");
    return subscribeOnlineRooms(
      { max: 25 },
      (rows) => setOnlineRooms(Array.isArray(rows) ? rows : []),
      (err) => {
        const msg = String(err?.code || err?.message || "rooms_subscribe_failed");
        setOnlineRoomsError(msg);
      }
    );
  }, [page, user?.uid]);

  useEffect(() => {
    if (page !== "online") return;
    if (!onlineRoomId) {
      setOnlineRoom(null);
      setOnlinePlayers([]);
      setOnlineMessages([]);
      return;
    }

    setOnlineNotice("");
    const unsubRoom = subscribeRoom(
      onlineRoomId,
      (r) => setOnlineRoom(r),
      (err) => {
        const msg = String(err?.code || err?.message || "room_subscribe_failed");
        setOnlineNotice(msg);
      }
    );
    const unsubPlayers = subscribeRoomPlayers(
      onlineRoomId,
      (rows) => setOnlinePlayers(Array.isArray(rows) ? rows : []),
      (err) => {
        const msg = String(err?.code || err?.message || "players_subscribe_failed");
        setOnlineNotice(msg);
      }
    );

    return () => {
      unsubRoom();
      unsubPlayers();
    };
  }, [page, onlineRoomId]);

  useEffect(() => {
    if (page !== "online") return;
    if (!onlineRoomId) {
      setOnlineMessages([]);
      return;
    }

    return subscribeRoomMessages(
      { roomId: onlineRoomId, max: 50 },
      (rows) => setOnlineMessages(Array.isArray(rows) ? rows : []),
      (err) => {
        const msg = String(err?.code || err?.message || "messages_subscribe_failed");
        setOnlineNotice(msg);
      }
    );
  }, [page, onlineRoomId]);

  useEffect(() => {
    if (page !== "online") return;
    if (!onlineRoomId || !onlineRoom) return;
    if (String(onlineRoom.status || "") !== "finished") return;
    if (String(onlineRoom.gameMode || "standard") !== "battle_royale") return;
    setOnlineResultsOpen(true);
  }, [page, onlineRoomId, onlineRoom?.status, onlineRoom?.gameMode]);

  useEffect(() => {
    if (page !== "online") return;
    setOnlineTypingDraft("");
  }, [page, onlineRoomId, onlineRoom?.questionIndex]);

  useEffect(() => {
    onlinePlayersRef.current = Array.isArray(onlinePlayers) ? onlinePlayers : [];
  }, [onlinePlayers]);

  useEffect(() => {
    if (page !== "online") return;
    if (!onlineRoomId) return;
    if (onlineLobbyInitRef.current.roomId !== onlineRoomId) {
      onlineLobbyInitRef.current = { roomId: onlineRoomId, didInit: false };
      setOnlineLobbyDirty(false);
    }
  }, [page, onlineRoomId]);

  useEffect(() => {
    if (page !== "online") return;
    if (!user?.uid) return;
    if (!onlineRoomId || !onlineRoom) return;
    if (String(onlineRoom.status || "") !== "lobby") return;
    if (String(onlineRoom.hostUid || "") !== String(user.uid)) return;
    if (onlineLobbyDirty) return;

    if (!onlineLobbyInitRef.current.didInit) {
      setOnlineLobbyRoomName(String(onlineRoom.roomName || "ห้องออนไลน์"));
      setOnlineLobbyGameMode(String(onlineRoom.gameMode || "standard"));
      setOnlineLobbyAnswerMode(String(onlineRoom.answerMode || "choice6"));
      setOnlineLobbyQuestionCount(Math.max(1, Math.min(20, Math.floor(Number(onlineRoom.questionCount) || 5))));
      setOnlineLobbyPerQuestionMs(Math.max(5_000, Math.min(60_000, Math.floor(Number(onlineRoom.perQuestionMs) || 15_000))));
      onlineLobbyInitRef.current = { roomId: onlineRoomId, didInit: true };
    }
  }, [
    page,
    user?.uid,
    onlineRoomId,
    onlineRoom?.status,
    onlineRoom?.hostUid,
    onlineRoom?.roomName,
    onlineRoom?.gameMode,
    onlineRoom?.answerMode,
    onlineRoom?.questionCount,
    onlineRoom?.perQuestionMs,
    onlineLobbyDirty
  ]);

  useEffect(() => {
    if (!profileOpen) {
      setNicknameDraft("");
      return;
    }
    const inferred = String(profile?.nickname || user?.displayName || (user?.email || "").split("@")[0] || "").trim();
    setNicknameDraft(inferred);
  }, [profileOpen, profile?.nickname, user?.displayName, user?.email]);

  useEffect(() => {
    if (!user?.uid) return;
    setProfileError("");
    return subscribeProfile(
      user.uid,
      (nextProfile) => {
        setProfile(nextProfile);
        setProfileMissing(!nextProfile);
      },
      (err) => {
        const msg = String(err?.code || err?.message || "profile_subscribe_failed");
        setProfileError(msg);
        console.warn("subscribeProfile failed:", err);
      }
    );
  }, [user?.uid]);

  const repairProfile = async () => {
    if (!user?.uid) return;
    setProfileFixBusy(true);
    setProfileNotice("");
    setProfileError("");
    try {
      const accountCreatedAt = (() => {
        try {
          const raw = user?.metadata?.creationTime;
          if (!raw) return null;
          const d = new Date(raw);
          return Number.isFinite(d.getTime()) ? d : null;
        } catch {
          return null;
        }
      })();

      await ensureProfile(user.uid, {
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || undefined,
        accountCreatedAt
      });
      setProfileNotice("สร้าง/ซ่อมโปรไฟล์เรียบร้อยแล้ว");
    } catch (e) {
      const msg = String(e?.code || e?.message || "ensureProfile_failed");
      setProfileError(msg);
      setProfileNotice(`สร้าง/ซ่อมโปรไฟล์ไม่สำเร็จ (${msg})`);
      console.warn("ensureProfile failed:", e);
    } finally {
      setProfileFixBusy(false);
    }
  };

  useEffect(() => {
    if (!firebaseReady) return;
    if (!user?.uid) {
      setLeaderboard([]);
      setLeaderboardError("");
      return;
    }
    setLeaderboardError("");
    return subscribeLeaderboard(
      { max: 25 },
      (rows) => {
        const normalized = (rows || []).map((r) => ({
          ...r,
          playCount: typeof r?.playCount === "number" ? r.playCount : 0,
          totalScore: typeof r?.totalScore === "number" ? r.totalScore : 0,
          bestStreak: typeof r?.bestStreak === "number" ? r.bestStreak : 0
        }));

        normalized.sort((a, b) => {
          if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
          return b.playCount - a.playCount;
        });

        setLeaderboard(normalized.slice(0, 10));
      },
      (err) => {
        const msg = String(err?.code || err?.message || "leaderboard_subscribe_failed");
        setLeaderboardError(msg);
      }
    );
  }, [firebaseReady, user?.uid]);

  useEffect(() => {
    if (!user?.uid || !profile?.settings) return;
    if (appliedProfileSettingsRef.current === user.uid) return;
    const s = profile.settings || {};
    if (typeof s.defaultAnswerMode === "string" && s.defaultAnswerMode) setAnswerMode(s.defaultAnswerMode);
    if (typeof s.defaultQuestionCount === "number" && Number.isFinite(s.defaultQuestionCount)) setQuestionCount(s.defaultQuestionCount);
    appliedProfileSettingsRef.current = user.uid;
  }, [user?.uid, profile?.settings]);

  useEffect(() => {
    if (user?.uid) return;
    appliedProfileSettingsRef.current = null;
  }, [user?.uid]);

  const formatProfileDate = (ts) => {
    try {
      const date = (() => {
        if (!ts) return null;
        if (typeof ts?.toDate === "function") return ts.toDate(); // Firestore Timestamp
        if (ts instanceof Date) return ts;
        if (typeof ts === "number" && Number.isFinite(ts)) return new Date(ts);
        return null;
      })();
      if (!date) return "-";
      return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(date);
    } catch {
      return "-";
    }
  };

  const firebaseErrorToThai = (err) => {
    const code = String(err?.code || "");
    if (code === "auth/email-already-in-use") return "อีเมลนี้ถูกใช้แล้ว";
    if (code === "auth/invalid-email") return "รูปแบบอีเมลไม่ถูกต้อง";
    if (code === "auth/weak-password") return "รหัสผ่านสั้นเกินไป (ควรอย่างน้อย 6 ตัวอักษร)";
    if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
    if (code === "auth/popup-closed-by-user") return "ปิดหน้าต่างล็อกอินก่อนเสร็จ";
    if (code === "auth/popup-blocked") return "บราวเซอร์บล็อกหน้าต่างล็อกอิน (popup) — ลองอนุญาต popup หรือระบบจะพาไปล็อกอินแบบ redirect";
    if (code === "auth/cancelled-popup-request") return "มีการร้องขอ popup ซ้อนกัน (ลองกดใหม่อีกครั้ง)";
    if (code === "auth/popup-timeout") return "หน้าต่างล็อกอินค้าง/ใช้เวลานานเกินไป — ลองใหม่หรือเปลี่ยนบราวเซอร์ (Safari บางเครื่องอาจต้องใช้ redirect)";
    if (code === "auth/network-request-failed") return "เครือข่ายมีปัญหา/ถูกบล็อก (ลองปิด adblock, เปลี่ยนเครือข่าย, หรือเปิดผ่าน Chrome/Safari ปกติ)";
    if (code === "auth/web-storage-unsupported") return "บราวเซอร์ปิดการใช้งาน storage (โหมดส่วนตัว/ตั้งค่าความเป็นส่วนตัวสูง) ทำให้ล็อกอินไม่ได้";
    if (code === "auth/argument-error") return "ล็อกอิน Google/GitHub ไม่ได้ในสภาพแวดล้อมนี้ (ข้อจำกัดบราวเซอร์/โหมดความเป็นส่วนตัว) — ลองเปิดด้วย Chrome/Safari ปกติ หรือออกจากโหมดส่วนตัว/in-app browser";
    if (code === "auth/invalid-oauth-client-id") return "ตั้งค่า OAuth ไม่ถูกต้อง (Client ID) — ต้องตั้งค่าในผู้ให้บริการ (Google/GitHub) ให้ถูก";
    if (code === "auth/unauthorized-domain") {
      const host = (() => {
        try {
          return window?.location?.hostname ? String(window.location.hostname) : "";
        } catch {
          return "";
        }
      })();
      return `โดเมนนี้ยังไม่ได้รับอนุญาตใน Firebase Auth (Authentication → Settings → Authorized domains)${host ? `: ${host}` : ""}`;
    }
    if (code === "auth/operation-not-allowed") return "ยังไม่ได้เปิดใช้งานผู้ให้บริการล็อกอินนี้ใน Firebase Authentication";
    if (code === "auth/account-exists-with-different-credential") return "บัญชีนี้เคยสมัครด้วยวิธีอื่น (ลองใช้อีเมล/ผู้ให้บริการเดิม)";

    const extra = (() => {
      const c = String(err?.code || "").trim();
      if (c) return ` (${c})`;
      const m = String(err?.message || "").trim();
      if (m) return ` (${m})`;
      return "";
    })();
    return `เกิดข้อผิดพลาดในการล็อกอิน${extra}`;
  };

  const firestoreErrorToThai = (codeOrMessage) => {
    const raw = String(codeOrMessage || "");
    const lower = raw.toLowerCase();
    if (lower.includes("permission-denied") || lower.includes("missing or insufficient permissions")) {
      return "สิทธิ์ไม่พอ (Firestore Rules ไม่อนุญาต)";
    }
    if (lower.includes("unauthenticated") || lower.includes("requires an authenticated user")) {
      return "ต้องล็อกอินก่อน";
    }
    if (lower.includes("unavailable") || lower.includes("failed to get document") || lower.includes("network")) {
      return "เครือข่าย/เซิร์ฟเวอร์มีปัญหา ลองใหม่อีกครั้ง";
    }
    if (lower.includes("invalid-argument")) {
      return "ข้อมูลที่ส่งไม่ถูกต้อง";
    }
    return "แชทมีปัญหา";
  };

  const storageErrorToThai = (err) => {
    const code = String(err?.code || "");
    const msg = String(err?.message || err || "");
    const raw = code || msg;
    const lower = raw.toLowerCase();

    if (raw === "invalid_file_type" || raw === "not_image") return "กรุณาเลือกไฟล์รูปภาพเท่านั้น";
    if (raw === "firebase_not_ready") return "ยังไม่ได้ตั้งค่า Firebase";
    if (raw === "missing_uid") return "ยังไม่ได้ล็อกอิน";
    if (raw === "missing_file") return "กรุณาเลือกไฟล์ก่อน";
    if (raw === "decode_failed") return "อ่านไฟล์รูปไม่สำเร็จ (ลองเปลี่ยนรูป/เปลี่ยนเบราว์เซอร์)";
    if (raw === "read_failed") return "อ่านไฟล์ไม่สำเร็จ (ลองใหม่อีกครั้ง)";
    if (raw === "canvas_failed") return "เบราว์เซอร์นี้ไม่รองรับการแปลงรูป";
    if (raw === "encode_failed") return "บีบอัด/แปลงรูปไม่สำเร็จ (ลองอัปเดต/เปลี่ยนเบราว์เซอร์)";
    if (raw === "upload_canceled") return "ยกเลิกการอัปโหลดแล้ว";
    if (raw === "upload_timeout") return "อัปโหลดนานเกินไป ลองใหม่อีกครั้ง";
    if (raw === "image_too_large") return "รูปใหญ่เกินไป ลองใช้รูปที่เล็กลง/ครอปก่อน";

    if (code === "storage/unauthenticated" || lower.includes("unauthenticated")) return "ต้องล็อกอินก่อนจึงจะอัปโหลดรูปได้";
    if (code === "storage/unauthorized" || lower.includes("permission") || lower.includes("unauthorized")) {
      return "อัปโหลดไม่ได้ (Firebase Storage Rules ไม่อนุญาต)";
    }
    if (code === "storage/canceled" || lower.includes("canceled")) return "ยกเลิกการอัปโหลดแล้ว";
    if (code === "storage/retry-limit-exceeded" || lower.includes("retry")) return "อัปโหลดไม่สำเร็จ (ลองใหม่อีกครั้ง)";
    if (code === "storage/quota-exceeded" || lower.includes("quota")) return "โควต้า Firebase Storage เต็ม";
    if (code === "storage/unknown" || lower.includes("storage")) {
      return "อัปโหลดรูปไม่สำเร็จ (อาจยังไม่ได้เปิด Firebase Storage หรือมีปัญหาการเชื่อมต่อ)";
    }

    return "อัปโหลดรูปไม่สำเร็จ";
  };

  const handleEmailAuth = async () => {
    if (!firebaseReady || !firebaseAuth) {
      setAuthError("ยังไม่ได้ตั้งค่า Firebase");
      return;
    }
    setAuthError("");
    setAuthBusy(true);
    try {
      const email = authEmail.trim();
      const cred =
        authMode === "signup"
          ? await createUserWithEmailAndPassword(firebaseAuth, email, authPassword)
          : await signInWithEmailAndPassword(firebaseAuth, email, authPassword);

      await consumePendingLinkForUser(cred.user).catch(() => {});
      setAuthOpen(false);
      setAuthPassword("");
    } catch (e) {
      setAuthError(firebaseErrorToThai(e));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleOAuth = async (providerKey) => {
    if (!firebaseReady || !firebaseAuth) {
      setAuthError("ยังไม่ได้ตั้งค่า Firebase");
      return;
    }

    const canUseSessionStorage = () => {
      try {
        const k = "__otoverse_auth_ss_test";
        window.sessionStorage.setItem(k, "1");
        window.sessionStorage.removeItem(k);
        return true;
      } catch {
        return false;
      }
    };

    setAuthError("");
    setAuthBusy(true);
    try {
      const provider = providerKey === "google" ? new GoogleAuthProvider() : new GithubAuthProvider();

      // Redirect flow requires sessionStorage to keep state across navigation.
      // If storage is blocked (common in some in-app browsers / strict privacy modes),
      // Google/GitHub OAuth cannot complete reliably.
      if (!canUseSessionStorage()) {
        setAuthError("บราวเซอร์บล็อก sessionStorage ทำให้ล็อกอิน Google/GitHub ไม่ได้ — ลองเปิดด้วย Chrome/Safari ปกติ (ไม่ใช่โหมดส่วนตัว/ไม่ใช่ in-app browser) หรือใช้ล็อกอินด้วยอีเมล/รหัสผ่านแทน");
        return;
      }

      // Redirect-only OAuth: more reliable across browsers (especially iOS/Safari and strict privacy modes).
      await signInWithRedirect(firebaseAuth, provider);
      return;
    } catch (e) {
      const code = String(e?.code || "");
      console.warn("[auth] oauth failed", {
        providerKey,
        code,
        message: String(e?.message || "")
      });

      if (code === "auth/account-exists-with-different-credential") {
        const email = String(e?.customData?.email || "").trim();
        const credential = providerKey === "google" ? GoogleAuthProvider.credentialFromError(e) : GithubAuthProvider.credentialFromError(e);
        const methods = email ? await fetchSignInMethodsForEmail(firebaseAuth, email).catch(() => []) : [];

        const credentialJson = credential?.toJSON ? credential.toJSON() : null;

        if (credentialJson && email) {
          persistPendingLink({
            email,
            methods,
            createdAt: Date.now(),
            credentialJson
          });
        }

        const methodsText = describeSignInMethodsThai(methods);
        if (methods.includes("google.com")) {
          setAuthError(
            `อีเมลนี้เคยสมัครด้วย ${methodsText || "Google"} — ให้กดปุ่ม “เข้าสู่ระบบด้วย Google” ก่อน แล้วระบบจะเชื่อม GitHub ให้อัตโนมัติ`
          );
          return;
        }
        if (methods.includes("password")) {
          setAuthError(
            `อีเมลนี้เคยสมัครด้วย ${methodsText || "อีเมล/รหัสผ่าน"} — ให้เข้าสู่ระบบด้วยอีเมล/รหัสผ่านเดิมก่อน แล้วระบบจะเชื่อม GitHub ให้อัตโนมัติ`
          );
          return;
        }

        setAuthError(
          `อีเมลนี้เคยสมัครด้วยวิธีอื่น${methodsText ? ` (${methodsText})` : ""} — ให้ล็อกอินด้วยวิธีเดิมก่อน แล้วค่อยเชื่อม GitHub`
        );
        return;
      }

      setAuthError(firebaseErrorToThai(e));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = async () => {
    if (!firebaseAuth) return;

    const ok = window.confirm("ยืนยันออกจากระบบใช่ไหม?");
    if (!ok) return;
    await signOut(firebaseAuth).catch(() => {});
    setProfileOpen(false);
  };

  const saveProfileSettings = async () => {
    if (!user?.uid) return;
    setProfileNotice("");
    setProfileSaveBusy(true);
    try {
      const tasks = [
        updateProfileSettings(user.uid, {
          defaultAnswerMode: answerMode,
          defaultQuestionCount: Number(questionCount) || 5
        })
      ];

      const nextNick = String(nicknameDraft || "")
        .trim()
        .slice(0, 14);
      const prevNick = String(profile?.nickname || "")
        .trim()
        .slice(0, 14);
      if (nextNick !== prevNick) tasks.push(updateProfileNickname(user.uid, nextNick));

      await Promise.all(tasks);
      setProfileNotice("บันทึกแล้ว");
    } catch (e) {
      const msg = String(e?.code || e?.message || "save_failed");
      setProfileNotice(`บันทึกไม่สำเร็จ (${msg})`);
      console.warn("saveProfileSettings failed:", e);
    } finally {
      setProfileSaveBusy(false);
    }
  };

  const openPublicProfile = (uid) => {
    const nextUid = String(uid || "").trim();
    if (!nextUid) return;
    setPublicProfileNotice("");
    setPublicProfileError("");
    setPublicProfileFollowers(null);
    setPublicProfile(null);
    setPublicProfileUid(nextUid);
    setPublicProfileOpen(true);
  };

  useEffect(() => {
    if (!publicProfileOpen || !publicProfileUid) return;
    setPublicProfileError("");
    setPublicProfileNotice("");
    setPublicProfileFollowers(null);

    const unsub = subscribeProfile(
      publicProfileUid,
      (p) => {
        setPublicProfile(p);
      },
      (err) => {
        const msg = String(err?.code || err?.message || "public_profile_subscribe_failed");
        setPublicProfileError(msg);
      }
    );

    getFollowersCount(publicProfileUid)
      .then((n) => setPublicProfileFollowers(typeof n === "number" ? n : 0))
      .catch(() => setPublicProfileFollowers(null));

    return () => unsub();
  }, [publicProfileOpen, publicProfileUid]);

  useEffect(() => {
    if (publicProfileOpen) return;
    setPublicProfileUid("");
    setPublicProfile(null);
    setPublicProfileError("");
    setPublicProfileFollowers(null);
    setPublicProfileBusy(false);
    setPublicProfileNotice("");
  }, [publicProfileOpen]);

  const publicIsFollowing = Boolean(
    user?.uid &&
      publicProfileUid &&
      user.uid !== publicProfileUid &&
      Array.isArray(profile?.following) &&
      profile.following.includes(publicProfileUid)
  );

  const toggleFollowPublicProfile = async () => {
    if (!user?.uid) return;
    if (!publicProfileUid || user.uid === publicProfileUid) return;
    setPublicProfileNotice("");
    setPublicProfileBusy(true);
    try {
      const res = publicIsFollowing
        ? await unfollowUser(user.uid, publicProfileUid)
        : await followUser(user.uid, publicProfileUid);
      if (res && res.ok === false) throw new Error(res.error || "follow_failed");

      const count = await getFollowersCount(publicProfileUid).catch(() => null);
      setPublicProfileFollowers(typeof count === "number" ? count : null);
      setPublicProfileNotice(publicIsFollowing ? "เลิกติดตามแล้ว" : "ติดตามแล้ว");
    } catch (e) {
      const msg = String(e?.message || e?.code || "follow_failed");
      setPublicProfileNotice(`ทำรายการไม่สำเร็จ (${msg})`);
      console.warn("toggleFollow failed:", e);
    } finally {
      setPublicProfileBusy(false);
    }
  };

  useEffect(() => {
    if (page !== "community") return;
    setCommunityError("");
    setCommunityLoading(true);
    const unsub = subscribeCommunityProfiles(
      { max: 200 },
      (rows) => {
        setCommunityProfiles(Array.isArray(rows) ? rows : []);
        setCommunityLoading(false);
      },
      (err) => {
        const msg = String(err?.code || err?.message || "community_subscribe_failed");
        setCommunityError(msg);
        setCommunityLoading(false);
      }
    );
    return () => unsub();
  }, [page]);

  useEffect(() => {
    if (page !== "community") return;
    setPostsError("");
    setPostsLoading(true);
    const unsub = subscribePosts(
      { max: 50 },
      (rows) => {
        setPosts(Array.isArray(rows) ? rows : []);
        setPostsLoading(false);
      },
      (err) => {
        const msg = String(err?.code || err?.message || "posts_subscribe_failed");
        setPostsError(msg);
        setPostsLoading(false);
      }
    );
    return () => unsub();
  }, [page]);

  useEffect(() => {
    if (page !== "community") return;
    if (!activeCommentsPostId) {
      setActiveComments([]);
      setActiveCommentsError("");
      setActiveCommentsLoading(false);
      return;
    }

    setActiveCommentsError("");
    setActiveCommentsLoading(true);
    const unsub = subscribeComments(
      activeCommentsPostId,
      { max: 50 },
      (rows) => {
        setActiveComments(Array.isArray(rows) ? rows : []);
        setActiveCommentsLoading(false);
      },
      (err) => {
        const msg = String(err?.code || err?.message || "comments_subscribe_failed");
        setActiveCommentsError(msg);
        setActiveCommentsLoading(false);
      }
    );

    return () => unsub();
  }, [page, activeCommentsPostId]);

  useEffect(() => {
    if (page !== "community") return;
    return () => {
      if (postImagePreview && String(postImagePreview).startsWith("blob:")) URL.revokeObjectURL(postImagePreview);
    };
  }, [page, postImagePreview]);

  const formatTs = (ts) => {
    if (!ts) return "";
    try {
      const d = typeof ts?.toDate === "function" ? ts.toDate() : ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
      if (!d || Number.isNaN(d.getTime())) return "";
      return d.toLocaleString();
    } catch {
      return "";
    }
  };

  const tsToMs = (ts) => {
    if (!ts) return 0;
    try {
      if (typeof ts?.toDate === "function") return ts.toDate().getTime();
      if (typeof ts?.seconds === "number") return ts.seconds * 1000;
      const d = new Date(ts);
      return Number.isNaN(d.getTime()) ? 0 : d.getTime();
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    if (page !== "online") return;
    if (!user?.uid) return;
    if (!onlineRoomId || !onlineRoom) return;
    if (String(onlineRoom.status || "") !== "playing") return;
    if (String(onlineRoom.hostUid || "") !== String(user.uid)) return;

    const perMs = Math.max(5000, Math.min(60000, Number(onlineRoom.perQuestionMs) || 15000));
    const gameMode = String(onlineRoom.gameMode || "standard");

    const tick = async () => {
      if (gameMode === "battle_royale") {
        const rows = Array.isArray(onlinePlayersRef.current) ? onlinePlayersRef.current : [];
        const alive = rows.filter((p) => (p?.eliminated === true ? false : Math.max(0, Math.floor(Number(p?.hp) || 15)) > 0)).length;
        const startedMsRoom = tsToMs(onlineRoom.startedAt);
        if (alive <= 1 && startedMsRoom) {
          if (onlineFinishRef.current.lastRoomId === onlineRoomId && onlineFinishRef.current.lastStartMs === startedMsRoom) return;
          onlineFinishRef.current = { lastRoomId: onlineRoomId, lastStartMs: startedMsRoom };
          finishOnlineRoomGame({ roomId: onlineRoomId, hostUid: user.uid }).catch(() => {});
          return;
        }
      }

      const startedMs = tsToMs(onlineRoom.questionStartedAt);
      const idx = Math.max(0, Math.floor(Number(onlineRoom.questionIndex) || 0));
      if (!startedMs) return;

      const elapsed = Date.now() - startedMs;
      if (elapsed < perMs) return;

      if (onlineAutoAdvanceRef.current.lastIdx === idx && onlineAutoAdvanceRef.current.lastStartMs === startedMs) return;

      if (onlineAdvancingRef.current) return;
      onlineAdvancingRef.current = true;

      onlineAutoAdvanceRef.current = { lastIdx: idx, lastStartMs: startedMs };

      try {
        if (gameMode === "battle_royale") {
          const correctId = Array.isArray(onlineRoom.questions) ? Number(onlineRoom.questions[idx]) : NaN;
          const rows = Array.isArray(onlinePlayersRef.current) ? onlinePlayersRef.current : [];
          const pending = rows
            .filter((p) => {
              if (!p?.id) return false;
              if (p?.eliminated === true) return false;
              const hp = Math.max(0, Math.floor(Number(p?.hp) || 15));
              if (hp <= 0) return false;
              const answeredAtIndex = Math.floor(Number(p?.answeredAtIndex) || -1);
              return answeredAtIndex !== idx;
            })
            .map((p) =>
              submitOnlineAnswer({
                roomId: onlineRoomId,
                uid: String(p.id),
                questionIndex: idx,
                pickId: -1,
                correctId: Number.isFinite(correctId) ? correctId : 0,
                points: 1
              }).catch(() => {})
            );
          await Promise.all(pending);
        }

        await advanceOnlineRoomQuestion({ roomId: onlineRoomId, hostUid: user.uid });
      } catch {
        // ignore
      } finally {
        onlineAdvancingRef.current = false;
      }
    };

    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [
    page,
    user?.uid,
    onlineRoomId,
    onlineRoom?.status,
    onlineRoom?.hostUid,
    onlineRoom?.questionIndex,
    onlineRoom?.questionStartedAt,
    onlineRoom?.perQuestionMs,
    onlineRoom?.gameMode,
    onlineRoom?.startedAt
  ]);

  useEffect(() => {
    if (page !== "online") return;
    if (!onlineRoomId || !onlineRoom) return;
    const st = String(onlineRoom.status || "");
    const hasCountdown = Number(onlineRoom.countdownEndsAtMs) > Date.now();
    if (!(st === "playing" || (st === "lobby" && hasCountdown))) return;

    const id = window.setInterval(() => {
      setOnlineNowMs(Date.now());
    }, 250);

    return () => window.clearInterval(id);
  }, [page, onlineRoomId, onlineRoom?.status, onlineRoom?.questionIndex, onlineRoom?.questionStartedAt, onlineRoom?.countdownEndsAtMs]);

  const loadChatReadMap = (uid) => {
    try {
      const key = `${CHAT_READ_STORAGE_PREFIX}${String(uid)}`;
      const raw = localStorage.getItem(key);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  };

  const saveChatReadMap = (uid, nextMap) => {
    try {
      const key = `${CHAT_READ_STORAGE_PREFIX}${String(uid)}`;
      localStorage.setItem(key, JSON.stringify(nextMap || {}));
    } catch {
      // ignore
    }
  };

  const markChatRead = (cid, atMs) => {
    if (!user?.uid) return;
    const chatIdStr = String(cid || "").trim();
    if (!chatIdStr) return;
    const ms = Math.max(0, Number(atMs) || 0);
    const prev = Number(chatReadMap?.[chatIdStr] || 0);
    if (ms <= prev) return;
    const next = { ...(chatReadMap || {}), [chatIdStr]: ms };
    setChatReadMap(next);
    saveChatReadMap(user.uid, next);
  };

  const chatUnreadById = useMemo(() => {
    if (!user?.uid) return {};
    const out = {};
    const list = Array.isArray(chatThreadsAll) ? chatThreadsAll : [];
    for (const t of list) {
      const cid = String(t?.id || "");
      if (!cid) continue;
      const lastMs = tsToMs(t?.lastMessageAt) || 0;
      const fromUid = String(t?.lastMessageFromUid || "").trim();
      const lastRead = Number(chatReadMap?.[cid] || 0);
      const unread = lastMs > lastRead && fromUid && fromUid !== String(user.uid);
      if (unread) out[cid] = true;
    }
    return out;
  }, [chatThreadsAll, chatReadMap, user?.uid]);

  const chatUnreadCount = useMemo(() => Object.keys(chatUnreadById || {}).length, [chatUnreadById]);

  const isProbablyOnline = (p) => {
    const online = Boolean(p?.online);
    if (!online) return false;
    const last = tsToMs(p?.lastActiveAt);
    if (!last) return false;
    return Date.now() - last <= 2 * 60 * 1000;
  };

  const handlePickPostImage = (file) => {
    if (postImagePreview && String(postImagePreview).startsWith("blob:")) URL.revokeObjectURL(postImagePreview);
    if (!file) {
      setPostImageFile(null);
      setPostImagePreview("");
      return;
    }
    setPostImageFile(file);
    setPostImagePreview(URL.createObjectURL(file));
  };

  const withTimeout = (promise, ms, code) => {
    const timeoutMs = Math.max(1, Number(ms) || 1);
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error(String(code || "timeout"))), timeoutMs);
      })
    ]);
  };

  const cancelPostOp = () => {
    postOpRef.current += 1;
    setPostBusy(false);
    setPostStep("");
    setPostUploadPct(0);
  };

  const closePostModal = () => {
    if (postBusy) cancelPostOp();
    setPostModalOpen(false);
  };

  const openChatWithUid = async (targetUid, targetMeta) => {
    if (!user?.uid) return;
    const t = String(targetUid || "").trim();
    if (!t || t === user.uid) return;
    setChatError("");
    setChatDraft("");
    setChatMessages([]);

    const cid = getDirectChatId(user.uid, t);
    if (!cid) return;

    setChatTargetUid(t);
    setChatId(cid);
    setChatOpen(true);

    // Best-effort ensure + cache participant meta.
    ensureDirectChat(user.uid, t)
      .then(() => {
        const myNickname =
          String(profile?.nickname || "").trim() ||
          String(user?.displayName || "").trim() ||
          String(user?.email || "").split("@")[0] ||
          "";
        const myPhotoURL = String(profile?.photoURL || user?.photoURL || "").trim();
        upsertChatMeta(cid, String(user.uid).trim(), { nickname: myNickname, photoURL: myPhotoURL });
        if (targetMeta && typeof targetMeta === "object") {
          const nick = String(targetMeta?.nickname || targetMeta?.displayName || "").trim();
          const photo = String(targetMeta?.photoURL || "").trim();
          upsertChatMeta(cid, String(t).trim(), { nickname: nick, photoURL: photo });
        }
      })
      .catch(() => {});
  };

  const openChatThread = (thread) => {
    if (!user?.uid) return;
    const cid = String(thread?.id || "").trim();
    if (!cid) return;
    const participants = Array.isArray(thread?.participants) ? thread.participants : [];
    const otherUid = participants.find((p) => String(p) !== String(user.uid)) || "";
    const ms = tsToMs(thread?.lastMessageAt) || Date.now();
    setChatError("");
    setChatDraft("");
    setChatMessages([]);
    setChatTargetUid(String(otherUid || ""));
    setChatId(cid);
    setChatOpen(true);
    markChatRead(cid, ms);
    if (chatNotif?.thread?.id && String(chatNotif.thread.id) === String(cid)) setChatNotif(null);
  };

  const openInbox = () => {
    if (!user?.uid) return;
    if (chatNotif?.thread?.id) {
      openChatThread(chatNotif.thread);
      setChatNotif(null);
      return;
    }
    setChatOpen(true);
  };

  useEffect(() => {
    if (!user?.uid) {
      setChatReadMap({});
      setChatThreadsAll([]);
      return;
    }
    setChatReadMap(loadChatReadMap(user.uid));
  }, [user?.uid]);

  useEffect(() => {
    // Global DM notifier: watch chat docs for new lastMessage from others.
    if (!user?.uid) return;
    setChatNotif(null);
    chatLastSeenRef.current = new Map();
    chatNotifPrimedRef.current = false;

    const unsub = subscribeUserChats(
      user.uid,
      { max: 50 },
      (rows) => {
        const list = Array.isArray(rows) ? rows : [];
        setChatThreadsAll(list);

        // Prime baseline on first snapshot: do not notify for old messages.
        if (!chatNotifPrimedRef.current) {
          for (const t of list) {
            const cid = String(t?.id || "");
            if (!cid) continue;
            const lastMs = tsToMs(t?.lastMessageAt) || 0;
            chatLastSeenRef.current.set(cid, lastMs);
          }
          chatNotifPrimedRef.current = true;
          return;
        }

        let newest = null;
        let newestMs = 0;

        for (const t of list) {
          const cid = String(t?.id || "");
          if (!cid) continue;
          const lastMs = tsToMs(t?.lastMessageAt) || 0;
          const prevMs = chatLastSeenRef.current.get(cid) || 0;

          if (lastMs > prevMs) {
            chatLastSeenRef.current.set(cid, lastMs);

            const fromUid = String(t?.lastMessageFromUid || "").trim();
            const isFromOther = fromUid && fromUid !== String(user.uid);
            const isActiveThread = chatOpen && String(chatId) === cid;

            if (isFromOther && !isActiveThread) {
              if (lastMs >= newestMs) {
                const participants = Array.isArray(t?.participants) ? t.participants : [];
                const otherUid = participants.find((p) => String(p) !== String(user.uid)) || "";
                const meta = t?.meta && otherUid ? t.meta[otherUid] : null;
                const name = String(meta?.nickname || "").trim() || (otherUid ? `uid:${String(otherUid).slice(0, 6)}…` : "ผู้เล่น");
                const photo = String(meta?.photoURL || "").trim();
                newest = {
                  thread: t,
                  name,
                  photo,
                  text: String(t?.lastMessageText || "").trim(),
                  when: t?.lastMessageAt || null
                };
                newestMs = lastMs;
              }
            }
          }
        }

        if (newest) setChatNotif(newest);
      },
      () => {
        // ignore notifier errors
      }
    );

    return () => unsub();
  }, [user?.uid, chatOpen, chatId]);

  useEffect(() => {
    if (!chatOpen || !chatId || !user?.uid) return;

    setChatError("");
    setChatLoading(true);

    const unsub = subscribeDirectMessages(
      chatId,
      { max: 100 },
      (rows) => {
        setChatMessages(Array.isArray(rows) ? rows : []);
        setChatLoading(false);
      },
      (err) => {
        const msg = String(err?.code || err?.message || "chat_subscribe_failed");
        setChatError(msg);
        setChatLoading(false);
      }
    );

    return () => unsub();
  }, [chatOpen, chatId, user?.uid]);

  useEffect(() => {
    if (!chatOpen || !user?.uid) return;
    setChatThreadsError("");
    setChatThreadsLoading(true);
    const unsub = subscribeUserChats(
      user.uid,
      { max: 50 },
      (rows) => {
        const list = Array.isArray(rows) ? rows : [];
        list.sort((a, b) => {
          const am = tsToMs(a?.lastMessageAt) || tsToMs(a?.updatedAt) || tsToMs(a?.createdAt);
          const bm = tsToMs(b?.lastMessageAt) || tsToMs(b?.updatedAt) || tsToMs(b?.createdAt);
          return bm - am;
        });
        setChatThreads(list);
        setChatThreadsLoading(false);
      },
      (err) => {
        const msg = String(err?.code || err?.message || "chat_threads_subscribe_failed");
        setChatThreadsError(msg);
        setChatThreadsLoading(false);
      }
    );
    return () => unsub();
  }, [chatOpen, user?.uid]);

  useEffect(() => {
    if (!chatOpen || chatId || !user?.uid) return;
    const first = (chatThreads || [])[0];
    if (!first?.id) return;
    const participants = Array.isArray(first?.participants) ? first.participants : [];
    const other = participants.find((p) => String(p) !== String(user.uid)) || "";
    setChatId(String(first.id));
    setChatTargetUid(String(other || ""));
  }, [chatOpen, chatId, chatThreads, user?.uid]);

  useEffect(() => {
    if (chatOpen) return;
    setChatTargetUid("");
    setChatId("");
    setChatThreads([]);
    setChatThreadsLoading(false);
    setChatThreadsError("");
    setChatMessages([]);
    setChatLoading(false);
    setChatError("");
    setChatDraft("");
    setChatBusy(false);
  }, [chatOpen]);

  const submitChatMessage = async () => {
    if (!user?.uid) return;
    if (!chatId) return;
    const body = String(chatDraft || "").trim();
    if (!body) return;

    setChatBusy(true);
    try {
      const fromNickname = String(profile?.nickname || "").trim() || String(user?.displayName || "").trim() || String(user?.email || "").split("@")[0] || "";
      const fromPhotoURL = String(profile?.photoURL || user?.photoURL || "").trim();
      const res = await sendDirectMessage(chatId, user.uid, { body, fromNickname, fromPhotoURL });
      if (res && res.ok === false) throw new Error(res.error || "send_failed");
      setChatDraft("");
    } catch (e) {
      const msg = String(e?.message || e?.code || "send_failed");
      setChatError(msg);
      console.warn("submitChatMessage failed:", e);
    } finally {
      setChatBusy(false);
    }
  };

  const submitPost = async () => {
    if (!user?.uid) return;
    const title = String(postTitleDraft || "").trim();
    const body = String(postBodyDraft || "").trim();
    const isEditing = Boolean(postEditingId);
    const hasAnyImage = Boolean(postImageFile || String(postImagePreview || "").trim());
    if (!title) {
      setPostNotice("กรุณาใส่หัวเรื่อง");
      return;
    }
    if (!body && !hasAnyImage) {
      setPostNotice("กรุณาใส่เนื้อหา หรืออัปโหลดรูป");
      return;
    }

    setPostNotice("");
    setPostBusy(true);
    setPostStep("");
    setPostUploadPct(0);
    const opId = postOpRef.current + 1;
    postOpRef.current = opId;
    const isActive = () => postOpRef.current === opId;
    try {
      let imageUrl = String(postImagePreview || "").trim();
      if (postImageFile) {
        setPostStep("uploading");
        setPostNotice("กำลังอัปโหลดรูป...");
        imageUrl = await withTimeout(
          uploadPostImage(user.uid, postImageFile, {
            onProgress: ({ progress }) => {
              if (!isActive()) return;
              const pct = Math.max(0, Math.min(100, Math.round((Number(progress) || 0) * 100)));
              setPostUploadPct(pct);
              setPostNotice(`กำลังอัปโหลดรูป... ${pct}%`);
            }
          }),
          120_000,
          "upload_timeout"
        );
      }

      if (!isActive()) return;

      setPostStep("saving");
      setPostNotice(isEditing ? "กำลังบันทึกโพสต์..." : "กำลังโพสต์...");

      const authorNickname = String(profile?.nickname || "").trim() || String(user?.displayName || "").trim() || String(user?.email || "").split("@")[0] || "";
      const authorPhotoURL = String(profile?.photoURL || user?.photoURL || "").trim();

      if (isEditing) {
        const res = await withTimeout(
          updatePost(postEditingId, user.uid, {
          title,
          body,
          imageUrl,
          authorNickname,
          authorPhotoURL
          }),
          20_000,
          "update_timeout"
        );
        if (res && res.ok === false) throw new Error(res.error || "update_failed");
      } else {
        await withTimeout(
          createPost(user.uid, {
            title,
            body,
            imageUrl,
            authorNickname,
            authorPhotoURL
          }),
          20_000,
          "post_timeout"
        );
      }

      if (!isActive()) return;

      setPostTitleDraft("");
      setPostBodyDraft("");
      handlePickPostImage(null);
      setPostEditingId("");
      setPostStep("");
      setPostUploadPct(0);
      setPostNotice(isEditing ? "บันทึกแล้ว" : "โพสต์แล้ว");
      setPostModalOpen(false);
    } catch (e) {
      if (!isActive()) return;
      const msg = postStep === "uploading" ? storageErrorToThai(e) : String(e?.message || e?.code || "post_failed");
      setPostStep("");
      setPostUploadPct(0);
      setPostNotice(`${isEditing ? "บันทึกไม่สำเร็จ" : "โพสต์ไม่สำเร็จ"} (${msg})`);
      console.warn("submitPost failed:", e);
    } finally {
      if (isActive()) {
        setPostBusy(false);
        setPostStep("");
        setPostUploadPct(0);
      }
    }
  };

  const openEditPost = (p) => {
    if (!user?.uid) return;
    const postId = String(p?.id || "");
    const authorUid = String(p?.authorUid || "");
    if (!postId) return;
    if (!authorUid || authorUid !== String(user.uid)) return;

    setPostNotice("");
    setPostEditingId(postId);
    setPostTitleDraft(String(p?.title || ""));
    setPostBodyDraft(String(p?.body || ""));
    setPostImageFile(null);
    setPostImagePreview(String(p?.imageUrl || "").trim());
    setPostModalOpen(true);
  };

  const confirmDeletePost = async (p) => {
    if (!user?.uid) return;
    const postId = String(p?.id || "");
    const authorUid = String(p?.authorUid || "");
    if (!postId) return;
    if (!authorUid || authorUid !== String(user.uid)) return;

    const ok = window.confirm("ลบโพสต์นี้ถาวรใช่ไหม?\n(คอมเมนท์ในโพสต์จะถูกซ่อนตามไปด้วย)");
    if (!ok) return;

    if (activeCommentsPostId === postId) setActiveCommentsPostId("");

    setPostNotice("");
    setPostBusy(true);
    setPostStep("deleting");
    const opId = postOpRef.current + 1;
    postOpRef.current = opId;
    const isActive = () => postOpRef.current === opId;
    try {
      const res = await withTimeout(deletePost(postId, user.uid), 20_000, "delete_timeout");
      if (res && res.ok === false) throw new Error(res.error || "delete_failed");
      if (!isActive()) return;
      setPostStep("");
      setPostNotice("ลบแล้ว");
    } catch (e) {
      if (!isActive()) return;
      const msg = String(e?.message || e?.code || "delete_failed");
      setPostStep("");
      setPostNotice(`ลบไม่สำเร็จ (${msg})`);
      console.warn("delete post failed:", e);
    } finally {
      if (isActive()) setPostBusy(false);
      if (isActive()) setPostStep("");
    }
  };

  const toggleLike = async (post) => {
    if (!user?.uid) return;
    const postId = String(post?.id || "");
    if (!postId) return;
    if (likeBusyRef.current.has(postId)) return;

    likeBusyRef.current.add(postId);
    try {
      const likedBy = Array.isArray(post?.likedBy) ? post.likedBy : [];
      const isLiked = likedBy.includes(user.uid);
      const res = await togglePostLike(postId, user.uid, !isLiked);
      if (res && res.ok === false) throw new Error(res.error || "like_failed");
    } catch (e) {
      console.warn("toggleLike failed:", e);
    } finally {
      likeBusyRef.current.delete(postId);
    }
  };

  const submitComment = async () => {
    if (!user?.uid) return;
    if (!activeCommentsPostId) return;
    const body = String(commentDraft || "").trim();
    if (!body) return;

    setCommentBusy(true);
    try {
      const authorNickname = String(profile?.nickname || "").trim() || String(user?.displayName || "").trim() || String(user?.email || "").split("@")[0] || "";
      const authorPhotoURL = String(profile?.photoURL || user?.photoURL || "").trim();
      const res = await addComment(activeCommentsPostId, user.uid, { body, authorNickname, authorPhotoURL });
      if (res && res.ok === false) throw new Error(res.error || "comment_failed");
      setCommentDraft("");
    } catch (e) {
      console.warn("submitComment failed:", e);
    } finally {
      setCommentBusy(false);
    }
  };

  const communityFiltered = useMemo(() => {
    const q = String(communitySearch || "")
      .trim()
      .toLowerCase();
    const list = Array.isArray(communityProfiles) ? communityProfiles : [];
    if (!q) return list;
    return list.filter((p) => {
      const nick = String(p?.nickname || "").trim();
      const dn = String(p?.displayName || "").trim();
      const email = String(p?.email || "");
      const emailPrefix = email ? String(email).split("@")[0] : "";
      const hay = `${nick} ${dn} ${emailPrefix}`.toLowerCase();
      return hay.includes(q);
    });
  }, [communityProfiles, communitySearch]);

  const handleAvatarFile = async (file) => {
    if (!user?.uid) {
      setAvatarError("ยังไม่ได้ล็อกอิน");
      return;
    }
    if (!file) return;

    setAvatarError("");
    setAvatarBusy(true);
    try {
      const url = await uploadUserAvatar(user.uid, file);
      if (firebaseAuth?.currentUser) {
        // Best-effort: if this fails, we still update Firestore profile.photoURL
        // so UI can render the new avatar consistently.
        await updateProfile(firebaseAuth.currentUser, { photoURL: url }).catch((e) => {
          console.warn("updateProfile(photoURL) failed:", e);
        });
      }
      await updateProfilePhotoURL(user.uid, url);
      // Ensure UI updates immediately even if snapshot timing is delayed.
      setProfile((prev) => (prev ? { ...prev, photoURL: url } : prev));
      setProfileNotice("อัปเดตรูปโปรไฟล์แล้ว");
    } catch (e) {
      const raw = String(e?.code || e?.message || e || "");
      const lower = raw.toLowerCase();
      const isAuth = String(e?.code || "").startsWith("auth/") || lower.includes("auth/");
      const looksLikeFirestore = lower.includes("permission-denied") || lower.includes("missing or insufficient permissions") || lower.includes("unauthenticated") || lower.includes("firestore");

      const msg = looksLikeFirestore
        ? firestoreErrorToThai(raw)
        : isAuth
          ? firebaseErrorToThai(e)
          : storageErrorToThai(e);

      setAvatarError(raw ? `${msg} (${raw})` : msg);
    } finally {
      setAvatarBusy(false);
      setAvatarInputKey((k) => k + 1);
    }
  };

  useEffect(() => {
    if (page !== "library" || libraryTab !== "legal") return;
    if (providerIcons) return;

    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    fetch("/provider_icons.json", controller ? { signal: controller.signal } : undefined)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data === "object") setProviderIcons(data);
      })
      .catch((e) => {
        if (e?.name === "AbortError") return;
        // ignore
      });
    return () => {
      try {
        controller?.abort();
      } catch {
        // ignore
      }
    };
  }, [page, libraryTab, providerIcons]);

  useEffect(() => {
    if (page !== "library" || libraryTab !== "legal") return;
    if (legalAvailability) return;

    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    fetch("/legal_availability_th.json", controller ? { signal: controller.signal } : undefined)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data === "object") setLegalAvailability(withLooseIndexes(data));
      })
      .catch((e) => {
        if (e?.name === "AbortError") return;
        // ignore
      });
    return () => {
      try {
        controller?.abort();
      } catch {
        // ignore
      }
    };
  }, [page, libraryTab, legalAvailability]);

  useEffect(() => {
    if (page !== "library" || libraryTab !== "legal") return;
    if (legalCatalogTH) return;

    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    fetch("/legal_catalog_th.json", controller ? { signal: controller.signal } : undefined)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data === "object") setLegalCatalogTH(withLooseIndexes(data));
      })
      .catch((e) => {
        if (e?.name === "AbortError") return;
        // ignore
      });
    return () => {
      try {
        controller?.abort();
      } catch {
        // ignore
      }
    };
  }, [page, libraryTab, legalCatalogTH]);

  useEffect(() => {
    setLegalProviderFilter("all");
    setLegalGenreFilter("all");
    setLegalYearFilter("all");
    setLegalSelectedKey("");
  }, [libraryListMode]);

  useEffect(() => {
    if (page !== "library" || libraryTab !== "legal") {
      setLegalSelectedKey("");
    }
  }, [page, libraryTab]);

  const openLegalDetail = (key) => {
    const next = String(key || "").trim();
    if (!next) return;
    setLegalSelectedKey(next);
    setLegalBotOpen(false);
  };

  useEffect(() => {
    let cancelled = false;
    loadManualSynopsisDb()
      .then((db) => {
        if (cancelled) return;
        setManualSynopsisDb(db || null);
      })
      .catch(() => {
        if (cancelled) return;
        setManualSynopsisDb(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ensureSynopsis = async ({ cacheKey, searchTitle }) => {
    if (!cacheKey || !searchTitle) return;
    const existing = synopsisCache?.[cacheKey];
    if (existing && (existing?.text || existing?.url || existing?.error || existing?.miss)) {
      // If the synopsis DB has changed since this cache entry was written,
      // refresh so newly-added synopsis text can appear without clearing localStorage.
      try {
        const db = await loadManualSynopsisDb();
        const currentGeneratedAt = String(db?.generatedAt || "");
        const currentVersion = Number(db?.version || 0) || 0;
        const sameSource = (currentGeneratedAt && existing?.sourceGeneratedAt === currentGeneratedAt)
          || (currentVersion && existing?.sourceVersion === currentVersion);
        if (sameSource) return;
      } catch {
        return;
      }
    }
    if (synopsisLoading?.[cacheKey]) return;

    setSynopsisLoading((prev) => ({ ...prev, [cacheKey]: true }));
    try {
      const result = await fetchAniListSynopsis(searchTitle);
      setSynopsisCache((prev) => {
        const next = { ...(prev || {}), [cacheKey]: result };
        try {
          localStorage.setItem(SYNOPSIS_CACHE_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore write errors
        }
        return next;
      });
    } catch {
      setSynopsisCache((prev) => {
        const next = {
          ...(prev || {}),
          [cacheKey]: { text: "", url: "", fetchedAt: Date.now(), error: true, miss: false, sourceVersion: 0, sourceGeneratedAt: "" }
        };
        try {
          localStorage.setItem(SYNOPSIS_CACHE_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore write errors
        }
        return next;
      });
    } finally {
      setSynopsisLoading((prev) => ({ ...prev, [cacheKey]: false }));
    }
  };

  const submitSongRequest = async () => {
    if (songRequestBusy) return;

    if (!firebaseReady || !firebaseDb) {
      window.alert("Firebase ยังไม่พร้อม");
      return;
    }
    if (!user?.uid) {
      window.alert("กรุณาเข้าสู่ระบบก่อนส่งคำขอเพลง");
      return;
    }

    const raw = window.prompt("ต้องการเพลง/เรื่องอะไรเพิ่ม? (พิมพ์ชื่อเรื่องหรือชื่อเพลง)", "");
    const requestText = String(raw || "").trim();
    if (!requestText) return;

    setSongRequestBusy(true);
    try {
      await addDoc(collection(firebaseDb, "song_requests"), {
        uid: user.uid,
        displayName: String(user.displayName || "").trim(),
        email: String(user.email || "").trim(),
        photoURL: String(user.photoURL || "").trim(),
        requestText: requestText.slice(0, 220),
        context: {
          page: "library",
          mode: "songs",
          search: String(legalSearch || "").trim().slice(0, 120)
        },
        userAgent: typeof navigator !== "undefined" ? String(navigator.userAgent || "") : "",
        clientNow: Date.now(),
        createdAt: serverTimestamp()
      });
      window.alert("ส่งคำขอเพลงเรียบร้อย ขอบคุณครับ");
    } catch (e) {
      const code = String(e?.code || e?.message || "send_failed");
      if (code.includes("permission-denied")) {
        window.alert("ส่งคำขอไม่สำเร็จ: ไม่มีสิทธิ์เขียนข้อมูล (permission-denied)");
      } else {
        window.alert("ส่งคำขอไม่สำเร็จ: " + code);
      }
    } finally {
      setSongRequestBusy(false);
    }
  };

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.body.classList.add("dark");
  }, []);

  useEffect(() => {
    try {
      // Background is handled via a video element (home) or CSS gradients.
      // Keep the legacy CSS var disabled to avoid loading the GIF.
      document.documentElement.style.setProperty("--bg-gif", "none");
      document.body.classList.remove("with-gif");
    } catch {
      // ignore
    }
  }, [page]);

  // (removed) GIF background upload feature

  const LazyYouTube = ({ videoSource, title }) => {
    const [loaded, setLoaded] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
      if (loaded) return;
      const el = containerRef.current;
      if (!el) return;

      // Avoid re-observing already-loaded nodes across re-renders.
      const key = `${title}::${String(videoSource)}`;
      if (libraryLazyRef.current.has(key)) {
        setLoaded(true);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry?.isIntersecting) {
            libraryLazyRef.current.add(key);
            setLoaded(true);
            observer.disconnect();
          }
        },
        { rootMargin: "220px", threshold: 0.15 }
      );

      observer.observe(el);
      return () => observer.disconnect();
    }, [loaded, title, videoSource]);

    const thumbUrl = getYouTubeThumbUrl(videoSource);

    return (
      <div ref={containerRef} className="relative aspect-video overflow-hidden rounded-2xl bg-black">
        {loaded ? (
          <>
            <iframe
              key={getYouTubeId(videoSource) || String(videoSource || "")}
              title={title}
              loading="lazy"
              className="w-full h-[calc(100%+72px)] -mt-[72px]"
              src={buildYouTubeEmbedUrl(videoSource)}
              referrerPolicy="origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-black" />
          </>
        ) : (
          <>
            {thumbUrl ? (
              <img
                src={thumbUrl}
                alt=""
                className="h-full w-full object-cover opacity-90"
                loading="lazy"
                draggable={false}
              />
            ) : (
              <div className="absolute inset-0 bg-black" />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30" />
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="rounded-full bg-black/55 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur">กำลังโหลด…</div>
            </div>
          </>
        )}
      </div>
    );
  };

  const animeWithGenre = useMemo(() => {
    return animeData.map((anime) => ({
      ...anime,
      genre: inferGenre(anime)
    }));
  }, []);

  const animeById = useMemo(() => {
    const map = new Map();
    for (const a of animeWithGenre || []) {
      const id = Number(a?.id);
      if (!Number.isFinite(id)) continue;
      if (!map.has(id)) map.set(id, a);
    }
    return map;
  }, [animeWithGenre]);

  const favoritesPopupItems = useMemo(() => {
    const ids = normalizeIdList(favoritesPopupIds || [], 500);
    return ids.map((id) => animeById.get(id)).filter(Boolean);
  }, [animeById, favoritesPopupIds]);

  useEffect(() => {
    if (!favoritesPopupOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setFavoritesPopupOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [favoritesPopupOpen]);

  const dailyAnime = useMemo(() => {
    if (!animeWithGenre.length) return null;
    const key = getLocalDateKey();
    const idx = hashStringToUint(`daily:${key}`) % animeWithGenre.length;
    return animeWithGenre[idx];
  }, [animeWithGenre]);

  const genreCounts = useMemo(() => {
    return animeWithGenre.reduce((acc, anime) => {
      acc[anime.genre] = (acc[anime.genre] || 0) + 1;
      return acc;
    }, {});
  }, [animeWithGenre]);

  const genreBucketsAll = useMemo(() => {
    const buckets = {};
    for (const anime of animeWithGenre || []) {
      const g = String(anime?.genre || "");
      if (!g) continue;
      if (!buckets[g]) buckets[g] = [];
      buckets[g].push(anime);
    }
    return buckets;
  }, [animeWithGenre]);

  useEffect(() => {
    writeLocalJson(LS_FAVORITES, (favoriteIds || []).slice(0, 500));
  }, [LS_FAVORITES, favoriteIds]);

  useEffect(() => {
    writeLocalJson(LS_LOCAL_STATS, localStats || { byId: {} });
  }, [LS_LOCAL_STATS, localStats]);

  useEffect(() => {
    writeLocalJson(LS_DAILY, dailyLastResult || {});
  }, [LS_DAILY, dailyLastResult]);

  const favoritesPool = useMemo(() => {
    if (!favoriteSet.size) return [];
    return (animeWithGenre || []).filter((a) => a && a.id != null && favoriteSet.has(Number(a.id)));
  }, [animeWithGenre, favoriteSet]);

  const seriesBuckets = useMemo(() => {
    const buckets = {};
    for (const a of animeWithGenre || []) {
      const key = baseSeriesKeyFromTitle(a?.title);
      if (!key) continue;
      const label = String(a?.title || "")
        .replace(/\s*\(\s*(?:op|ed|insert|ost)\s*\d*\s*\)\s*$/i, "")
        .trim();
      if (!buckets[key]) buckets[key] = { key, label: label || key, items: [] };
      buckets[key].items.push(a);
    }
    return buckets;
  }, [animeWithGenre]);

  const popularPool = useMemo(() => {
    const byId = localStats?.byId && typeof localStats.byId === "object" ? localStats.byId : {};
    const scored = (animeWithGenre || [])
      .filter((a) => a && a.id != null)
      .map((a) => {
        const s = byId[String(a.id)] || {};
        const plays = Number(s?.plays || 0) || 0;
        const correct = Number(s?.correct || 0) || 0;
        return { anime: a, plays, correct };
      })
      .filter((x) => x.plays > 0 || x.correct > 0)
      .sort((a, b) => {
        if (b.correct !== a.correct) return b.correct - a.correct;
        return b.plays - a.plays;
      });

    return scored.slice(0, 60).map((x) => x.anime);
  }, [animeWithGenre, localStats]);

  const genreOptions = useMemo(() => {
    const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
    return [
      { key: "all", label: "รวมทุกแนว", count: animeWithGenre.length },
      ...sortedGenres.map(([key, count]) => ({
        key,
        label: genreConfig[key]?.label || key,
        count
      }))
    ];
  }, [animeWithGenre.length, genreCounts]);

  const activeGenrePool = useMemo(() => {
    if (selectedGenre === "all") return animeWithGenre;
    return animeWithGenre.filter((anime) => anime.genre === selectedGenre);
  }, [animeWithGenre, selectedGenre]);

  useEffect(() => {
    if (page !== "online") return;
    if (!user?.uid) return;
    if (!onlineRoomId || !onlineRoom) return;
    if (String(onlineRoom.status || "") !== "lobby") return;
    if (String(onlineRoom.hostUid || "") !== String(user.uid)) return;

    const endsAtMs = Number(onlineRoom.countdownEndsAtMs) || 0;
    if (!endsAtMs) return;
    let timeoutId;

    const attemptStart = () => {
      if (page !== "online") return;
      if (!user?.uid) return;
      if (!onlineRoomId || !onlineRoom) return;
      if (String(onlineRoom.status || "") !== "lobby") return;
      if (String(onlineRoom.hostUid || "") !== String(user.uid)) return;
      if (Date.now() < endsAtMs) return;

      if (onlineCountdownStartRef.current.roomId === onlineRoomId && onlineCountdownStartRef.current.endsAtMs === endsAtMs) return;
      onlineCountdownStartRef.current = { roomId: onlineRoomId, endsAtMs };

      if (onlineStartingRef.current) return;
      const rows = Array.isArray(onlinePlayersRef.current) ? onlinePlayersRef.current : [];
      const count = rows.length;
      if (!(count >= 2 && count <= 6)) return;
      if (!rows.every((p) => Boolean(p?.ready))) return;

      onlineStartingRef.current = true;

      (async () => {
        setOnlineNotice("");
        setOnlineBusy(true);
        try {
          const gm = String(onlineRoom.gameMode || "standard");
          let ids = [];

          if (gm === "battle_royale") {
            const pool = Array.isArray(activeGenrePool) ? activeGenrePool : [];
            const base = pool.map((a) => a?.id).filter((x) => x != null);
            if (!base.length) throw new Error("no_questions");
            const seedBase = `br:${onlineRoomId}:${String(onlineRoom.hostUid || user.uid)}`;
            let round = 0;
            let out = [];
            while (out.length < 200 && round < 6) {
              out = out.concat(deterministicShuffle(base, `${seedBase}:${round}`));
              round += 1;
            }
            ids = out.slice(0, Math.min(200, out.length));
          } else {
            const picked = buildQuestionListFromPool({
              pool: activeGenrePool,
              limit: Number(onlineRoom.questionCount) || 5,
              balanceAcrossGenres: true
            });
            ids = (picked || []).map((a) => a?.id).filter((x) => x != null);
          }

          if (ids.length < 1) throw new Error("no_questions");

          const res = await startOnlineRoomGame({
            roomId: onlineRoomId,
            hostUid: user.uid,
            questions: ids,
            answerMode: String(onlineRoom.answerMode || "choice6"),
            questionCount: Number(onlineRoom.questionCount) || ids.length,
            perQuestionMs: Number(onlineRoom.perQuestionMs) || 15000
          });
          if (!res || res.ok === false) throw new Error(res?.error || "start_failed");
        } catch (e) {
          const msg = String(e?.message || e?.code || "start_failed");
          setOnlineNotice(msg);
        } finally {
          setOnlineBusy(false);
          onlineStartingRef.current = false;
        }
      })();
    };

    const delayMs = Math.max(0, endsAtMs - Date.now()) + 75;
    timeoutId = window.setTimeout(attemptStart, delayMs);
    if (delayMs <= 100) attemptStart();

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [
    page,
    user?.uid,
    onlineRoomId,
    onlineRoom?.status,
    onlineRoom?.hostUid,
    onlineRoom?.countdownEndsAtMs,
    onlineRoom?.gameMode,
    onlineRoom?.answerMode,
    onlineRoom?.questionCount,
    onlineRoom?.perQuestionMs,
    activeGenrePool
  ]);

  const pickBalancedUnusedFromAllGenres = (usedSet) => {
    const used = usedSet instanceof Set ? usedSet : new Set();
    const genres = Object.keys(genreBucketsAll || {});
    if (!genres.length) return null;

    const availableGenres = [];
    for (const g of genres) {
      const bucket = genreBucketsAll?.[g] || [];
      const hasRemaining = bucket.some((a) => a && a.id != null && !used.has(a.id));
      if (hasRemaining) availableGenres.push(g);
    }
    if (!availableGenres.length) return null;

    const chosenGenre = availableGenres[Math.floor(Math.random() * availableGenres.length)] || "";
    const bucket = (genreBucketsAll?.[chosenGenre] || []).filter((a) => a && a.id != null && !used.has(a.id));
    if (!bucket.length) return null;
    const picked = bucket[Math.floor(Math.random() * bucket.length)] || null;
    if (picked?.id != null) used.add(picked.id);
    return picked;
  };

  const filteredAnime = useMemo(() => {
    const q = normalize(search);
    const source = selectedGenre === "all"
      ? animeWithGenre
      : animeWithGenre.filter((anime) => anime.genre === selectedGenre);

    const filtered = !q
      ? source
      : source.filter((anime) => {
      const haystack = [anime.title, ...(anime.altTitles || []), anime.note || ""].join(" ");
      return normalize(haystack).includes(q);
      });

    return filtered
      .slice()
      .sort((a, b) => {
        const at = String(a?.title || "");
        const bt = String(b?.title || "");

        const aTrim = at.trim();
        const bTrim = bt.trim();
        const rank = (s) => {
          if (/^[A-Za-z]/.test(s)) return 0;
          if (/^[0-9]/.test(s)) return 1;
          return 2;
        };
        const ra = rank(aTrim);
        const rb = rank(bTrim);
        if (ra !== rb) return ra - rb;

        const byTitle = at.localeCompare(bt, "en", { sensitivity: "base", numeric: true });
        if (byTitle) return byTitle;
        return String(a?.id || "").localeCompare(String(b?.id || ""), "en", { numeric: true });
      });
  }, [animeWithGenre, search, selectedGenre]);

  const libraryTitleLists = useMemo(() => {
    if (page !== "library") {
      return {
        all: [],
        songs: [],
        works: []
      };
    }
    // Build 3 lists:
    // - works: deduped anime works (OP/ED suffix removed; seasons/parts preserved)
    // - songs: OP/ED/Insert track entries
    // - all: every entry in animeData (403)
    const allTitles = animeWithGenre.map((a) => a.title).filter(Boolean);

    const songs = [];
    for (const a of animeWithGenre) {
      if (!a?.title) continue;
      if (isSongEntryTitle(a.title)) songs.push(a.title);
    }

    // Works should be derived from all entries (even when every row is a song entry).
    // IMPORTANT: do NOT collapse seasons/parts here; users want to see every season.
    // We only strip the (OP/EDn) suffix.
    const byWorkKey = new Map();
    for (const anime of animeWithGenre) {
      if (!anime?.title) continue;
      const displayTitle = stripOpEdSuffix(anime.title);
      if (!displayTitle) continue;
      const workKey = normalizeAvailabilityKey(displayTitle);
      if (!workKey) continue;

      const prev = byWorkKey.get(workKey);
      if (!prev) {
        byWorkKey.set(workKey, { key: workKey, title: displayTitle, count: 1, sampleAnime: anime });
      } else {
        prev.count += 1;
        // Prefer shorter / cleaner title as display.
        if (displayTitle.length < prev.title.length) prev.title = displayTitle;
      }
    }

    const compareEnglishTitle = (aRaw, bRaw) => {
      const a = String(aRaw || "");
      const b = String(bRaw || "");
      const aTrim = a.trim();
      const bTrim = b.trim();
      const rank = (s) => {
        if (/^[A-Za-z]/.test(s)) return 0;
        if (/^[0-9]/.test(s)) return 1;
        return 2;
      };
      const ra = rank(aTrim);
      const rb = rank(bTrim);
      if (ra !== rb) return ra - rb;
      return a.localeCompare(b, "en", { sensitivity: "base", numeric: true });
    };

    const works = Array.from(byWorkKey.values()).sort((a, b) => compareEnglishTitle(a.title, b.title));

    return {
      all: allTitles
        .slice()
        .sort((a, b) => compareEnglishTitle(a, b)),
      songs: songs
        .slice()
        .sort((a, b) => compareEnglishTitle(a, b)),
      works
    };
  }, [animeWithGenre, page]);

  const legalRawItems = useMemo(() => {
    if (page !== "library" || libraryTab !== "legal") return [];
    const compareEnglishTitle = (aRaw, bRaw) => {
      const a = String(aRaw || "");
      const b = String(bRaw || "");
      const aTrim = a.trim();
      const bTrim = b.trim();
      const rank = (s) => {
        if (/^[A-Za-z]/.test(s)) return 0;
        if (/^[0-9]/.test(s)) return 1;
        return 2;
      };
      const ra = rank(aTrim);
      const rb = rank(bTrim);
      if (ra !== rb) return ra - rb;
      return a.localeCompare(b, "en", { sensitivity: "base", numeric: true });
    };

    if (libraryListMode === "works") {
      return libraryTitleLists.works.map((x) => ({
        key: x.key,
        title: x.title,
        count: x.count,
        anime: x.sampleAnime || null
      }));
    }

    if (libraryListMode === "songs") {
      // Use ids for stable keys (titles can repeat across different entries).
      return animeWithGenre
        .filter((a) => a?.title && isSongEntryTitle(a.title))
        .slice()
        .sort((a, b) => compareEnglishTitle(a.title, b.title))
        .map((a) => ({
          key: `song:${a.id}`,
          title: a.title,
          anime: a
        }));
    }

    // Use ids for stable keys (titles can repeat across different entries).
    return animeWithGenre
      .filter((a) => a?.title)
      .slice()
      .sort((a, b) => compareEnglishTitle(a.title, b.title))
      .map((a) => ({
        key: `all:${a.id}`,
        title: a.title,
        anime: a
      }));
  }, [animeWithGenre, libraryListMode, libraryTitleLists, page, libraryTab]);

  const legalGenreTagOptions = useMemo(() => {
    if (page !== "library" || libraryTab !== "legal") return [];
    if (libraryListMode === "songs") return [];
    const byTitle = legalCatalogTH?.byTitle || null;
    const byBase = legalCatalogTH?.byBase || null;
    const byTitleLoose = legalCatalogTH?.byTitleLoose || null;
    const byBaseLoose = legalCatalogTH?.byBaseLoose || null;
    if (!byTitle && !byBase) {
      // Still allow filtering by inferred genre tags when the catalog isn't available.
      const tags = new Set();
      for (const item of legalRawItems) {
        tags.add(getFallbackGenreLabel(item?.anime));
      }
      return Array.from(tags).sort((a, b) => a.localeCompare(b, "th", { sensitivity: "base" }));
    }

    const tags = new Set();
    for (const item of legalRawItems) {
      const titleKey = normalizeAvailabilityKey(item.title);
      const titleKeyLoose = normalizeAvailabilityKeyLoose(item.title);
      const baseKey = availabilityBaseKeyFromTitle(item.title);
      const baseKeyLoose = normalizeAvailabilityKeyLoose(baseKey);
      const entry = byTitle?.[titleKey]
        || byTitleLoose?.[titleKeyLoose]
        || byBase?.[baseKey]
        || byBaseLoose?.[baseKeyLoose]
        || null;
      const genres = entry?.genres;
      if (Array.isArray(genres)) {
        for (const g of genres) {
          const t = String(g || "").trim();
          if (t) tags.add(t);
        }
      } else {
        // If an item isn't present in the catalog, fall back to inferred genre.
        tags.add(getFallbackGenreLabel(item?.anime));
      }
    }

    return Array.from(tags).sort((a, b) => a.localeCompare(b, "th", { sensitivity: "base" }));
  }, [legalCatalogTH, legalRawItems, libraryListMode, page, libraryTab]);

  const legalYearOptions = useMemo(() => {
    if (page !== "library" || libraryTab !== "legal") return [];
    const years = new Set();
    for (const item of legalRawItems) {
      const y = item?.anime?.year;
      if (Number.isFinite(y)) years.add(Math.floor(y));
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [legalRawItems, page, libraryTab]);

  const legalFilteredItems = useMemo(() => {
    if (page !== "library" || libraryTab !== "legal") return [];
    const q = normalize(legalSearch);

    const catalogByTitle = legalCatalogTH?.byTitle || null;
    const catalogByBase = legalCatalogTH?.byBase || null;
    const catalogByTitleLoose = legalCatalogTH?.byTitleLoose || null;
    const catalogByBaseLoose = legalCatalogTH?.byBaseLoose || null;
    const availabilityByTitle = legalAvailability?.byTitle || null;
    const availabilityByBase = legalAvailability?.byBase || null;
    const availabilityByTitleLoose = legalAvailability?.byTitleLoose || null;
    const availabilityByBaseLoose = legalAvailability?.byBaseLoose || null;

    let items = legalRawItems;

    if (legalProviderFilter !== "all") {
      items = items.filter((item) => {
        const titleKey = normalizeAvailabilityKey(item.title);
        const titleKeyLoose = normalizeAvailabilityKeyLoose(item.title);
        const baseKey = availabilityBaseKeyFromTitle(item.title);
        const baseKeyLoose = normalizeAvailabilityKeyLoose(baseKey);

        const isSongLike = libraryListMode === "songs" || isSongEntryTitle(item.title);

        const catalogEntry = catalogByTitle?.[titleKey]
          || catalogByTitleLoose?.[titleKeyLoose]
          || catalogByBase?.[baseKey]
          || catalogByBaseLoose?.[baseKeyLoose]
          || null;
        const catalogProviders = catalogEntry?.providers;
        if (Array.isArray(catalogProviders) && catalogProviders.length) {
          return catalogProviders.includes(legalProviderFilter);
        }

        // Fallback to older availability dataset only when catalog data is missing.
        if (isSongLike) {
          const providers = availabilityByTitle?.[titleKey]?.providers
            || availabilityByTitleLoose?.[titleKeyLoose]?.providers;
          if (Array.isArray(providers) && providers.length) {
            return providers.includes(legalProviderFilter);
          }
          return false;
        }

        const baseProviders = availabilityByBase?.[baseKey]
          || availabilityByBaseLoose?.[baseKeyLoose];
        if (Array.isArray(baseProviders) && baseProviders.length) {
          return baseProviders.includes(legalProviderFilter);
        }
        return false;
      });
    }

    if (legalGenreFilter !== "all" && libraryListMode !== "songs") {
      items = items.filter((item) => {
        const titleKey = normalizeAvailabilityKey(item.title);
        const titleKeyLoose = normalizeAvailabilityKeyLoose(item.title);
        const baseKey = availabilityBaseKeyFromTitle(item.title);
        const baseKeyLoose = normalizeAvailabilityKeyLoose(baseKey);
        const entry = catalogByTitle?.[titleKey]
          || catalogByTitleLoose?.[titleKeyLoose]
          || catalogByBase?.[baseKey]
          || catalogByBaseLoose?.[baseKeyLoose]
          || null;
        const genres = entry?.genres;
        if (Array.isArray(genres) && genres.length) return genres.includes(legalGenreFilter);

        return getFallbackGenreLabel(item?.anime) === legalGenreFilter;
      });
    }

    if (legalYearFilter !== "all") {
      const y = Number(legalYearFilter);
      if (Number.isFinite(y)) {
        items = items.filter((item) => {
          const iy = item?.anime?.year;
          if (!Number.isFinite(iy)) return false;
          return Math.floor(iy) === Math.floor(y);
        });
      }
    }

    if (!q) return items;
    return items.filter((item) => {
      const titleKey = normalizeAvailabilityKey(item.title);
      const titleKeyLoose = normalizeAvailabilityKeyLoose(item.title);
      const baseKey = availabilityBaseKeyFromTitle(item.title);
      const baseKeyLoose = normalizeAvailabilityKeyLoose(baseKey);
      const entry = catalogByTitle?.[titleKey]
        || catalogByTitleLoose?.[titleKeyLoose]
        || catalogByBase?.[baseKey]
        || catalogByBaseLoose?.[baseKeyLoose]
        || null;
      const genresText = Array.isArray(entry?.genres) ? entry.genres.join(" ") : "";

      const providersText = Array.isArray(entry?.providers)
        ? entry.providers
            .map((k) => LEGAL_PROVIDER_PRESETS?.[k]?.label || k)
            .filter(Boolean)
            .join(" ")
        : "";

      const genreKey = item?.anime?.genre || "";
      const genreLabel = genreKey ? (genreConfig[genreKey]?.label || genreKey) : "";
      const haystack = [item.title, genresText, providersText, genreKey, genreLabel].filter(Boolean).join(" ");
      return normalize(haystack).includes(q);
    });
  }, [legalRawItems, legalSearch, legalGenreFilter, legalProviderFilter, legalYearFilter, legalCatalogTH, legalAvailability, libraryListMode, page, libraryTab]);

  const legalSelectedItem = useMemo(() => {
    if (page !== "library" || libraryTab !== "legal") return null;
    const key = String(legalSelectedKey || "").trim();
    if (!key) return null;
    return (legalRawItems || []).find((x) => String(x?.key || "") === key) || null;
  }, [legalRawItems, legalSelectedKey, page, libraryTab]);

  const legalSelectedIsSongLike = useMemo(() => {
    if (!legalSelectedItem) return false;
    if (libraryListMode === "songs") return true;
    if (libraryListMode === "works") return false;
    return isSongEntryTitle(legalSelectedItem.title);
  }, [legalSelectedItem, libraryListMode]);

  const legalSelectedDisplayTitle = useMemo(() => {
    if (!legalSelectedItem) return "";
    const raw = String(legalSelectedItem.title || "");
    return legalSelectedIsSongLike ? raw : stripOpEdSuffix(raw);
  }, [legalSelectedItem, legalSelectedIsSongLike]);

  const buildProviderLabelList = (keys) => {
    const list = Array.isArray(keys) ? keys : [];
    const labels = list
      .map((k) => {
        const preset = LEGAL_PROVIDER_PRESETS?.[k];
        return String(preset?.label || k || "").trim();
      })
      .filter(Boolean);
    return labels.length ? labels.join(", ") : "";
  };

  const findTopMatches = ({ rawText, mode = "works", limit = 6 }) => {
    const q = normalize(rawText);
    if (!q) return [];

    const candidates = [];
    if (mode === "songs") {
      for (const a of animeWithGenre || []) {
        if (!a?.title) continue;
        if (!isSongEntryTitle(a.title)) continue;
        candidates.push(String(a.title).trim());
      }
    } else if (mode === "all") {
      for (const a of animeWithGenre || []) {
        if (!a?.title) continue;
        candidates.push(String(a.title).trim());
      }
    } else {
      for (const w of libraryTitleLists?.works || []) {
        const t = String(w?.title || "").trim();
        if (t) candidates.push(t);
      }
    }

    const unique = Array.from(new Set(candidates)).filter(Boolean);
    const scored = [];
    for (const title of unique) {
      const nt = normalize(title);
      if (!nt) continue;

      const exact = nt === q;
      const starts = nt.startsWith(q) || q.startsWith(nt);
      const includes = nt.includes(q) || q.includes(nt);
      if (!includes && !starts && !exact) continue;

      // Lower is better.
      let score = Math.abs(nt.length - q.length);
      if (includes) score -= 3;
      if (starts) score -= 6;
      if (exact) score -= 20;
      scored.push({ title, score });
    }

    scored.sort((a, b) => a.score - b.score || a.title.localeCompare(b.title, "en", { sensitivity: "base", numeric: true }));
    return scored.slice(0, Math.max(1, Number(limit) || 6)).map((x) => x.title);
  };

  const getProvidersForQueryTitle = ({ rawTitle, isSongLike }) => {
    if (!rawTitle) return [];
    const displayTitle = isSongLike ? String(rawTitle) : stripOpEdSuffix(rawTitle);

    const availabilityByTitle = legalAvailability?.byTitle || null;
    const availabilityByBase = legalAvailability?.byBase || null;
    const availabilityByTitleLoose = legalAvailability?.byTitleLoose || null;
    const availabilityByBaseLoose = legalAvailability?.byBaseLoose || null;

    const catalogByTitle = legalCatalogTH?.byTitle || null;
    const catalogByBase = legalCatalogTH?.byBase || null;
    const catalogByTitleLoose = legalCatalogTH?.byTitleLoose || null;
    const catalogByBaseLoose = legalCatalogTH?.byBaseLoose || null;

    const titleKey = normalizeAvailabilityKey(displayTitle);
    const titleKeyLoose = normalizeAvailabilityKeyLoose(displayTitle);
    const baseKey = availabilityBaseKeyFromTitle(displayTitle);
    const baseKeyLoose = normalizeAvailabilityKeyLoose(baseKey);

    const catalogEntry = (catalogByTitle?.[titleKey] || catalogByTitleLoose?.[titleKeyLoose])
      || (catalogByBase?.[baseKey] || catalogByBaseLoose?.[baseKeyLoose])
      || null;
    const catalogProviders = Array.isArray(catalogEntry?.providers) ? catalogEntry.providers : null;

    const availabilityProviders = isSongLike
      ? (availabilityByTitle?.[titleKey]?.providers || availabilityByTitleLoose?.[titleKeyLoose]?.providers || null)
      : (availabilityByBase?.[baseKey] || availabilityByBaseLoose?.[baseKeyLoose] || null);

    const providers = (Array.isArray(catalogProviders) && catalogProviders.length)
      ? catalogProviders
      : (Array.isArray(availabilityProviders) && availabilityProviders.length)
        ? availabilityProviders
        : [];

    return Array.from(new Set((providers || []).map((x) => String(x || "").trim()).filter(Boolean)));
  };

  const detectProviderKeyFromText = (raw) => {
    const q = normalize(raw);
    if (!q) return "";

    const aliases = {
      netflix: ["netflix", "เน็ตฟลิกซ์"],
      prime: ["prime", "primevideo", "prime video", "อเมซอน", "amazon"],
      disney: ["disney", "disney+", "ดิสนีย์"],
      crunchyroll: ["crunchyroll", "ครันชี่โรล"],
      iqiyi: ["iqiyi", "อ้ายฉีอี้"],
      bilibili: ["bilibili", "บิลิบิลิ"],
      trueid: ["trueid", "ทรูไอดี", "true id"],
      viu: ["viu"],
      muse: ["muse"],
      anione: ["ani-one", "anione"],
      youtube: ["youtube", "ยูทูบ"],
      spotify: ["spotify", "สปอติฟาย"],
      applemusic: ["apple music", "applemusic"],
      ytmusic: ["youtube music", "ytmusic"]
    };

    for (const [key, list] of Object.entries(aliases)) {
      for (const a of list) {
        if (!a) continue;
        if (q.includes(normalize(a))) return key;
      }
    }

    // Fallback: match by preset labels
    for (const [key, preset] of Object.entries(LEGAL_PROVIDER_PRESETS || {})) {
      const label = String(preset?.label || "").trim();
      if (!label) continue;
      if (q.includes(normalize(label)) || q.includes(normalize(key))) return key;
    }

    return "";
  };

  const buildLegalBotReply = (rawText) => {
    const text = String(rawText || "").trim();
    const q = normalize(text);
    if (!q) return "พิมพ์คำถามได้เลยครับ";

    const isListen = q.includes("ฟัง") || q.includes("spotify") || q.includes("apple") || q.includes("ytmusic") || q.includes("youtube music");
    const isWatch = q.includes("ดู") || q.includes("รับชม") || q.includes("netflix") || q.includes("disney") || q.includes("prime") || q.includes("crunchyroll");
    const isSongLikeQuery = isListen || q.includes("เพลง") || q.includes("op") || q.includes("ed");

    if (q.includes("ช่วย") && (q.includes("ใช้") || q.includes("ทำไง") || q.includes("วิธี"))) {
      return "ทิป: พิมพ์ ‘ชื่อเรื่อง + ดูที่ไหน’ หรือ ‘ชื่อเพลง OP/ED + ฟังที่ไหน’ แล้วฉันจะบอกแพลตฟอร์มที่ฐานข้อมูลในเว็บมีให้";
    }

    if (!legalCatalogTH && !legalAvailability) {
      return "กำลังโหลดข้อมูลช่องทางรับชม/ฟังอยู่ ลองถามใหม่อีกครั้งในอีกสักครู่ครับ";
    }

    const providerKey = detectProviderKeyFromText(text);
    const wantsList = q.includes("มี") && (q.includes("อะไร") || q.includes("เรื่อง") || q.includes("เพลง"));
    const wantsCount = q.includes("กี่") || q.includes("จำนวน") || q.includes("ทั้งหมด") || q.includes("รวม");

    if (wantsCount && !providerKey) {
      const worksCount = (libraryTitleLists?.works || []).length;
      const songsCount = (libraryTitleLists?.songs || []).length;
      const allCount = (libraryTitleLists?.all || []).length;
      return `ในฐานข้อมูลของเกมตอนนี้: เรื่อง (แยกภาค/ซีซั่น ไม่รวม OP/ED) ${worksCount.toLocaleString()} เรื่อง, เพลง OP/ED ${songsCount.toLocaleString()} เพลง, รายการทั้งหมด ${allCount.toLocaleString()} รายการ`;
    }

    if (providerKey && wantsList) {
      const mode = isSongLikeQuery ? "songs" : "works";
      const pool = mode === "songs"
        ? (libraryTitleLists?.songs || [])
        : (libraryTitleLists?.works || []).map((w) => w?.title).filter(Boolean);

      const hits = [];
      for (const tRaw of pool) {
        const t = String(tRaw || "").trim();
        if (!t) continue;
        const providers = getProvidersForQueryTitle({ rawTitle: t, isSongLike: mode === "songs" });
        if (providers.includes(providerKey)) hits.push(t);
        if (hits.length >= 8) break;
      }

      const label = LEGAL_PROVIDER_PRESETS?.[providerKey]?.label || providerKey;
      if (!hits.length) {
        return `ยังไม่พบรายการตัวอย่างสำหรับ ${label} จากฐานข้อมูลที่เว็บมีตอนนี้ ลองพิมพ์ชื่อเรื่อง/เพลงเพื่อเช็คเป็นรายการ ๆ ได้ครับ`;
      }

      const kind = mode === "songs" ? "เพลง" : "เรื่อง";
      return `ตัวอย่าง${kind}ในเกมที่เจอว่ามี ${label}: ${hits.join(" • ")}${hits.length >= 8 ? " …" : ""}`;
    }

    const matches = findTopMatches({ rawText: text, mode: isSongLikeQuery ? "songs" : "works", limit: 6 });
    const guessedTitle = matches[0] || "";

    if (providerKey && !guessedTitle) {
      const label = LEGAL_PROVIDER_PRESETS?.[providerKey]?.label || providerKey;
      return `ถ้าต้องการหาเฉพาะ ${label}: เลือก “ทุกแพลตฟอร์ม” เป็น ${label} แล้วพิมพ์ชื่อเรื่อง/เพลงในช่องค้นหาด้านบน หรือพิมพ์ชื่อเรื่องมาพร้อมชื่อแพลตฟอร์มก็ได้`;
    }

    const titleToLookup = guessedTitle || text;
    const displayTitle = isSongLikeQuery ? titleToLookup : stripOpEdSuffix(titleToLookup);
    const providers = getProvidersForQueryTitle({ rawTitle: titleToLookup, isSongLike: isSongLikeQuery });
    const providersText = buildProviderLabelList(providers);
    if (providersText) {
      const modeHint = isSongLikeQuery
        ? "ทิป: ถ้าอยากฟัง ให้ลอง Spotify / Apple Music / YouTube Music"
        : "ทิป: กดไอคอนแพลตฟอร์มบนการ์ดเพื่อค้นหาได้เลย";
      const watchListen = isListen && !isWatch ? "ฟัง" : isWatch && !isListen ? "ดู" : "ดู/ฟัง";
      const extra = matches.length > 1 ? `\nชื่อที่ใกล้เคียง: ${matches.slice(1, 4).join(" • ")}${matches.length > 4 ? " …" : ""}` : "";
      return `สำหรับ “${displayTitle}” (อิงจากรายการที่มีในเกม) แนะนำลอง ${watchListen}ที่: ${providersText} (สิทธิ์อาจเปลี่ยนได้) • ${modeHint}${extra}`;
    }

    if (guessedTitle) {
      return `ยังไม่พบข้อมูลสิทธิ์ในไทยสำหรับ “${displayTitle}” ในฐานข้อมูลที่เว็บมีตอนนี้ ลองกดปุ่ม “เพิ่มเติม” ในการ์ด หรือพิมพ์ชื่อให้ใกล้เคียงขึ้นครับ`;
    }

    return "ยังจับชื่อเรื่อง/เพลงไม่เจอ ลองพิมพ์ชื่อให้ชัดขึ้น เช่น ‘Attack on Titan ดูที่ไหน’ หรือ ‘OP1 Oshi no Ko ฟังที่ไหน’";
  };

  const handleLegalBotSend = (e) => {
    e?.preventDefault?.();
    if (page !== "library" || libraryTab !== "legal") return;

    const text = String(legalBotInput || "").trim();
    if (!text) return;

    appendLegalBotMessage("user", text);
    setLegalBotInput("");

    const reply = buildLegalBotReply(text);
    appendLegalBotMessage("bot", reply);
  };

  const currentAnime = gameList[currentIndex] || null;
  const currentChoices = useMemo(() => {
    if (!currentAnime || !answerModeConfig[answerMode].choices) return [];
    return buildChoices(currentAnime, activeGenrePool, 6);
  }, [activeGenrePool, answerMode, currentAnime]);

  // (removed) handleGifUpload / clearGifBackground

  const totalCount = animeWithGenre.length;
  const selectedGenreLabel = selectedGenre === "all"
    ? "รวมทุกแนว"
    : genreConfig[selectedGenre]?.label || selectedGenre;

  const isGameInProgress = page === "play" && gameList.length > 0;

  const buildHistoryState = ({ nextPage, nextLibraryTab }) => {
    return {
      __app: "anime-op-quiz",
      v: 1,
      page: nextPage,
      libraryTab: nextLibraryTab
    };
  };

  const isSameHistoryState = (a, b) => {
    return (
      a?.__app === "anime-op-quiz" &&
      b?.__app === "anime-op-quiz" &&
      a?.page === b?.page &&
      (a?.libraryTab || "catalog") === (b?.libraryTab || "catalog")
    );
  };

  // Initialize and restore app route from History state.
  useEffect(() => {
    try {
      const s = window.history?.state;
      if (s?.__app === "anime-op-quiz" && typeof s.page === "string") {
        setPage(s.page);
        if (typeof s.libraryTab === "string") setLibraryTab(s.libraryTab);
      } else {
        window.history.replaceState(
          buildHistoryState({ nextPage: page, nextLibraryTab: libraryTab }),
          "",
          window.location.pathname + window.location.search
        );
      }
    } catch {
      // ignore
    } finally {
      historyReadyRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push a new history entry when changing app "pages".
  useEffect(() => {
    if (!historyReadyRef.current) return;
    try {
      const next = buildHistoryState({ nextPage: page, nextLibraryTab: libraryTab });
      const curr = window.history?.state;
      if (isSameHistoryState(curr, next)) return;
      window.history.pushState(next, "", window.location.pathname + window.location.search);
    } catch {
      // ignore
    }
  }, [page, libraryTab]);

  // Handle browser Back/Forward.
  useEffect(() => {
    const onPopState = (e) => {
      const s = e?.state;
      const nextPage = typeof s?.page === "string" ? s.page : "home";
      const nextLibraryTab = typeof s?.libraryTab === "string" ? s.libraryTab : "catalog";

      const apply = () => {
        setPage(nextPage);
        setLibraryTab(nextLibraryTab);
      };

      // If leaving an active game via Back, ask first.
      if (isGameInProgress && page === "play" && nextPage !== "play") {
        const ok = window.confirm(
          "กำลังเล่นอยู่ ต้องการออกจากการเล่นจริงๆใช่มั้ย?\nกด OK เพื่อออก หรือ Cancel เพื่ออยู่ต่อ"
        );
        if (ok) {
          apply();
          return;
        }

        // User cancelled: restore current route state.
        try {
          window.history.pushState(
            buildHistoryState({ nextPage: page, nextLibraryTab: libraryTab }),
            "",
            window.location.pathname + window.location.search
          );
        } catch {
          // ignore
        }
        return;
      }

      apply();
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isGameInProgress, page, libraryTab]);

  const confirmLeaveGame = (next) => {
    if (!isGameInProgress) {
      next();
      return;
    }

    const ok = window.confirm(
      "กำลังเล่นอยู่ ต้องการออกจากการเล่นจริงๆใช่มั้ย?\nกด OK เพื่อออก หรือ Cancel เพื่ออยู่ต่อ"
    );
    if (ok) next();
  };

  useEffect(() => {
    if (!isGameInProgress) return;

    const onBeforeUnload = (e) => {
      e.preventDefault();
      // Most browsers ignore custom strings; setting returnValue triggers the confirm dialog.
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isGameInProgress]);

  const getDailyKeyFromDate = (d) => {
    try {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    } catch {
      return "";
    }
  };

  const hashStringToSeed = (str) => {
    // Small deterministic string hash (32-bit)
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i += 1) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return () => {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return h >>> 0;
    };
  };

  const mulberry32 = (seed) => {
    let a = seed >>> 0;
    return () => {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const deterministicShuffle = (arr, seedStr) => {
    const list = Array.isArray(arr) ? arr.slice() : [];
    const seedFn = hashStringToSeed(String(seedStr || ""));
    const rnd = mulberry32(seedFn());
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rnd() * (i + 1));
      const tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }
    return list;
  };

  const base64UrlEncode = (str) => {
    try {
      const b64 = btoa(unescape(encodeURIComponent(String(str || ""))));
      return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    } catch {
      return "";
    }
  };

  const base64UrlDecode = (b64url) => {
    try {
      const s = String(b64url || "").replace(/-/g, "+").replace(/_/g, "/");
      const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
      return decodeURIComponent(escape(atob(s + pad)));
    } catch {
      return "";
    }
  };

  const buildQuestionListFromPool = ({
    pool,
    limit,
    balanceAcrossGenres
  }) => {
    const source = Array.isArray(pool) ? pool : [];
    const max = Math.max(1, Math.min(Number(limit) || 1, source.length));
    const used = new Set();
    const picked = [];

    let tempLastGenre = "";
    const recentSeries = [];
    const seriesWindow = Math.max(0, Number(ruleNoRepeatSeriesWindow) || 0);

    const pickCandidate = (candidates) => {
      if (!candidates.length) return null;
      return candidates[Math.floor(Math.random() * candidates.length)] || null;
    };

    const isOkByRules = (a, { relaxGenre, relaxSeries } = {}) => {
      if (!a || a.id == null) return false;
      if (used.has(a.id)) return false;
      const g = String(a?.genre || "");
      if (!relaxGenre && ruleAvoidSameGenre && tempLastGenre && g && g === tempLastGenre) return false;

      if (!relaxSeries && seriesWindow > 0) {
        const key = baseSeriesKeyFromTitle(a?.title);
        if (key && recentSeries.includes(key)) return false;
      }
      return true;
    };

    const commitPick = (a) => {
      if (!a || a.id == null) return;
      used.add(a.id);
      picked.push(a);
      tempLastGenre = String(a?.genre || "");
      if (seriesWindow > 0) {
        const key = baseSeriesKeyFromTitle(a?.title);
        if (key) {
          recentSeries.push(key);
          while (recentSeries.length > seriesWindow) recentSeries.shift();
        }
      }
    };

    for (let i = 0; i < max; i += 1) {
      let next = null;
      const remaining = source.filter((a) => a && a.id != null && !used.has(a.id));
      if (!remaining.length) break;

      if (balanceAcrossGenres) {
        const genreMap = {};
        for (const a of remaining) {
          const g = String(a?.genre || "");
          if (!g) continue;
          if (!genreMap[g]) genreMap[g] = [];
          genreMap[g].push(a);
        }

        let genreKeys = Object.keys(genreMap);
        // Apply rule filters at the genre level when possible.
        if (ruleAvoidSameGenre && tempLastGenre) {
          const filteredGenreKeys = genreKeys.filter((g) => g !== tempLastGenre);
          if (filteredGenreKeys.length) genreKeys = filteredGenreKeys;
        }

        // Prefer genres that still have at least one item passing the series rule.
        const seriesWindowActive = seriesWindow > 0;
        if (seriesWindowActive) {
          const okGenres = genreKeys.filter((g) => {
            const bucket = genreMap[g] || [];
            return bucket.some((a) => isOkByRules(a, { relaxGenre: true, relaxSeries: false }));
          });
          if (okGenres.length) genreKeys = okGenres;
        }

        const chosenGenre = genreKeys[Math.floor(Math.random() * genreKeys.length)] || "";
        const bucket = (genreMap[chosenGenre] || []).filter((a) => isOkByRules(a));
        if (bucket.length) next = pickCandidate(bucket);
      }

      if (!next) {
        let candidates = remaining.filter((a) => isOkByRules(a));
        if (!candidates.length) candidates = remaining.filter((a) => isOkByRules(a, { relaxGenre: true, relaxSeries: false }));
        next = pickCandidate(candidates);
      }

      if (!next) break;
      commitPick(next);
    }

    return picked;
  };

  const resetRunTracking = () => {
    setRunQuestionStats([]);
    setRunMaxStreak(0);
    setRunCurrStreak(0);
    questionStartedAtRef.current = Date.now();
    questionRecordedRef.current = false;
    lastGenreRef.current = "";
    recentSeriesRef.current = [];
  };

  const startGameFromList = (list, { mode, dailyKey, playModeOverride, groupSetup, roomCode } = {}) => {
    const picked = Array.isArray(list) ? list.filter(Boolean) : [];
    if (!picked.length) return;

    usedAnimeIdsRef.current = new Set((picked || []).map((a) => a?.id).filter((x) => x != null));

    const effectivePlayMode = String(playModeOverride || playMode || "normal");
    if (playModeOverride) setPlayMode(effectivePlayMode);
    const wantsGroup = effectivePlayMode === "group";

    setSessionMode(String(mode || "normal"));
    setSessionDailyKey(dailyKey || "");
    setSessionRoomCode(String(roomCode || ""));
    setDailyLastResult((prev) => {
      if (String(mode) !== "daily") return prev;
      const key = String(dailyKey || "");
      if (!key) return prev;
      const listIds = picked.map((a) => a?.id).filter((x) => x != null);
      return { ...(prev || {}), key, listIds };
    });

    const resetCommon = () => {
      setCurrentIndex(0);
      setAnswer("");
      setScore(0);
      setFeedback(null);
      setShowHint(false);
      setSoloHp(10);
      setSoloWrongMultiplier(1);
      setGroupCorrectPickId("");
      setGroupTurnIndex(0);
      setGroupWrongPickId("");
    };

    resetRunTracking();
    setGameList(picked);
    resetCommon();

    if (wantsGroup) {
      const setup = Array.isArray(groupSetup)
        ? groupSetup.slice(0, 10)
        : Array.isArray(groupSetupPlayers)
          ? groupSetupPlayers.slice(0, 10)
          : [];
      setGroupPlayers(
        setup.map((p, idx) => {
          const name = typeof p === "string" ? p : String(p?.name || "");
          const safeName = name.trim() || `ผู้เล่น ${idx + 1}`;
          const id = typeof p === "object" && p?.id ? String(p.id) : `p-room-${Date.now()}-${idx}`;
          return {
            id,
            name: safeName,
            hp: 10,
            mult: 1,
            score: 0,
            eliminated: false
          };
        })
      );
      setGroupTurnIndex(0);
      setGroupWrongPickId("");
      setGroupCorrectPickId("");
    } else {
      setGroupPlayers([]);
    }

    setPlayStartedAtMs(Date.now());
    setPlayElapsedMs(0);
    setPage("play");

    if (user?.uid && String(mode || "") !== "daily" && String(mode || "") !== "room") {
      bumpPlayCount(user.uid).then((r) => {
        if (r && r.ok === false) {
          setProfileNotice(`อัปเดตจำนวนการเล่นไม่สำเร็จ (${r.error || "unknown"})`);
        }
      });
    }
  };

  const startDailyChallenge = () => {
    setPlayMode("normal");
    const key = getDailyKeyFromDate(new Date());
    if (!key) return;

    const already = String(dailyLastResult?.key || "") === key && Boolean(dailyLastResult?.completedAt);
    if (already) {
      const ok = window.confirm("วันนี้เล่น Daily Challenge ไปแล้ว\nต้องการเล่นซ้ำชุดเดิมอีกครั้งไหม?");
      if (!ok) return;
    }

    const pool = Array.isArray(animeWithGenre) ? animeWithGenre : [];
    const seed = `daily:${key}`;
    const shuffled = deterministicShuffle(pool.filter((a) => a && a.id != null), seed);

    const limit = Math.min(10, shuffled.length);
    const seriesWindow = Math.max(0, Number(ruleNoRepeatSeriesWindow) || 0);

    const pickSequential = ({ relaxGenre }) => {
      const used = new Set();
      const picked = [];
      let lastG = "";
      const recentSeries = [];
      for (const a of shuffled) {
        if (!a || a.id == null) continue;
        if (used.has(a.id)) continue;
        const g = String(a?.genre || "");
        if (!relaxGenre && ruleAvoidSameGenre && lastG && g && g === lastG) continue;
        if (seriesWindow > 0) {
          const k = baseSeriesKeyFromTitle(a?.title);
          if (k && recentSeries.includes(k)) continue;
        }
        used.add(a.id);
        picked.push(a);
        lastG = g;
        if (seriesWindow > 0) {
          const k = baseSeriesKeyFromTitle(a?.title);
          if (k) {
            recentSeries.push(k);
            while (recentSeries.length > seriesWindow) recentSeries.shift();
          }
        }
        if (picked.length >= limit) break;
      }
      return picked;
    };

    let picked = pickSequential({ relaxGenre: false });
    if (picked.length < limit) picked = pickSequential({ relaxGenre: true });

    startGameFromList(picked.slice(0, limit), { mode: "daily", dailyKey: key });
  };

  const startFavoritesMode = () => {
    setPlayMode("normal");
    const pool = favoritesPool;
    if (!pool.length) {
      window.alert("ยังไม่มี Favorites\nไปกด ⭐ ในคลังก่อนนะ");
      return;
    }
    const limit = Math.min(questionCount, pool.length);
    const picked = buildQuestionListFromPool({ pool, limit, balanceAcrossGenres: selectedGenre === "all" });
    startGameFromList(picked, { mode: "favorites" });
  };

  const startPopularMode = () => {
    setPlayMode("normal");
    const pool = popularPool;
    if (!pool.length) {
      window.alert("ยังไม่มีข้อมูลเพลงยอดนิยมของคุณ\nลองเล่นสักพักก่อนนะ");
      return;
    }
    const limit = Math.min(questionCount, pool.length);
    const picked = buildQuestionListFromPool({ pool, limit, balanceAcrossGenres: true });
    startGameFromList(picked, { mode: "popular" });
  };

  const startSeriesMode = () => {
    setPlayMode("normal");
    const key = String(selectedSeriesKey || "");
    const bucket = key ? seriesBuckets?.[key] : null;
    const pool = Array.isArray(bucket?.items) ? bucket.items : [];
    if (!pool.length) {
      window.alert("เลือกเรื่องก่อน แล้วค่อยเริ่มเล่น");
      return;
    }
    const limit = Math.min(questionCount, pool.length);
    const picked = buildQuestionListFromPool({ pool, limit, balanceAcrossGenres: false });
    startGameFromList(picked, { mode: "series" });
  };

  const generateRoomCode = async () => {
    try {
      const pool = activeGenrePool;
      if (!Array.isArray(pool) || !pool.length) return;
      const limit = Math.min(Math.max(1, Number(questionCount) || 5), pool.length);
      const picked = buildQuestionListFromPool({ pool, limit, balanceAcrossGenres: selectedGenre === "all" });
      const ids = (picked || []).map((a) => a?.id).filter((x) => x != null);
      if (!ids.length) return;

      const playModeToEncode = String(playMode || "normal");
      const playersToEncode = playModeToEncode === "group"
        ? (groupSetupPlayers || [])
            .slice(0, 10)
            .map((p) => String(p?.name || "").trim())
            .filter(Boolean)
            .map((name) => name.slice(0, 24))
        : [];

      if (playModeToEncode === "group" && !playersToEncode.length) {
        setRoomNotice("โหมดกลุ่ม: เพิ่มรายชื่อผู้เล่นก่อน แล้วค่อยสร้างโค้ด");
        return;
      }

      const payload = {
        v: 1,
        t: "room",
        ids,
        playMode: playModeToEncode,
        players: playersToEncode,
        questionCount: limit,
        selectedGenre,
        answerMode,
        ruleAvoidSameGenre,
        ruleNoRepeatSeriesWindow,
        createdAt: Date.now()
      };

      const code = base64UrlEncode(JSON.stringify(payload));
      if (!code) return;
      setRoomCodeDraft(code);
      setRoomNotice("สร้างโค้ดแล้ว");

      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        setRoomNotice("คัดลอกโค้ดแล้ว");
      }
    } catch {
      setRoomNotice("สร้างโค้ดไม่สำเร็จ");
    }
  };

  const startFromRoomCode = (codeOverride) => {
    const raw = String(codeOverride != null ? codeOverride : roomCodeDraft || "").trim();
    if (!raw) return;
    const decoded = base64UrlDecode(raw);
    if (!decoded) {
      setRoomNotice("โค้ดไม่ถูกต้อง");
      return;
    }

    let data = null;
    try {
      data = JSON.parse(decoded);
    } catch {
      setRoomNotice("โค้ดไม่ถูกต้อง");
      return;
    }

    if (!data || data.v !== 1 || data.t !== "room") {
      setRoomNotice("โค้ดไม่รองรับ");
      return;
    }

    const ids = Array.isArray(data.ids) ? data.ids.slice(0, 30) : [];
    if (!ids.length) {
      setRoomNotice("โค้ดไม่มีรายการเพลง");
      return;
    }

    const playModeFromCode = typeof data.playMode === "string" ? data.playMode : "normal";

    if (typeof data.selectedGenre === "string") setSelectedGenre(data.selectedGenre);

    if (typeof data.answerMode === "string") {
      const desired = data.answerMode;
      setAnswerMode(desired);
    }

    setRuleAvoidSameGenre(Boolean(data.ruleAvoidSameGenre));
    setRuleNoRepeatSeriesWindow(Math.max(0, Number(data.ruleNoRepeatSeriesWindow) || 0));

    let setupPlayers = [];
    if (playModeFromCode === "group") {
      const names = Array.isArray(data.players) ? data.players : [];
      setupPlayers = names
        .slice(0, 10)
        .map((n) => String(n || "").trim())
        .filter(Boolean)
        .map((name, idx) => ({
          id: `p-room-${Date.now()}-${idx}`,
          name: name.slice(0, 24)
        }));

      if (!setupPlayers.length) {
        setRoomNotice("โหมดกลุ่มต้องมีรายชื่อผู้เล่นในโค้ด");
        return;
      }
      setGroupSetupPlayers(setupPlayers);
    }

    const mapById = new Map((animeWithGenre || []).filter((a) => a && a.id != null).map((a) => [Number(a.id), a]));
    const list = ids.map((id) => mapById.get(Number(id)) || null).filter(Boolean);
    if (!list.length) {
      setRoomNotice("ไม่พบเพลงตามโค้ดนี้ในฐานข้อมูล");
      return;
    }

    setHomeSetupOpen(false);
    startGameFromList(list, {
      mode: "room",
      playModeOverride: playModeFromCode,
      groupSetup: setupPlayers,
      roomCode: raw
    });
  };

  const restartSession = () => {
    if (sessionMode === "daily") {
      startDailyChallenge();
      return;
    }
    if (sessionMode === "favorites") {
      startFavoritesMode();
      return;
    }
    if (sessionMode === "popular") {
      startPopularMode();
      return;
    }
    if (sessionMode === "series") {
      startSeriesMode();
      return;
    }
    if (sessionMode === "room" && String(sessionRoomCode || "").trim()) {
      startFromRoomCode(String(sessionRoomCode || "").trim());
      return;
    }
    startGame();
  };

  const startGame = () => {
    const pool = activeGenrePool;

    if (!Array.isArray(pool) || !pool.length) return;

    usedAnimeIdsRef.current = new Set();

    if (isNormalPlay) {
      const limit = Math.min(questionCount, pool.length);
      const picked = buildQuestionListFromPool({
        pool,
        limit,
        balanceAcrossGenres: selectedGenre === "all"
      });
      startGameFromList(picked, { mode: "normal" });
      return;
    }

    const first = selectedGenre === "all"
      ? buildQuestionListFromPool({ pool, limit: 1, balanceAcrossGenres: true })[0] || null
      : (pool[Math.floor(Math.random() * pool.length)] || null);
    if (!first) return;
    if (first?.id != null && usedAnimeIdsRef.current instanceof Set) usedAnimeIdsRef.current.add(first.id);

    if (isSoloChallenge) {
      startGameFromList([first], { mode: "solo_challenge" });
      return;
    }

    if (isTimeAttack) {
      startGameFromList([first], { mode: "normal" });
      return;
    }

    // Group mode
    const setup = Array.isArray(groupSetupPlayers) ? groupSetupPlayers.slice(0, 10) : [];
    if (!setup.length) return;
    resetRunTracking();
    setGameList([first]);
    setCurrentIndex(0);
    setAnswer("");
    setScore(0);
    setFeedback(null);
    setShowHint(false);
    setSoloHp(10);
    setSoloWrongMultiplier(1);
    setGroupCorrectPickId("");
    setGroupPlayers(
      setup.map((p) => ({
        id: p.id,
        name: p.name,
        hp: 10,
        mult: 1,
        score: 0,
        eliminated: false
      }))
    );
    setGroupTurnIndex(0);
    setGroupWrongPickId("");
    setPlayStartedAtMs(Date.now());
    setPlayElapsedMs(0);
    setPage("play");
  };

  useEffect(() => {
    if (!homeSetupOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (specialModesOpen) return;
        setHomeSetupOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [homeSetupOpen, specialModesOpen]);

  useEffect(() => {
    if (!specialModesOpen) return;
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      setSpecialModesOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [specialModesOpen]);

  const pickRandomUnusedFromPool = (pool) => {
    if (!Array.isArray(pool) || !pool.length) return null;
    const used = usedAnimeIdsRef.current instanceof Set ? usedAnimeIdsRef.current : new Set();
    if (!(usedAnimeIdsRef.current instanceof Set)) usedAnimeIdsRef.current = used;
    for (const x of gameList || []) {
      const id = x?.id;
      if (id != null) used.add(id);
    }

    const seriesWindow = Math.max(0, Number(ruleNoRepeatSeriesWindow) || 0);
    const lastGenre = String(lastGenreRef.current || "");
    const recentSeries = Array.isArray(recentSeriesRef.current) ? recentSeriesRef.current : [];

    const isOk = (a, { relaxGenre, relaxSeries } = {}) => {
      if (!a || a.id == null) return false;
      if (used.has(a.id)) return false;
      const g = String(a?.genre || "");
      if (!relaxGenre && ruleAvoidSameGenre && lastGenre && g && g === lastGenre) return false;
      if (!relaxSeries && seriesWindow > 0) {
        const key = baseSeriesKeyFromTitle(a?.title);
        if (key && recentSeries.includes(key)) return false;
      }
      return true;
    };

    const remaining = pool.filter((a) => a && a.id != null && !used.has(a.id));
    if (!remaining.length) return null;

    const pickAny = (list) => (list.length ? list[Math.floor(Math.random() * list.length)] : null);

    if (selectedGenre === "all") {
      const genreMap = {};
      for (const a of remaining) {
        if (!isOk(a, { relaxGenre: true, relaxSeries: false })) continue;
        const g = String(a?.genre || "");
        if (!g) continue;
        if (!genreMap[g]) genreMap[g] = [];
        genreMap[g].push(a);
      }

      let genres = Object.keys(genreMap);
      if (ruleAvoidSameGenre && lastGenre) {
        const filtered = genres.filter((g) => g !== lastGenre);
        if (filtered.length) genres = filtered;
      }

      let next = null;
      if (genres.length) {
        const chosen = genres[Math.floor(Math.random() * genres.length)] || "";
        const bucket = (genreMap[chosen] || []).filter((a) => isOk(a));
        next = pickAny(bucket);
      }

      if (!next) {
        let candidates = remaining.filter((a) => isOk(a));
        if (!candidates.length) candidates = remaining.filter((a) => isOk(a, { relaxGenre: true, relaxSeries: false }));
        next = pickAny(candidates);
      }

      if (next?.id != null) used.add(next.id);
      return next || null;
    }

    let candidates = remaining.filter((a) => isOk(a));
    if (!candidates.length) candidates = remaining.filter((a) => isOk(a, { relaxGenre: true, relaxSeries: false }));
    const next = pickAny(candidates) || null;
    if (next?.id != null) used.add(next.id);
    return next;
  };

  const renderSpecialModesPanel = () => (
    <div
      className="fixed inset-0 z-[70]"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setSpecialModesOpen(false);
      }}
    >
      <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm" />
      <div className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto p-4 md:p-6">
        <Card className="rounded-3xl border border-white/70 bg-white/90 shadow-[0_28px_56px_rgba(19,34,76,0.25)] backdrop-blur-xl overflow-hidden dark:border-slate-700/40 dark:bg-slate-950/75 dark:shadow-[0_28px_56px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/20 via-transparent to-purple-50/20 pointer-events-none dark:from-cyan-400/10 dark:to-blue-500/10" />
          <CardHeader className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">โหมดพิเศษ</CardTitle>
                <CardDescription>Daily / Favorites / ยอดนิยม / เล่นจากเรื่อง / Room Code</CardDescription>
              </div>
              <Button
                variant="ghost"
                className="rounded-2xl"
                onClick={() => setSpecialModesOpen(false)}
                title="ปิด"
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSpecialModesOpen(false);
                  setHomeSetupOpen(false);
                  startDailyChallenge();
                }}
                className="text-left rounded-2xl border p-4 transition duration-300 text-slate-900 dark:text-slate-100 border-slate-200 bg-white/60 hover:bg-white/80 hover:border-amber-400 dark:border-slate-700 dark:bg-slate-950/35 dark:hover:bg-slate-900/45 dark:hover:border-cyan-400/40"
              >
                <div className="font-semibold text-lg">📅 Daily Challenge</div>
                <div className="text-sm mt-1 text-slate-600 dark:text-slate-300">ชุดประจำวัน (10 ข้อ)</div>
              </motion.button>

              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSpecialModesOpen(false);
                  setHomeSetupOpen(false);
                  startFavoritesMode();
                }}
                className="text-left rounded-2xl border p-4 transition duration-300 text-slate-900 dark:text-slate-100 border-slate-200 bg-white/60 hover:bg-white/80 hover:border-amber-400 dark:border-slate-700 dark:bg-slate-950/35 dark:hover:bg-slate-900/45 dark:hover:border-cyan-400/40"
              >
                <div className="font-semibold text-lg">⭐ Favorites</div>
                <div className="text-sm mt-1 text-slate-600 dark:text-slate-300">เล่นจากเพลงที่กดดาว ({favoriteIds.length})</div>
              </motion.button>

              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSpecialModesOpen(false);
                  setHomeSetupOpen(false);
                  startPopularMode();
                }}
                className="text-left rounded-2xl border p-4 transition duration-300 text-slate-900 dark:text-slate-100 border-slate-200 bg-white/60 hover:bg-white/80 hover:border-amber-400 dark:border-slate-700 dark:bg-slate-950/35 dark:hover:bg-slate-900/45 dark:hover:border-cyan-400/40"
              >
                <div className="font-semibold text-lg">🔥 ยอดนิยมของคุณ</div>
                <div className="text-sm mt-1 text-slate-600 dark:text-slate-300">อิงจากสถิติในเครื่อง ({popularPool.length})</div>
              </motion.button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-950/35 space-y-3">
              <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50">🎬 เล่นจากเรื่อง (เลือกอนิเมะ)</div>

              <Input
                value={animeSeriesQuery}
                onChange={(e) => setAnimeSeriesQuery(e.target.value)}
                placeholder="พิมพ์ค้นหาชื่อเรื่อง..."
                className="rounded-2xl h-11"
              />

              <select
                value={selectedSeriesKey}
                onChange={(e) => setSelectedSeriesKey(e.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950/45 dark:text-slate-100"
              >
                <option value="">เลือกเรื่อง...</option>
                {Object.values(seriesBuckets || {})
                  .filter((s) => {
                    const q = normalize(animeSeriesQuery);
                    if (!q) return true;
                    const hay = normalize(`${s?.label || ""} ${s?.key || ""}`);
                    return hay.includes(q);
                  })
                  .slice()
                  .sort((a, b) => (b?.items?.length || 0) - (a?.items?.length || 0))
                  .slice(0, 50)
                  .map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label} ({(s.items || []).length})
                    </option>
                  ))}
              </select>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="rounded-2xl font-semibold"
                  disabled={!selectedSeriesKey}
                  onClick={() => {
                    setSpecialModesOpen(false);
                    setHomeSetupOpen(false);
                    startSeriesMode();
                  }}
                >
                  เริ่มเล่นจากเรื่องนี้
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => {
                    setSelectedSeriesKey("");
                    setAnimeSeriesQuery("");
                  }}
                >
                  ล้าง
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-950/35 space-y-3">
              <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50">🎟️ Room Code (เล่นชุดเดียวกับเพื่อน)</div>
              <div className="text-xs text-slate-600 dark:text-slate-300">สร้างโค้ดเพื่อแชร์ “ชุดคำถาม” ให้เพื่อนเล่นเหมือนกัน (ไม่ใช่ห้องออนไลน์)</div>

              <Input
                value={roomCodeDraft}
                onChange={(e) => setRoomCodeDraft(e.target.value)}
                placeholder="วางโค้ดห้องที่นี่..."
                className="rounded-2xl h-11"
              />

              <div className="flex flex-wrap gap-2">
                <Button type="button" className="rounded-2xl font-semibold" onClick={generateRoomCode}>
                  สร้างโค้ดจากการตั้งค่านี้
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => {
                    setSpecialModesOpen(false);
                    startFromRoomCode();
                  }}
                  disabled={!String(roomCodeDraft || "").trim()}
                >
                  เริ่มจากโค้ด
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => {
                    setRoomCodeDraft("");
                    setRoomNotice("");
                  }}
                >
                  ล้าง
                </Button>
              </div>

              {roomNotice ? <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">{roomNotice}</div> : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const advanceQuestion = () => {
    if (sessionMode === "room" && Array.isArray(gameList) && gameList.length) {
      if (currentIndex + 1 < gameList.length) {
        setCurrentIndex((prev) => prev + 1);
        setAnswer("");
        setFeedback(null);
        setShowHint(false);
      } else {
        setPage("result");
      }
      return;
    }

    if (isNormalPlay) {
      if (currentIndex + 1 < gameList.length) {
        setCurrentIndex((prev) => prev + 1);
        setAnswer("");
        setFeedback(null);
        setShowHint(false);
      } else {
        setPage("result");
      }
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < gameList.length) {
      setCurrentIndex(nextIndex);
      setAnswer("");
      setFeedback(null);
      setShowHint(false);
      return;
    }

    const nextAnime = pickRandomUnusedFromPool(activeGenrePool);
    if (!nextAnime) {
      setPage("result");
      return;
    }
    setGameList((prev) => [...(prev || []), nextAnime]);
    setCurrentIndex(nextIndex);
    setAnswer("");
    setFeedback(null);
    setShowHint(false);
  };

  const goNext = () => {
    if (isSoloChallenge && soloHp <= 0) {
      setPage("result");
      return;
    }
    advanceQuestion();
  };

  const applySoloWrongPenalty = () => {
    const penalty = Math.max(1, typeof soloWrongMultiplier === "number" ? soloWrongMultiplier : 1);
    setSoloHp((prevHp) => {
      const hp = typeof prevHp === "number" ? prevHp : 0;
      return Math.max(0, hp - penalty);
    });
    setSoloWrongMultiplier((prev) => {
      const m = typeof prev === "number" ? prev : 1;
      return Math.max(1, m) * 2;
    });
  };

  const resetSoloMultiplier = () => setSoloWrongMultiplier(1);

  const getGroupNextTurnIndex = (players, fromIndex) => {
    const list = Array.isArray(players) ? players : [];
    if (!list.length) return 0;
    const start = Math.max(0, Math.min(list.length - 1, Number(fromIndex) || 0));
    for (let step = 1; step <= list.length; step += 1) {
      const idx = (start + step) % list.length;
      const p = list[idx];
      const hp = typeof p?.hp === "number" ? p.hp : 10;
      if (hp > 0) return idx;
    }
    return start;
  };

  useEffect(() => {
    if (!isGroupMode) return;
    setGroupTurnIndex((idx) => {
      const list = Array.isArray(groupPlayers) ? groupPlayers : [];
      if (!list.length) return 0;
      const safe = Math.max(0, Math.min(list.length - 1, Number(idx) || 0));
      const hp = typeof list[safe]?.hp === "number" ? list[safe].hp : 10;
      if (hp > 0) return safe;
      return getGroupNextTurnIndex(list, safe);
    });
  }, [groupPlayers, isGroupMode]);

  const getGroupDefaultCorrectPickId = (players, turnIndex) => {
    const list = Array.isArray(players) ? players : [];
    if (!list.length) return "";
    const turn = Math.max(0, Math.min(list.length - 1, Number(turnIndex) || 0));
    const curr = list[turn] || null;
    if (curr?.id) return String(curr.id);
    const fallback = list.find((p) => {
      const hp = typeof p?.hp === "number" ? p.hp : 10;
      return hp > 0 && p?.id;
    });
    return fallback?.id ? String(fallback.id) : "";
  };

  useEffect(() => {
    if (page !== "play") return;
    if (!currentAnime) return;
    questionStartedAtRef.current = Date.now();
    questionRecordedRef.current = false;
  }, [page, currentIndex, currentAnime?.id]);

  const recordCurrentQuestionResult = ({ outcome, answeredText } = {}) => {
    if (!currentAnime) return;
    if (questionRecordedRef.current) return;

    const startedAt = typeof questionStartedAtRef.current === "number" ? questionStartedAtRef.current : Date.now();
    const ms = Math.max(0, Date.now() - startedAt);
    questionRecordedRef.current = true;

    const id = currentAnime?.id;
    const idKey = id == null ? "" : String(id);
    const genre = String(currentAnime?.genre || "");
    const title = String(currentAnime?.title || "");

    setRunQuestionStats((prev) => {
      const next = Array.isArray(prev) ? prev.slice() : [];
      next.push({ id, title, genre, ms, outcome: String(outcome || ""), answeredText: answeredText ? String(answeredText) : "" });
      return next.slice(-300);
    });

    setRunCurrStreak((prev) => {
      const p = typeof prev === "number" ? prev : 0;
      const next = outcome === "correct" ? p + 1 : 0;
      setRunMaxStreak((m) => Math.max(typeof m === "number" ? m : 0, next));
      return next;
    });

    lastGenreRef.current = genre || lastGenreRef.current || "";
    if (ruleNoRepeatSeriesWindow > 0) {
      const key = baseSeriesKeyFromTitle(title);
      if (key) {
        const arr = Array.isArray(recentSeriesRef.current) ? recentSeriesRef.current : [];
        arr.push(key);
        while (arr.length > ruleNoRepeatSeriesWindow) arr.shift();
        recentSeriesRef.current = arr;
      }
    }

    if (idKey) {
      setLocalStats((prev) => {
        const safePrev = prev && typeof prev === "object" ? prev : { byId: {} };
        const byId = safePrev.byId && typeof safePrev.byId === "object" ? safePrev.byId : {};
        const curr = byId[idKey] && typeof byId[idKey] === "object" ? byId[idKey] : {};
        const plays = (Number(curr.plays || 0) || 0) + 1;
        const correct = (Number(curr.correct || 0) || 0) + (outcome === "correct" ? 1 : 0);
        const wrong = (Number(curr.wrong || 0) || 0) + (outcome === "wrong" || outcome === "skip" ? 1 : 0);
        const timeMs = (Number(curr.timeMs || 0) || 0) + ms;
        return {
          ...safePrev,
          byId: {
            ...byId,
            [idKey]: {
              ...curr,
              plays,
              correct,
              wrong,
              timeMs,
              lastAt: Date.now()
            }
          }
        };
      });
    }
  };

  const checkAnswer = (value) => {
    if (!currentAnime) return;

    const pointsPerCorrect = answerModeConfig?.[answerMode]?.choices ? 1 : 2;
    
    // หากได้รับ anime object ให้เช็ค id โดยตรง
    const targetAnime = typeof value === "object" ? value : null;
    const answerText = typeof value === "object" ? value.title : value;

    const normalized = normalize(answerText);
    const baseTitle = extractBaseTitle(answerText);

    // ถ้าเป็น choice และ id ตรงกัน ถือว่าถูกทันที
    if (targetAnime && targetAnime.id === currentAnime.id) {
      recordCurrentQuestionResult({ outcome: "correct", answeredText: answerText });
      if (!isGroupMode) {
        setScore((prev) => prev + 1);
        if (user?.uid) {
          bumpTotalScore(user.uid, pointsPerCorrect).then((r) => {
            if (r && r.ok === false) {
              setProfileNotice(`อัปเดตคะแนนสะสมไม่สำเร็จ (${r.error || "unknown"})`);
            }
          });
        }
      }
      if (isSoloChallenge) resetSoloMultiplier();
      if (isGroupMode) {
        setGroupCorrectPickId(getGroupDefaultCorrectPickId(groupPlayers, groupTurnIndex));
        setGroupWrongPickId("");
      }
      setFeedback({ type: "correct", message: `ถูกต้อง! คำตอบคือ ${currentAnime.title}` });
      return;
    }
    
    // ตรวจสอบ exact match ก่อน
    let isCorrect = currentAnime.acceptedAnswers.some((ans) => normalize(ans) === normalized);
    
    // หากไม่ตรง ให้ลองตรวจสอบ base title (ตัดภาค/season/part ออก)
    if (!isCorrect) {
      isCorrect = currentAnime.acceptedAnswers.some((ans) => extractBaseTitle(ans) === baseTitle);
    }

    if (isCorrect) {
      recordCurrentQuestionResult({ outcome: "correct", answeredText: answerText });
      if (!isGroupMode) {
        setScore((prev) => prev + 1);
        if (user?.uid) {
          bumpTotalScore(user.uid, pointsPerCorrect).then((r) => {
            if (r && r.ok === false) {
              setProfileNotice(`อัปเดตคะแนนสะสมไม่สำเร็จ (${r.error || "unknown"})`);
            }
          });
        }
      }
      if (isSoloChallenge) resetSoloMultiplier();
      if (isGroupMode) {
        setGroupCorrectPickId(getGroupDefaultCorrectPickId(groupPlayers, groupTurnIndex));
        setGroupWrongPickId("");
      }
      setFeedback({ type: "correct", message: `ถูกต้อง! คำตอบคือ ${currentAnime.title}` });
    } else {
      if (isSoloChallenge) applySoloWrongPenalty();
      if (isGroupMode) {
        const turn = Math.max(0, Math.min((groupPlayers || []).length - 1, Number(groupTurnIndex) || 0));
        const curr = (groupPlayers || [])[turn] || null;
        setGroupWrongPickId(String(curr?.id || ""));
        setGroupCorrectPickId("");
        setFeedback({ type: "wrong", message: "ยังไม่ถูก เลือกคนที่ตอบผิด แล้วให้คนถัดไปลองตอบต่อ" });
        return;
      }
      recordCurrentQuestionResult({ outcome: "wrong", answeredText: answerText });
      setFeedback({ type: "wrong", message: `ยังไม่ถูก คำตอบคือ ${currentAnime.title}` });
    }
  };

  const submitAnswer = () => {
    if (!answer.trim()) return;
    checkAnswer(answer);
  };

  const skipQuestion = () => {
    if (isSoloChallenge) applySoloWrongPenalty();
    if (isGroupMode) {
      const turn = Math.max(0, Math.min((groupPlayers || []).length - 1, Number(groupTurnIndex) || 0));
      const curr = (groupPlayers || [])[turn] || null;
      setGroupWrongPickId(String(curr?.id || ""));
    }
    recordCurrentQuestionResult({ outcome: "skip", answeredText: "" });
    setFeedback({ type: "skip", message: `ข้อนี้คือ ${currentAnime?.title}` });
  };

  const resetAll = () => {
    confirmLeaveGame(() => {
      setPage("home");
      setPlayStartedAtMs(null);
      setPlayElapsedMs(0);
      setGameList([]);
      usedAnimeIdsRef.current = new Set();
      setCurrentIndex(0);
      setAnswer("");
      setScore(0);
      setFeedback(null);
      setShowHint(false);
      setSoloHp(10);
      setSoloWrongMultiplier(1);
      setGroupPlayers([]);
      setGroupCorrectPickId("");
      setGroupTurnIndex(0);
      setGroupWrongPickId("");
    });
  };

  const shareResultAsImage = async () => {
    try {
      const total = Array.isArray(gameList) ? gameList.length : 0;
      if (!total) return;

      const isNormal = isNormalPlay;
      const percentage = isNormal ? Math.round((score / total) * 100) : 0;
      const modeLabel = sessionMode === "daily"
        ? "Daily Challenge"
        : sessionMode === "favorites"
          ? "Favorites"
          : sessionMode === "popular"
            ? "Popular"
            : sessionMode === "series"
              ? "Anime"
              : sessionMode === "room"
                ? "Room"
                : isGroupMode
                  ? "Group"
                  : isSoloChallenge
                    ? "Solo Challenge"
                    : isTimeAttack
                      ? "Time Attack (3m)"
                    : "Normal";

      const title = "OtoVerse";
      const host = typeof window !== "undefined" ? window.location.host : "";

      const primaryLine = isGroupMode
        ? `Questions: ${total} • Time: ${formatPlayElapsedThai(playElapsedMs)}`
        : isSoloChallenge
          ? `Correct: ${score} • HP: ${soloHp} • Questions: ${total} • Time: ${formatPlayElapsedThai(playElapsedMs)}`
          : `Score: ${score}/${total} (${percentage}%) • Time: ${formatPlayElapsedThai(playElapsedMs)}`;

      const qStats = Array.isArray(runQuestionStats) ? runQuestionStats : [];
      const correctQs = qStats.filter((x) => x?.outcome === "correct").length;
      const wrongQs = qStats.filter((x) => x?.outcome === "wrong").length;
      const skipQs = qStats.filter((x) => x?.outcome === "skip").length;
      const totalRecorded = qStats.length || total;

      const topTitles = (() => {
        const seen = new Set();
        const out = [];

        const fastestCorrect = qStats
          .filter((x) => x?.outcome === "correct")
          .slice()
          .sort((a, b) => (Number(a?.ms || 0) || 0) - (Number(b?.ms || 0) || 0));

        for (const x of fastestCorrect) {
          const t = String(x?.title || "").trim();
          if (!t) continue;
          if (seen.has(t)) continue;
          seen.add(t);
          out.push(t);
          if (out.length >= 3) break;
        }

        if (out.length < 3) {
          for (const a of Array.isArray(gameList) ? gameList : []) {
            const t = String(a?.title || "").trim();
            if (!t) continue;
            if (seen.has(t)) continue;
            seen.add(t);
            out.push(t);
            if (out.length >= 3) break;
          }
        }

        return out;
      })();

      const headerLine = sessionMode === "daily" && sessionDailyKey
        ? `Daily • ${sessionDailyKey}`
        : modeLabel;

      const subLines = [headerLine, primaryLine, `Max streak: ${runMaxStreak}`, host].filter(Boolean);

      const loadImage = (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = src;
        });

      const size = 1080;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const roundRectPath = (x, y, w, h, r) => {
        const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
        ctx.beginPath();
        ctx.moveTo(x + rr, y);
        ctx.arcTo(x + w, y, x + w, y + h, rr);
        ctx.arcTo(x + w, y + h, x, y + h, rr);
        ctx.arcTo(x, y + h, x, y, rr);
        ctx.arcTo(x, y, x + w, y, rr);
        ctx.closePath();
      };

      const wrapText = ({ text, x, y, maxWidth, lineHeight }) => {
        const words = String(text || "").split(/\s+/).filter(Boolean);
        let line = "";
        let cy = y;
        for (const w of words) {
          const test = line ? `${line} ${w}` : w;
          if (ctx.measureText(test).width <= maxWidth) {
            line = test;
          } else {
            if (line) ctx.fillText(line, x, cy);
            line = w;
            cy += lineHeight;
          }
        }
        if (line) ctx.fillText(line, x, cy);
        return cy;
      };

      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, size, size);
      bg.addColorStop(0, "#0ea5e9");
      bg.addColorStop(0.55, "#2563eb");
      bg.addColorStop(1, "#9333ea");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, size, size);

      // Card
      const cardX = 64;
      const cardY = 88;
      const cardW = size - cardX * 2;
      const cardH = size - cardY * 2;
      ctx.save();
      roundRectPath(cardX, cardY, cardW, cardH, 48);
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.stroke();
      ctx.restore();

      const logo = await loadImage("/pwa-192.png");
      if (logo) {
        const logoSize = 108;
        ctx.save();
        roundRectPath(cardX + 48, cardY + 40, logoSize, logoSize, 28);
        ctx.clip();
        ctx.drawImage(logo, cardX + 48, cardY + 40, logoSize, logoSize);
        ctx.restore();
      }

      // Title
      ctx.fillStyle = "#0f172a";
      ctx.font = "800 64px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
      const titleX = cardX + 48 + (logo ? 128 : 0);
      ctx.fillText(title, titleX, cardY + 110);

      ctx.fillStyle = "#334155";
      ctx.font = "700 34px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
      ctx.fillText("Quiz Result", titleX, cardY + 160);

      // Body
      const bodyX = cardX + 48;
      const bodyTop = cardY + 240;
      const bodyMaxW = cardW - 96;

      ctx.fillStyle = "#0f172a";
      ctx.font = "700 44px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
      wrapText({ text: subLines[0] || "", x: bodyX, y: bodyTop, maxWidth: bodyMaxW, lineHeight: 58 });

      ctx.fillStyle = "#0f172a";
      ctx.font = "600 38px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
      let y = bodyTop + 90;
      for (const line of subLines.slice(1, 3)) {
        y = wrapText({ text: line, x: bodyX, y, maxWidth: bodyMaxW, lineHeight: 52 }) + 22;
      }

      // Mini chart: correct / wrong / skip
      const barW = bodyMaxW;
      const barH = 22;
      const barY = y + 18;
      const barX = bodyX;
      const safeTotal = Math.max(1, Number(totalRecorded) || 1);
      const wCorrect = Math.round((barW * correctQs) / safeTotal);
      const wWrong = Math.round((barW * wrongQs) / safeTotal);
      const wSkip = Math.max(0, barW - wCorrect - wWrong);

      ctx.save();
      roundRectPath(barX, barY, barW, barH, 12);
      ctx.clip();
      ctx.fillStyle = "rgba(15,23,42,0.10)";
      ctx.fillRect(barX, barY, barW, barH);
      let cx = barX;
      if (wCorrect > 0) {
        ctx.fillStyle = "#10b981";
        ctx.fillRect(cx, barY, wCorrect, barH);
        cx += wCorrect;
      }
      if (wWrong > 0) {
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(cx, barY, wWrong, barH);
        cx += wWrong;
      }
      if (wSkip > 0) {
        ctx.fillStyle = "#f59e0b";
        ctx.fillRect(cx, barY, wSkip, barH);
      }
      ctx.restore();

      ctx.fillStyle = "#334155";
      ctx.font = "700 28px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
      ctx.fillText(`✅ ${correctQs}   ❌ ${wrongQs}   ⏭️ ${skipQs}`, barX, barY + 54);

      let y2 = barY + 92;
      if (topTitles.length) {
        ctx.fillStyle = "#0f172a";
        ctx.font = "800 30px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
        ctx.fillText("Top 3 in this run", barX, y2);
        y2 += 44;

        ctx.fillStyle = "#0f172a";
        ctx.font = "600 30px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
        for (let i = 0; i < topTitles.length; i += 1) {
          const t = topTitles[i];
          y2 = wrapText({ text: `${i + 1}. ${t}`, x: barX, y: y2, maxWidth: bodyMaxW, lineHeight: 40 }) + 14;
          if (y2 > cardY + cardH - 160) break;
        }
      }

      ctx.fillStyle = "#334155";
      ctx.font = "600 34px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
      wrapText({ text: subLines[3] || "", x: bodyX, y: cardY + cardH - 110, maxWidth: bodyMaxW, lineHeight: 48 });

      // Footer
      ctx.fillStyle = "#475569";
      ctx.font = "600 28px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
      const footer = host ? `Play at ${host}` : "";
      if (footer) ctx.fillText(footer, bodyX, cardY + cardH - 56);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;

      const filename = `otoverse-${String(sessionMode || "result")}-${Date.now()}.png`;
      const file = new File([blob], filename, { type: "image/png" });

      const shareText = `${title} — ${modeLabel}${sessionMode === "daily" && sessionDailyKey ? ` (${sessionDailyKey})` : ""}`;

      if (navigator?.share && navigator?.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText });
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (page !== "play") {
      setFeedback(null);
    }
  }, [page]);

  useEffect(() => {
    if (page !== "result") return;
    if (sessionMode !== "daily") return;
    const key = String(sessionDailyKey || "").trim();
    if (!key) return;

    setDailyLastResult((prev) => {
      const listIds = (gameList || []).map((a) => a?.id).filter((x) => x != null);
      return {
        ...(prev || {}),
        key,
        listIds,
        completedAt: Date.now(),
        score: Number(score) || 0,
        total: listIds.length,
        elapsedMs: Number(playElapsedMs) || 0,
        maxStreak: Number(runMaxStreak) || 0
      };
    });
  }, [page, sessionMode, sessionDailyKey, gameList, score, playElapsedMs, runMaxStreak]);

  useEffect(() => {
    if (page !== "about") setAboutSection(null);
  }, [page]);

  const renderHome = () => (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5 items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-3"
        >
          <Card className="rounded-3xl border border-white/70 bg-white/85 shadow-[0_28px_56px_rgba(19,34,76,0.18)] backdrop-blur-xl overflow-hidden dark:border-slate-700/40 dark:bg-slate-950/55 dark:shadow-[0_28px_56px_rgba(0,0,0,0.35)]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-purple-50/40 pointer-events-none dark:from-cyan-400/10 dark:to-blue-500/10" />
            <CardHeader className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">OtoVerse</Badge>
                <Badge variant="outline" className="rounded-full">เลือกแนวจากนั้นเด้ง!</Badge>
              </div>
              <CardTitle className="font-display text-3xl md:text-4xl bg-gradient-to-r from-slate-900 to-slate-700 dark:from-cyan-200 dark:to-slate-100 bg-clip-text text-transparent">OtoVerse</CardTitle>
              <CardDescription className="text-base leading-7 text-slate-600 dark:text-slate-200/80">
                กดเริ่มเล่น ⟶ เลือกแนว ⟶ ตั้งค่าเกม + เลือกโหมด ⟶ เด้งเข้าเล่นเกม
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
                      onClick={() => setHomeSetupOpen(true)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      เริ่มเล่นทายเพลง
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:hover:bg-slate-900/60"
                      onClick={() => confirmLeaveGame(() => setPage("community"))}
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Community
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:hover:bg-slate-900/60"
                      onClick={() => confirmLeaveGame(() => setPage("online"))}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      เล่นออนไลน์
                    </Button>
                  </motion.div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:hover:bg-slate-900/60"
                    onClick={() => {
                      setPage("library");
                      setLibraryTab("catalog");
                    }}
                  >
                    <ListMusic className="w-4 h-4 mr-2" />
                    คลังเพลง
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:hover:bg-slate-900/60"
                    onClick={() => {
                      setPage("library");
                      setLibraryTab("legal");
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    ช่องทาง/ฟัง
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.05 }} className="lg:col-span-2">
          <Card className="rounded-3xl border border-white/70 bg-white/85 shadow-[0_20px_40px_rgba(19,34,76,0.14)] backdrop-blur-xl overflow-hidden dark:border-slate-700/40 dark:bg-slate-950/55 dark:shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
            <CardHeader className="relative">
              <CardTitle className="text-lg"> อันดับผู้เล่น</CardTitle>
              <CardDescription>อิงคะแนนสะสม • เสมอค่อยดูจำนวนการเล่น</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {!user?.uid ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100">
                  ล็อกอินก่อนเพื่อดูอันดับผู้เล่น
                </div>
              ) : null}
              {leaderboardError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-900 dark:border-rose-400/40 dark:bg-slate-900/40 dark:text-rose-100">
                  โหลดอันดับผู้เล่นไม่สำเร็จ ({leaderboardError})
                </div>
              ) : null}
              {(leaderboard || []).length ? (
                leaderboard.map((p, idx) => {
                  const name = String(p?.nickname || "").trim() || String(p?.displayName || "").trim() || String(p?.email || "").split("@")[0] || "ผู้เล่น";
                  const photo = String(p?.photoURL || "").trim();
                  const plays = typeof p?.playCount === "number" ? p.playCount : 0;
                  const total = typeof p?.totalScore === "number" ? p.totalScore : 0;
                  const best = typeof p?.bestStreak === "number" ? p.bestStreak : 0;

                  const formatCompactNumber = (value) => {
                    const n = Math.max(0, Number(value) || 0);
                    if (n < 1000) return String(Math.floor(n));
                    if (n < 1_000_000) return `${Math.round((n / 1000) * 10) / 10}k`;
                    if (n < 1_000_000_000) return `${Math.round((n / 1_000_000) * 10) / 10}M`;
                    if (n < 1_000_000_000_000) return `${Math.round((n / 1_000_000_000) * 10) / 10}B`;
                    return `${Math.round((n / 1_000_000_000_000) * 10) / 10}T`;
                  };

                  return (
                    <button
                      type="button"
                      key={p.id || idx}
                      onClick={() => (p?.id ? openPublicProfile(p.id) : null)}
                      className="w-full grid grid-cols-[minmax(0,1fr)_11rem] items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-900 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/35 dark:text-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-950/55"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 text-center font-black text-slate-700 dark:text-slate-200">{idx + 1}</div>
                        <div className="h-8 w-8 rounded-2xl border border-slate-200 bg-white/70 overflow-hidden flex items-center justify-center flex-shrink-0 dark:border-slate-700 dark:bg-slate-950/30">
                          {photo ? (
                            <img src={photo} alt="" className="h-full w-full object-cover" draggable={false} />
                          ) : (
                            <span aria-hidden>👤</span>
                          )}
                        </div>
                        <div className="truncate">{name}</div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 w-44 justify-self-end">
                        <Badge variant="outline" className="rounded-full w-full justify-center tabular-nums">🎮 {formatCompactNumber(plays)}</Badge>
                        <Badge variant="outline" className="rounded-full w-full justify-center tabular-nums">🔥 {formatCompactNumber(best)}</Badge>
                        <Badge className="rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0 w-full justify-center tabular-nums">⭐ {formatCompactNumber(total)}</Badge>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">ยังไม่มีข้อมูลอันดับ</div>
              )}
            </CardContent>
          </Card>

        </motion.div>
      </div>

      {homeSetupOpen && (
        <div
          className="fixed inset-0 z-[60]"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setHomeSetupOpen(false);
          }}
        >
          <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm" />
          <div className="absolute inset-0 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto w-full max-w-3xl">
              <Card className="rounded-3xl border border-white/70 bg-white/90 shadow-[0_28px_56px_rgba(19,34,76,0.25)] backdrop-blur-xl overflow-hidden dark:border-slate-700/40 dark:bg-slate-950/75 dark:shadow-[0_28px_56px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-transparent to-blue-50/30 pointer-events-none dark:from-cyan-400/10 dark:to-blue-500/10" />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">เริ่มเล่นทายเพลง</CardTitle>
                      <CardDescription>
                        เลือกแนว ⟶ ตั้งค่าเกม ⟶ เริ่มเล่น
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      className="rounded-2xl"
                      onClick={() => setHomeSetupOpen(false)}
                      title="ปิด"
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold text-sm">1</div>
                      <div className="text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-cyan-300 dark:to-blue-300 bg-clip-text text-transparent">เลือกแนวที่อยากเล่น</div>
                    </div>
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {genreOptions.map((genre) => (
                        <motion.button
                          key={genre.key}
                          whileHover={{ y: -4, scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setSelectedGenre(genre.key)}
                          className={`text-left rounded-2xl border p-3 transition duration-300 text-slate-900 dark:text-slate-100 ${
                            selectedGenre === genre.key
                              ? "border-blue-600 bg-gradient-to-br from-blue-700 to-blue-800 text-white shadow-[0_16px_32px_rgba(37,99,235,0.3)]"
                              : "border-slate-200 bg-white/60 hover:bg-white/80 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-950/35 dark:hover:bg-slate-900/45 dark:hover:border-cyan-400/40"
                          }`}
                        >
                          <div className="font-semibold text-sm md:text-base">{genre.label}</div>
                          <div className={`text-xs mt-1 ${selectedGenre === genre.key ? "text-blue-100" : "text-slate-600 dark:text-slate-300"}`}>
                            {genre.count} เพลง
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      แนวที่เลือก: <span className="font-semibold">{selectedGenreLabel}</span> • เพลงในแนว: <span className="font-semibold">{activeGenrePool.length}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 text-white font-semibold text-sm">2</div>
                      <div className="text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-cyan-300 dark:to-blue-300 bg-clip-text text-transparent">เลือกโหมดการตอบ</div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {Object.entries(answerModeConfig).map(([key, value]) => (
                        <motion.button
                          key={key}
                          whileHover={{ y: -4, scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => {
                            setAnswerMode(key);
                          }}
                          className={`text-left rounded-2xl border p-4 transition duration-300 group text-slate-900 dark:text-slate-100 ${
                            answerMode === key
                              ? "border-purple-600 bg-gradient-to-br from-purple-700 to-pink-700 text-white shadow-[0_16px_32px_rgba(147,51,234,0.3)]"
                              : "border-slate-200 bg-white/60 hover:bg-white/80 hover:border-purple-400 dark:border-slate-700 dark:bg-slate-950/35 dark:hover:bg-slate-900/45 dark:hover:border-cyan-400/40"
                          }`}
                        >
                          <div className="font-semibold text-lg">{value.label}</div>
                          <div className={`text-sm mt-1 ${answerMode === key ? "text-purple-100" : "text-slate-600 dark:text-slate-300"}`}>{value.description}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">จำนวนข้อ</div>
                    <div className="flex gap-2 flex-wrap">
                      {[5, 10, 15].map((count) => (
                        <motion.div key={count} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant={questionCount === count ? "default" : "outline"}
                            className={`rounded-2xl font-semibold ${
                              questionCount === count
                                ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0 shadow-lg"
                                : ""
                            }`}
                            onClick={() => setQuestionCount(count)}
                            disabled={!isNormalPlay}
                          >
                            {count} ข้อ
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                    {!isNormalPlay ? (
                      <div className="text-xs text-slate-600 dark:text-slate-300">โหมดนี้เล่นไม่จำกัดข้อ</div>
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-semibold text-sm">3</div>
                      <div className="text-base font-semibold bg-gradient-to-r from-emerald-600 to-lime-600 dark:from-cyan-300 dark:to-blue-300 bg-clip-text text-transparent">เลือกโหมดการเล่น</div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      {[
                        { key: "normal", title: "ปกติ", desc: "เล่นตามจำนวนข้อที่เลือก" },
                        { key: "solo_challenge", title: "เล่นเดี่ยวชาเล้นจ์", desc: "HP 10 • ผิดติดกันโดนหนักขึ้น" },
                        { key: "group", title: "เล่นกลุ่ม", desc: "จอเดียว • ตอบผิดเลือกคนผิดเพื่อลดคะแนน • ตอบต่อจนถูกค่อยไปข้อถัดไป" },
                        { key: "time_attack_3m", title: "จับเวลา 3 นาที", desc: "เล่นไม่จำกัดข้อ • หมดเวลาแล้วสรุปผล" }
                      ].map((m) => (
                        <motion.button
                          key={m.key}
                          whileHover={{ y: -4, scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setPlayMode(m.key)}
                          className={`text-left rounded-2xl border p-4 transition duration-300 text-slate-900 dark:text-slate-100 ${
                            playMode === m.key
                              ? "border-emerald-600 bg-gradient-to-br from-emerald-700 to-lime-700 text-white shadow-[0_16px_32px_rgba(16,185,129,0.3)]"
                              : "border-slate-200 bg-white/60 hover:bg-white/80 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-950/35 dark:hover:bg-slate-900/45 dark:hover:border-cyan-400/40"
                          }`}
                        >
                          <div className="font-semibold text-lg">{m.title}</div>
                          <div className={`text-sm mt-1 ${playMode === m.key ? "text-emerald-100" : "text-slate-600 dark:text-slate-300"}`}>{m.desc}</div>
                        </motion.button>
                      ))}
                    </div>

                    {isGroupMode ? (
                      <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-950/35 space-y-3">
                        <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50">ผู้เล่น (สูงสุด 10 คน)</div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            value={groupPlayerName}
                            onChange={(e) => setGroupPlayerName(e.target.value)}
                            placeholder="พิมพ์ชื่อผู้เล่น แล้วกดเพิ่ม"
                            className="rounded-2xl h-11"
                          />
                          <Button
                            type="button"
                            className="rounded-2xl font-semibold"
                            disabled={!String(groupPlayerName || "").trim() || groupSetupPlayers.length >= 10}
                            onClick={() => {
                              const name = String(groupPlayerName || "").trim();
                              if (!name) return;
                              if (groupSetupPlayers.length >= 10) return;
                              setGroupSetupPlayers((prev) => [
                                ...(prev || []),
                                { id: `p-${Date.now()}-${Math.random().toString(16).slice(2)}`, name }
                              ]);
                              setGroupPlayerName("");
                            }}
                          >
                            เพิ่ม
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {(groupSetupPlayers || []).map((p) => (
                            <div
                              key={p.id}
                              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-950/30 dark:text-slate-50"
                            >
                              <span>{p.name}</span>
                              <button
                                type="button"
                                className="text-slate-500 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-300"
                                title="ลบ"
                                onClick={() => setGroupSetupPlayers((prev) => (prev || []).filter((x) => x.id !== p.id))}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="text-base font-semibold text-slate-900 dark:text-slate-100">โหมดพิเศษ</div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-950/35 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50">เปิดโหมดพิเศษ</div>
                        <Badge variant="outline" className="rounded-full">แผงด้านขวา</Badge>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        Daily / Favorites / ยอดนิยม / เล่นจากเรื่อง / Room Code
                      </div>
                      <Button
                        type="button"
                        className="rounded-2xl font-semibold"
                        onClick={() => setSpecialModesOpen(true)}
                      >
                        เปิดโหมดพิเศษ
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
                        onClick={() => {
                          setHomeSetupOpen(false);
                          startGame();
                        }}
                        disabled={!activeGenrePool.length || (isGroupMode && !groupSetupPlayers.length)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {isNormalPlay
                          ? `เริ่มเล่น (${answerModeConfig[answerMode].label})`
                          : isSoloChallenge
                            ? "เริ่มชาเล้นจ์เดี่ยว"
                            : isTimeAttack
                              ? "เริ่มจับเวลา 3 นาที"
                              : "เริ่มเล่นกลุ่ม"}
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {specialModesOpen ? renderSpecialModesPanel() : null}
    </div>
  );

  const submitReport = async () => {
    if (reportBusy) return;
    const text = String(reportText || "").trim();
    if (!text) {
      setReportNotice("พิมพ์รายละเอียดก่อนส่งนะ");
      return;
    }

    setReportBusy(true);
    setReportNotice("");
    try {
      await addDoc(collection(firebaseDb, "reports"), {
        text,
        uid: user?.uid || null,
        email: user?.email || null,
        page: String(page || ""),
        sessionMode: String(sessionMode || ""),
        createdAt: serverTimestamp(),
        projectId: firebaseProjectId || null,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : ""
      });
      setReportText("");
      setReportNotice("ส่งแล้ว ขอบคุณครับ");
    } catch (e) {
      const msg = String(e?.message || e?.code || "error");
      setReportNotice(`ส่งไม่สำเร็จ (${msg})`);
    } finally {
      setReportBusy(false);
    }
  };

  const submitVideoReport = async () => {
    if (videoReportBusy) return;
    const subject = String(videoReportSubject || "").trim();
    const details = String(videoReportDetails || "").trim();
    if (!subject) {
      setVideoReportNotice("กรอกหัวเรื่องก่อนส่งนะ");
      return;
    }
    if (!details) {
      setVideoReportNotice("พิมพ์รายละเอียดก่อนส่งนะ");
      return;
    }

    setVideoReportBusy(true);
    setVideoReportNotice("");

    const videoSource = currentAnime?.youtubeVideoId || "";
    const videoId = getYouTubeId(videoSource);

    const contextLines = [
      `animeId: ${String(currentAnime?.id ?? "")}`,
      `title: ${String(currentAnime?.title || "")}`,
      `youtubeVideoId: ${String(videoSource || "")}`,
      `youtubeId: ${String(videoId || "")}`,
      `page: ${String(page || "")}`,
      `sessionMode: ${String(sessionMode || "")}`,
      `answerMode: ${String(answerMode || "")}`,
      `playMode: ${String(playMode || "")}`
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await addDoc(collection(firebaseDb, "reports"), {
        type: "video_issue",
        subject,
        details,
        detailsWithContext: `${details}\n\n---\n${contextLines}`,
        animeId: currentAnime?.id ?? null,
        animeTitle: currentAnime?.title ? String(currentAnime.title) : "",
        youtubeVideoId: videoSource ? String(videoSource) : "",
        youtubeId: videoId ? String(videoId) : "",
        uid: user?.uid || null,
        email: user?.email || null,
        page: String(page || ""),
        sessionMode: String(sessionMode || ""),
        createdAt: serverTimestamp(),
        projectId: firebaseProjectId || null,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : ""
      });
      setVideoReportSubject("");
      setVideoReportDetails("");
      setVideoReportOpen(false);
      setVideoReportNotice("ส่งแล้ว ขอบคุณครับ");
    } catch (e) {
      const msg = String(e?.message || e?.code || "error");
      setVideoReportNotice(`ส่งไม่สำเร็จ (${msg})`);
    } finally {
      setVideoReportBusy(false);
    }
  };

  const renderOnline = () => {
    const uid = String(user?.uid || "").trim();
    const nickname =
      String(profile?.nickname || "").trim() ||
      String(user?.displayName || "").trim() ||
      String(user?.email || "").split("@")[0] ||
      "ผู้เล่น";

    const room = onlineRoom;
    const players = Array.isArray(onlinePlayers) ? onlinePlayers : [];
    const me = uid ? players.find((p) => String(p?.id || "") === uid) : null;
    const messages = Array.isArray(onlineMessages) ? onlineMessages : [];

    const status = String(room?.status || "");
    const isHost = uid && String(room?.hostUid || "") === uid;

    const gameMode = String(room?.gameMode || onlineCreateGameMode || "standard");
    const isBattleRoyale = gameMode === "battle_royale";
    const myHp = Math.max(0, Math.floor(Number(me?.hp) || 15));
    const myWrongStreak = Math.max(0, Math.floor(Number(me?.wrongStreak) || 0));
    const iAmEliminated = Boolean(me?.eliminated === true || myHp <= 0);

    const questionIds = Array.isArray(room?.questions)
      ? room.questions
          .map((x) => Number(x))
          .filter((n) => Number.isFinite(n))
      : [];
    const questionIndex = Math.max(0, Math.floor(Number(room?.questionIndex) || 0));
    const currentQuestionId = questionIds[questionIndex];
    const currentAnimeOnline = Number.isFinite(currentQuestionId) ? animeById.get(Number(currentQuestionId)) : null;

    const effectiveAnswerMode = String(room?.answerMode || onlineCreateAnswerMode || "choice6");
    const isChoiceMode = Boolean(answerModeConfig?.[effectiveAnswerMode]?.choices);
    const hasAnswered = Math.floor(Number(me?.answeredAtIndex) || -1) === questionIndex;

    const startedMs = tsToMs(room?.questionStartedAt);
    const perMs = Math.max(5000, Math.min(60000, Number(room?.perQuestionMs) || 15000));
    const leftMs = startedMs ? Math.max(0, perMs - (Number(onlineNowMs) - startedMs)) : perMs;
    const leftSec = Math.max(0, Math.ceil(leftMs / 1000));
    const totalQuestions = isBattleRoyale ? 0 : Math.max(1, Math.floor(Number(room?.questionCount) || questionIds.length || 1));

    const buildOnlineChoices = (anime, count, seed) => {
      const total = Math.max(2, Math.min(8, Number(count) || 6));
      const correct = anime;
      const pool = (animeWithGenre || []).filter((a) => a && a.id != null && Number(a.id) !== Number(correct?.id));
      const decoys = deterministicShuffle(pool, `${seed}:decoys`).slice(0, Math.max(0, total - 1));
      return deterministicShuffle([correct, ...decoys], `${seed}:mix`);
    };

    const onlineErrorToThai = (raw) => {
      const msg = String(raw || "").trim();
      if (!msg) return "เกิดข้อผิดพลาด";
      if (msg === "firebase_not_ready") return "Firebase ยังไม่พร้อม";
      if (msg === "missing_uid") return "ยังไม่ได้ล็อกอิน";
      if (msg === "room_code_taken") return "รหัสห้องนี้ถูกใช้แล้ว";
      if (msg === "invalid_room_code") return "รหัสห้องไม่ถูกต้อง (ใช้ได้ A-Z a-z 0-9 _ - และอย่างน้อย 4 ตัว)";
      if (msg === "room_full") return "ห้องเต็มแล้ว (สูงสุด 6 คน)";
      if (msg === "room_not_found" || msg === "not_found") return "ไม่พบห้องนี้";
      if (msg === "empty_message") return "พิมพ์ข้อความก่อนส่ง";
      if (msg === "cannot_kick_self") return "เตะตัวเองไม่ได้";
      if (msg === "not_host") return "เฉพาะหัวห้องเท่านั้น";
      if (msg === "not_lobby") return "ทำรายการนี้ได้เฉพาะตอนอยู่หน้า Lobby";
      return msg;
    };

    const onlineChoices = isChoiceMode && currentAnimeOnline
      ? buildOnlineChoices(currentAnimeOnline, 6, `room:${onlineRoomId}:q:${questionIndex}`)
      : [];

    const onlinePlayerCount = players.length;
    const nowMs = Number(onlineNowMs) || Date.now();
    const countdownEndsAtMs = Math.floor(Number(room?.countdownEndsAtMs) || 0);
    const countdownActive = countdownEndsAtMs > nowMs;
    const allReady = onlinePlayerCount >= 2 && players.every((p) => Boolean(p?.ready));
    const canStart = status === "lobby" && isHost && onlinePlayerCount >= 2 && onlinePlayerCount <= 6 && allReady && !countdownActive;
    const countdownOverlayNumber = (() => {
      if (status !== "lobby") return null;
      if (!countdownActive) return null;
      const remainMs = countdownEndsAtMs - nowMs;
      const sec = Math.ceil(remainMs / 1000);
      if (sec < 1 || sec > 5) return null;
      return sec;
    })();

    const handleCreateRoom = async () => {
      if (!uid) return;
      if (onlineBusy) return;
      setOnlineBusy(true);
      setOnlineNotice("");
      try {
        const res = await createOnlineRoom({
          hostUid: uid,
          hostNickname: nickname,
          name: onlineCreateName,
          roomCode: onlineCreateCode,
          gameMode: onlineCreateGameMode,
          answerMode: onlineCreateAnswerMode,
          questionCount: onlineCreateQuestionCount,
          perQuestionMs: onlineCreatePerQuestionMs
        });
        if (!res || res.ok === false) throw new Error(res?.error || "create_failed");
        setOnlineRoomId(String(res.roomId || ""));
      } catch (e) {
        const msg = String(e?.message || e?.code || "create_failed");
        setOnlineNotice(onlineErrorToThai(msg));
      } finally {
        setOnlineBusy(false);
      }
    };

    const joinByRoomId = async (rid) => {
      if (!uid) return;
      const roomId = String(rid || "").trim();
      if (!roomId) return;
      if (onlineBusy) return;
      setOnlineBusy(true);
      setOnlineNotice("");
      try {
        const res = await joinOnlineRoom({ roomId, uid, nickname });
        if (!res || res.ok === false) throw new Error(res?.error || "join_failed");
        setOnlineRoomId(roomId);
      } catch (e) {
        const msg = String(e?.message || e?.code || "join_failed");
        setOnlineNotice(onlineErrorToThai(msg));
      } finally {
        setOnlineBusy(false);
      }
    };

    const handleJoinByCode = async () => {
      if (!uid) return;
      const code = String(onlineJoinCode || "").trim();
      if (!code) return;
      if (onlineBusy) return;
      setOnlineBusy(true);
      setOnlineNotice("");
      try {
        const found = await findRoomByCode({ roomCode: code });
        if (!found || found.ok === false || !found.room?.id) throw new Error(found?.error || "not_found");

        const rid = String(found.room.id);
        const res = await joinOnlineRoom({ roomId: rid, uid, nickname });
        if (!res || res.ok === false) throw new Error(res?.error || "join_failed");
        setOnlineRoomId(rid);
      } catch (e) {
        const msg = String(e?.message || e?.code || "join_failed");
        setOnlineNotice(onlineErrorToThai(msg));
      } finally {
        setOnlineBusy(false);
      }
    };

    const handleLeaveRoom = async () => {
      if (!uid || !onlineRoomId) {
        setOnlineRoomId("");
        return;
      }
      if (onlineBusy) return;
      setOnlineBusy(true);
      setOnlineNotice("");
      try {
        await leaveOnlineRoom({ roomId: onlineRoomId, uid });
      } catch {
        // ignore
      } finally {
        setOnlineBusy(false);
        setOnlineRoomId("");
      }
    };

    const handleSendLobbyMessage = async () => {
      if (!uid || !onlineRoomId) return;
      if (onlineBusy) return;
      const text = String(onlineChatDraft || "").trim();
      if (!text) {
        setOnlineNotice(onlineErrorToThai("empty_message"));
        return;
      }

      setOnlineBusy(true);
      setOnlineNotice("");
      try {
        const res = await sendRoomMessage({ roomId: onlineRoomId, uid, nickname, text });
        if (!res || res.ok === false) throw new Error(res?.error || "send_failed");
        setOnlineChatDraft("");
      } catch (e) {
        const msg = String(e?.message || e?.code || "send_failed");
        setOnlineNotice(onlineErrorToThai(msg));
      } finally {
        setOnlineBusy(false);
      }
    };

    const handleSaveLobbySettings = async () => {
      if (!uid || !onlineRoomId || !room) return;
      if (!isHost) return;
      if (status !== "lobby") return;
      if (onlineBusy) return;

      setOnlineBusy(true);
      setOnlineNotice("");
      try {
        const res = await updateOnlineRoomSettings({
          roomId: onlineRoomId,
          hostUid: uid,
          roomName: onlineLobbyRoomName,
          gameMode: onlineLobbyGameMode,
          answerMode: onlineLobbyAnswerMode,
          questionCount: onlineLobbyQuestionCount,
          perQuestionMs: onlineLobbyPerQuestionMs
        });
        if (!res || res.ok === false) throw new Error(res?.error || "update_failed");
        setOnlineLobbyDirty(false);
      } catch (e) {
        const msg = String(e?.message || e?.code || "update_failed");
        setOnlineNotice(onlineErrorToThai(msg));
      } finally {
        setOnlineBusy(false);
      }
    };

    const handleKickPlayer = async (targetUid, targetName) => {
      if (!uid || !onlineRoomId || !room) return;
      if (!isHost) return;
      if (status !== "lobby") return;
      const target = String(targetUid || "").trim();
      if (!target) return;
      if (target === uid) return;

      const ok = window.confirm(`ต้องการเตะ ${String(targetName || "ผู้เล่น")} ออกจากห้องใช่ไหม?`);
      if (!ok) return;

      setOnlineBusy(true);
      setOnlineNotice("");
      try {
        const res = await kickOnlineRoomPlayer({ roomId: onlineRoomId, hostUid: uid, targetUid: target });
        if (!res || res.ok === false) throw new Error(res?.error || "kick_failed");
      } catch (e) {
        const msg = String(e?.message || e?.code || "kick_failed");
        setOnlineNotice(onlineErrorToThai(msg));
      } finally {
        setOnlineBusy(false);
      }
    };

    const handleStartGame = async () => {
      if (!uid || !onlineRoomId || !room) return;
      if (!isHost) return;
      if (!canStart) return;
      if (onlineBusy) return;
      if (onlineStartCountdown > 0) return;

      setOnlineBusy(true);
      setOnlineNotice("");
      try {
        const gm = String(room.gameMode || gameMode || "standard");

        let ids = [];
        if (gm === "battle_royale") {
          const pool = Array.isArray(activeGenrePool) ? activeGenrePool : [];
          const base = pool.map((a) => a?.id).filter((x) => x != null);
          if (!base.length) throw new Error("no_questions");
          const seedBase = `br:${onlineRoomId}:${String(room.hostUid || uid)}`;
          let round = 0;
          let out = [];
          while (out.length < 200 && round < 6) {
            out = out.concat(deterministicShuffle(base, `${seedBase}:${round}`));
            round += 1;
          }
          ids = out.slice(0, Math.min(200, out.length));
        } else {
          const picked = buildQuestionListFromPool({
            pool: activeGenrePool,
            limit: Number(room.questionCount) || 5,
            balanceAcrossGenres: true
          });
          ids = (picked || []).map((a) => a?.id).filter((x) => x != null);
        }
        if (ids.length < 1) throw new Error("no_questions");

        const res = await startOnlineRoomGame({
          roomId: onlineRoomId,
          hostUid: uid,
          questions: ids,
          answerMode: String(room.answerMode || "choice6"),
          questionCount: Number(room.questionCount) || ids.length,
          perQuestionMs: Number(room.perQuestionMs) || 15000
        });
        if (!res || res.ok === false) throw new Error(res?.error || "start_failed");
      } catch (e) {
        const msg = String(e?.message || e?.code || "start_failed");
        setOnlineNotice(onlineErrorToThai(msg));
      } finally {
        setOnlineBusy(false);
      }
    };

    const handleToggleReady = async () => {
      if (!uid || !onlineRoomId) return;
      if (status !== "lobby") return;
      if (onlineBusy) return;
      setOnlineBusy(true);
      setOnlineNotice("");
      try {
        const next = !Boolean(me?.ready);
        const res = await setOnlineReady({ roomId: onlineRoomId, uid, ready: next });
        if (!res || res.ok === false) throw new Error(res?.error || "ready_failed");
      } catch (e) {
        const msg = String(e?.message || e?.code || "ready_failed");
        setOnlineNotice(onlineErrorToThai(msg));
      } finally {
        setOnlineBusy(false);
      }
    };

    const handleBackToLobby = async () => {
      if (!uid || !onlineRoomId || !room) return;
      if (!isHost) return;
      if (onlineBusy) return;
      setOnlineBusy(true);
      setOnlineNotice("");
      try {
        const res = await resetOnlineRoomToLobby({ roomId: onlineRoomId, hostUid: uid });
        if (!res || res.ok === false) throw new Error(res?.error || "reset_failed");
        setOnlineResultsOpen(false);
      } catch (e) {
        const msg = String(e?.message || e?.code || "reset_failed");
        setOnlineNotice(onlineErrorToThai(msg));
      } finally {
        setOnlineBusy(false);
      }
    };

    const handleStartWithCountdown = async () => {
      if (!canStart) return;
      if (!uid || !onlineRoomId || !room) return;
      if (!isHost) return;
      if (status !== "lobby") return;
      if (Number(room?.countdownEndsAtMs) > Date.now()) return;
      setOnlineNotice("");

      setOnlineBusy(true);
      try {
        const res = await beginOnlineRoomCountdown({ roomId: onlineRoomId, hostUid: uid, seconds: 5 });
        if (!res || res.ok === false) throw new Error(res?.error || "countdown_failed");
      } catch (e) {
        const msg = String(e?.message || e?.code || "countdown_failed");
        setOnlineNotice(onlineErrorToThai(msg));
      } finally {
        setOnlineBusy(false);
      }
    };

    const handlePickChoice = async (choiceAnime) => {
      if (!uid || !onlineRoomId || !room || !currentAnimeOnline) return;
      if (status !== "playing") return;
      if (hasAnswered) return;
      if (isBattleRoyale && iAmEliminated) return;
      if (!choiceAnime?.id) return;

      setOnlineBusy(true);
      setOnlineNotice("");
      try {
        const res = await submitOnlineAnswer({
          roomId: onlineRoomId,
          uid,
          questionIndex,
          pickId: Number(choiceAnime.id),
          correctId: Number(currentAnimeOnline.id),
          points: 1
        });
        if (!res || res.ok === false) throw new Error(res?.error || "submit_failed");
      } catch (e) {
        const msg = String(e?.message || e?.code || "submit_failed");
        setOnlineNotice(onlineErrorToThai(msg));
      } finally {
        setOnlineBusy(false);
      }
    };

    const handleSubmitTyping = async () => {
      if (!uid || !onlineRoomId || !room || !currentAnimeOnline) return;
      if (status !== "playing") return;
      if (hasAnswered) return;
      if (isBattleRoyale && iAmEliminated) return;

      const raw = String(onlineTypingDraft || "").trim();
      if (!raw) return;
      const q = normalize(raw);
      const accepted = [
        currentAnimeOnline?.title,
        ...(currentAnimeOnline?.altTitles || []),
        ...(currentAnimeOnline?.acceptedAnswers || [])
      ]
        .filter(Boolean)
        .map((x) => normalize(String(x)));
      const correct = q && accepted.includes(q);

      setOnlineBusy(true);
      setOnlineNotice("");
      try {
        const cid = Number(currentAnimeOnline.id);
        const res = await submitOnlineAnswer({
          roomId: onlineRoomId,
          uid,
          questionIndex,
          pickId: correct ? cid : -1,
          correctId: cid,
          points: 1
        });
        if (!res || res.ok === false) throw new Error(res?.error || "submit_failed");
      } catch (e) {
        const msg = String(e?.message || e?.code || "submit_failed");
        setOnlineNotice(onlineErrorToThai(msg));
      } finally {
        setOnlineBusy(false);
      }
    };

    const handleCloseRoom = async () => {
      if (!uid || !onlineRoomId || !room) return;
      if (!isHost) return;
      if (onlineBusy) return;
      setOnlineBusy(true);
      setOnlineNotice("");
      try {
        const res = await closeOnlineRoom({ roomId: onlineRoomId, hostUid: uid });
        if (!res || res.ok === false) throw new Error(res?.error || "close_failed");
        setOnlineRoomId("");
      } catch (e) {
        const msg = String(e?.message || e?.code || "close_failed");
        setOnlineNotice(onlineErrorToThai(msg));
      } finally {
        setOnlineBusy(false);
      }
    };

    const formatDurationMs = (ms) => {
      const t = Math.max(0, Math.floor(Number(ms) || 0));
      const sec = Math.floor(t / 1000);
      const m = Math.floor(sec / 60);
      const s = String(sec % 60).padStart(2, "0");
      return `${m}:${s}`;
    };

    const startedAtMsRoom = tsToMs(room?.startedAt);
    const endedAtMsRoom = tsToMs(room?.endedAt) || Date.now();
    const battleResults = isBattleRoyale && startedAtMsRoom
      ? players
          .map((p) => {
            const elimMs = tsToMs(p?.eliminatedAt);
            const endMs = elimMs || endedAtMsRoom;
            const survivalMs = Math.max(0, endMs - startedAtMsRoom);
            return {
              id: String(p?.id || ""),
              nickname: String(p?.nickname || "ผู้เล่น"),
              score: Math.max(0, Math.floor(Number(p?.score) || 0)),
              hp: Math.max(0, Math.floor(Number(p?.hp) || 15)),
              eliminated: Boolean(p?.eliminated === true || Math.max(0, Math.floor(Number(p?.hp) || 15)) <= 0),
              survivalMs
            };
          })
          .sort((a, b) => {
            if (b.survivalMs !== a.survivalMs) return b.survivalMs - a.survivalMs;
            return (b.score || 0) - (a.score || 0);
          })
      : [];

    return (
      <>
        <div className="space-y-6">
        <Card className="rounded-3xl border border-white/70 bg-white/85 shadow-[0_20px_40px_rgba(19,34,76,0.14)] backdrop-blur-xl overflow-hidden dark:border-slate-700/40 dark:bg-slate-950/55 dark:shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
          <CardHeader>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="text-xl">เล่นออนไลน์</CardTitle>
                <CardDescription>เลือกเข้าห้อง หรือสร้างห้องใหม่ (2–6 คน)</CardDescription>
              </div>
              {onlineRoomId ? (
                <Button variant="outline" className="rounded-2xl" onClick={handleLeaveRoom} disabled={onlineBusy}>
                  ออกจากห้อง
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {onlineRoomsError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-900 dark:border-rose-400/40 dark:bg-slate-900/40 dark:text-rose-100">
                โหลดรายการห้องไม่สำเร็จ ({onlineRoomsError})
              </div>
            ) : null}
            {onlineNotice ? (
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-3 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-950/35 dark:text-slate-100">
                {onlineNotice}
              </div>
            ) : null}

            {!onlineRoomId ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/35 space-y-3">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50">สร้างห้อง</div>
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">ชื่อห้อง</div>
                    <Input
                      value={onlineCreateName}
                      onChange={(e) => setOnlineCreateName(e.target.value)}
                      placeholder="เช่น ห้องของเรา"
                      className="rounded-2xl h-11"
                      maxLength={40}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">รหัสห้อง (ไม่ใส่ = ห้องสาธารณะ)</div>
                    <Input
                      value={onlineCreateCode}
                      onChange={(e) => setOnlineCreateCode(e.target.value)}
                      placeholder="ตัวอย่าง: ABCD_1234"
                      className="rounded-2xl h-11"
                      maxLength={20}
                    />
                    <div className="text-xs text-slate-600 dark:text-slate-300">ใช้ได้เฉพาะ A-Z, a-z, 0-9, _ และ - (อย่างน้อย 4 ตัว)</div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">โหมดเกม</div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={onlineCreateGameMode === "standard" ? "default" : "outline"}
                        className="rounded-2xl font-semibold"
                        onClick={() => setOnlineCreateGameMode("standard")}
                        disabled={onlineBusy}
                      >
                        ปกติ
                      </Button>
                      <Button
                        type="button"
                        variant={onlineCreateGameMode === "battle_royale" ? "default" : "outline"}
                        className="rounded-2xl font-semibold"
                        onClick={() => setOnlineCreateGameMode("battle_royale")}
                        disabled={onlineBusy}
                      >
                        Battle Royale
                      </Button>
                    </div>
                    {onlineCreateGameMode === "battle_royale" ? (
                      <div className="text-xs text-slate-600 dark:text-slate-300">เล่นไม่จำกัดข้อ จนกว่าจะเหลือคนสุดท้าย (HP 15)</div>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">โหมดการตอบ</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(answerModeConfig).map(([k, v]) => (
                        <Button
                          key={k}
                          type="button"
                          variant={onlineCreateAnswerMode === k ? "default" : "outline"}
                          className="rounded-2xl font-semibold"
                          onClick={() => setOnlineCreateAnswerMode(k)}
                        >
                          {v.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">จำนวนข้อ</div>
                      <div className="flex flex-wrap gap-2">
                        {[5, 10, 15].map((n) => (
                          <Button
                            key={n}
                            type="button"
                            variant={onlineCreateQuestionCount === n ? "default" : "outline"}
                            className="rounded-2xl font-semibold"
                            onClick={() => setOnlineCreateQuestionCount(n)}
                            disabled={onlineBusy || onlineCreateGameMode === "battle_royale"}
                          >
                            {n}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">เวลา/ข้อ</div>
                      <div className="flex flex-wrap gap-2">
                        {[10_000, 15_000, 20_000].map((ms) => (
                          <Button
                            key={ms}
                            type="button"
                            variant={onlineCreatePerQuestionMs === ms ? "default" : "outline"}
                            className="rounded-2xl font-semibold"
                            onClick={() => setOnlineCreatePerQuestionMs(ms)}
                          >
                            {Math.round(ms / 1000)}s
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl"
                    onClick={handleCreateRoom}
                    disabled={onlineBusy}
                  >
                    {onlineBusy ? "กำลังสร้าง…" : "สร้างห้อง"}
                  </Button>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/35 space-y-3">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50">เข้าห้องด้วยรหัส</div>
                  <Input
                    value={onlineJoinCode}
                    onChange={(e) => setOnlineJoinCode(e.target.value)}
                    placeholder="ใส่รหัสห้อง"
                    className="rounded-2xl h-11"
                    maxLength={40}
                  />
                  <Button
                    type="button"
                    className="rounded-2xl font-semibold"
                    onClick={handleJoinByCode}
                    disabled={!String(onlineJoinCode || "").trim() || onlineBusy}
                  >
                    เข้าร่วม
                  </Button>

                  <div className="pt-2 text-sm font-extrabold text-slate-900 dark:text-slate-50">ห้องสาธารณะ</div>
                  {(onlineRooms || []).length ? (
                    <div className="space-y-2">
                      {(onlineRooms || []).slice(0, 25).map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950/35 dark:text-slate-50"
                        >
                          <div className="min-w-0">
                            <div className="truncate">{String(r?.roomName || "ห้องออนไลน์")}</div>
                            <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
                              Host: {String(r?.hostNickname || "-")} • {String(r?.gameMode || "standard") === "battle_royale" ? "Battle Royale" : "ปกติ"} • {answerModeConfig?.[String(r?.answerMode || "")]?.label || String(r?.answerMode || "")}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-2xl"
                            onClick={() => joinByRoomId(r.id)}
                            disabled={onlineBusy}
                          >
                            เข้า
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">ยังไม่มีห้องสาธารณะ</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/35 space-y-2">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="text-base font-extrabold text-slate-900 dark:text-slate-50 truncate">
                      {String(room?.roomName || "ห้องออนไลน์")}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full">{isBattleRoyale ? "Battle Royale" : "ปกติ"}</Badge>
                      <Badge variant="outline" className="rounded-full">สถานะ: {status || "-"}</Badge>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    รหัสห้อง: <span className="font-extrabold">{onlineRoomId}</span>
                  </div>

                  <div className="pt-2">
                    <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50 mb-2">ผู้เล่น ({players.length})</div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {players.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950/35 dark:text-slate-50"
                        >
                          <div className="truncate">{String(p?.nickname || "ผู้เล่น")}</div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="rounded-full tabular-nums">⭐ {Math.max(0, Math.floor(Number(p?.score) || 0))}</Badge>
                            {status === "lobby" ? (
                              <Badge variant="outline" className="rounded-full text-xs">{p?.ready ? "พร้อม" : "ยังไม่พร้อม"}</Badge>
                            ) : null}
                            {status === "lobby" && isHost && String(p?.id || "") !== uid ? (
                              <Button
                                type="button"
                                variant="outline"
                                className="rounded-2xl h-8 px-3 text-xs font-extrabold"
                                onClick={() => handleKickPlayer(String(p?.id || ""), String(p?.nickname || "ผู้เล่น"))}
                                disabled={onlineBusy}
                              >
                                เตะออก
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {status === "lobby" ? (
                    <div className="pt-3 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-xs text-slate-600 dark:text-slate-300">เริ่มได้เมื่อมี 2–6 คน และทุกคนต้องพร้อม</div>
                        <Button
                          type="button"
                          variant={me?.ready ? "default" : "outline"}
                          className="rounded-2xl h-8 px-3 text-xs font-extrabold"
                          onClick={handleToggleReady}
                          disabled={onlineBusy || countdownActive || !uid}
                        >
                          {me?.ready ? "พร้อมแล้ว" : "กดพร้อม"}
                        </Button>
                      </div>
                      {isHost ? (
                        <Button
                          type="button"
                          className="rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl"
                          onClick={handleStartWithCountdown}
                          disabled={!canStart || onlineBusy}
                        >
                          เริ่มเกม
                        </Button>
                      ) : (
                        <Badge variant="outline" className="rounded-full">รอ Host เริ่มเกม…</Badge>
                      )}
                    </div>
                  ) : null}

                  {status === "finished" && isHost ? (
                    <div className="pt-3 flex items-center gap-2 flex-wrap">
                      <Button type="button" variant="outline" className="rounded-2xl" onClick={handleBackToLobby} disabled={onlineBusy}>
                        กลับไป Lobby เพื่อเริ่มใหม่
                      </Button>
                      <Button type="button" variant="outline" className="rounded-2xl" onClick={handleCloseRoom} disabled={onlineBusy}>
                        ปิดห้อง
                      </Button>
                    </div>
                  ) : null}
                </div>

                {status === "lobby" ? (
                  <div className={isHost ? "grid gap-4 lg:grid-cols-2" : "space-y-4"}>
                    {isHost ? (
                      <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/35 space-y-3">
                        <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50">ตั้งค่าห้อง (หัวห้อง)</div>
                        <div className="space-y-2">
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">ชื่อห้อง</div>
                          <Input
                            value={onlineLobbyRoomName}
                            onChange={(e) => {
                              setOnlineLobbyRoomName(e.target.value);
                              setOnlineLobbyDirty(true);
                            }}
                            placeholder="เช่น ห้องของเรา"
                            className="rounded-2xl h-11"
                            maxLength={40}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">โหมดการตอบ</div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(answerModeConfig).map(([k, v]) => (
                              <Button
                                key={k}
                                type="button"
                                variant={onlineLobbyAnswerMode === k ? "default" : "outline"}
                                className="rounded-2xl font-semibold"
                                onClick={() => {
                                  setOnlineLobbyAnswerMode(k);
                                  setOnlineLobbyDirty(true);
                                }}
                                disabled={onlineBusy}
                              >
                                {v.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">โหมดเกม</div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant={onlineLobbyGameMode === "standard" ? "default" : "outline"}
                              className="rounded-2xl font-semibold"
                              onClick={() => {
                                setOnlineLobbyGameMode("standard");
                                setOnlineLobbyDirty(true);
                              }}
                              disabled={onlineBusy}
                            >
                              ปกติ
                            </Button>
                            <Button
                              type="button"
                              variant={onlineLobbyGameMode === "battle_royale" ? "default" : "outline"}
                              className="rounded-2xl font-semibold"
                              onClick={() => {
                                setOnlineLobbyGameMode("battle_royale");
                                setOnlineLobbyDirty(true);
                              }}
                              disabled={onlineBusy}
                            >
                              Battle Royale
                            </Button>
                          </div>
                          {onlineLobbyGameMode === "battle_royale" ? (
                            <div className="text-xs text-slate-600 dark:text-slate-300">เล่นไม่จำกัดข้อ จนกว่าจะเหลือคนสุดท้าย (HP 15)</div>
                          ) : null}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">จำนวนข้อ</div>
                            <div className="flex flex-wrap gap-2">
                              {[5, 10, 15].map((n) => (
                                <Button
                                  key={n}
                                  type="button"
                                  variant={onlineLobbyQuestionCount === n ? "default" : "outline"}
                                  className="rounded-2xl font-semibold"
                                  onClick={() => {
                                    setOnlineLobbyQuestionCount(n);
                                    setOnlineLobbyDirty(true);
                                  }}
                                  disabled={onlineBusy || onlineLobbyGameMode === "battle_royale"}
                                >
                                  {n}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">เวลา/ข้อ</div>
                            <div className="flex flex-wrap gap-2">
                              {[10_000, 15_000, 20_000].map((ms) => (
                                <Button
                                  key={ms}
                                  type="button"
                                  variant={onlineLobbyPerQuestionMs === ms ? "default" : "outline"}
                                  className="rounded-2xl font-semibold"
                                  onClick={() => {
                                    setOnlineLobbyPerQuestionMs(ms);
                                    setOnlineLobbyDirty(true);
                                  }}
                                  disabled={onlineBusy}
                                >
                                  {Math.round(ms / 1000)}s
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Button
                          type="button"
                          className="rounded-2xl font-semibold"
                          onClick={handleSaveLobbySettings}
                          disabled={onlineBusy}
                        >
                          บันทึกตั้งค่า
                        </Button>
                      </div>
                    ) : null}

                    <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/35 space-y-3">
                      <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50">แชทห้อง</div>
                      <div className="rounded-2xl border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-950/35 max-h-60 overflow-auto space-y-2">
                        {messages.length ? (
                          messages.slice(-50).map((m) => (
                            <div key={m.id} className="text-sm">
                              <span className="font-extrabold text-slate-900 dark:text-slate-50">{String(m?.nickname || "ผู้เล่น")}</span>
                              <span className="text-slate-600 dark:text-slate-300">: </span>
                              <span className="text-slate-900 dark:text-slate-100 break-words">{String(m?.text || "")}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">ยังไม่มีข้อความ</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          value={onlineChatDraft}
                          onChange={(e) => setOnlineChatDraft(e.target.value)}
                          placeholder="พิมพ์ข้อความ..."
                          className="rounded-2xl h-11"
                          maxLength={300}
                          disabled={onlineBusy}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSendLobbyMessage();
                          }}
                        />
                        <Button
                          type="button"
                          className="rounded-2xl font-semibold"
                          onClick={handleSendLobbyMessage}
                          disabled={onlineBusy || !String(onlineChatDraft || "").trim()}
                        >
                          ส่ง
                        </Button>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300">ข้อความจะแสดงเฉพาะคนในห้อง</div>
                    </div>
                  </div>
                ) : null}

                {status === "playing" ? (
                  <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/35 space-y-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <Badge className="rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0">
                        {isBattleRoyale ? `รอบ ${questionIndex + 1}` : `ข้อ ${Math.min(questionIndex + 1, totalQuestions)} / ${totalQuestions}`}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {isBattleRoyale ? (
                          <Badge variant="outline" className="rounded-full tabular-nums">❤️ {myHp}/15</Badge>
                        ) : null}
                        {isBattleRoyale && myWrongStreak > 0 ? (
                          <Badge variant="outline" className="rounded-full tabular-nums">ผิดติดกัน {myWrongStreak}</Badge>
                        ) : null}
                        <Badge variant="outline" className="rounded-full tabular-nums">⏱ {leftSec}s</Badge>
                      </div>
                    </div>

                    {isBattleRoyale && iAmEliminated ? (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-extrabold text-rose-900 dark:border-rose-400/40 dark:bg-slate-900/40 dark:text-rose-100">
                        คุณตกรอบแล้ว
                      </div>
                    ) : null}

                    {currentAnimeOnline ? (
                      <div className="space-y-3">
                        <div className="relative aspect-video overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-black shadow-2xl w-[70%] mx-auto">
                          <iframe
                            key={getYouTubeId(currentAnimeOnline.youtubeVideoId) || String(currentAnimeOnline.youtubeVideoId || "")}
                            title={currentAnimeOnline.title}
                            className="w-full h-[calc(100%+72px)] -mt-[72px]"
                            src={buildYouTubeEmbedUrl(currentAnimeOnline.youtubeVideoId, { start: 0 })}
                            referrerPolicy="origin-when-cross-origin"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-black" />
                        </div>

                        {isChoiceMode ? (
                          <div className="grid sm:grid-cols-2 gap-3">
                            {onlineChoices.map((c, idx) => (
                              <Button
                                key={c.id}
                                type="button"
                                variant="outline"
                                className="group rounded-2xl h-auto py-4 whitespace-normal w-full bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-900 font-semibold transition-all duration-200 shadow-sm hover:shadow-md dark:bg-slate-950/35 dark:hover:bg-slate-900/45 dark:border-slate-700 dark:hover:border-cyan-400/40 dark:text-slate-100"
                                disabled={hasAnswered || onlineBusy || (isBattleRoyale && iAmEliminated)}
                                onClick={() => handlePickChoice(c)}
                              >
                                <span className="text-sm text-slate-600 dark:text-slate-200/75 mr-2">({String.fromCharCode(65 + idx)})</span>
                                <span className="leading-snug">{c.title}</span>
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Input
                              value={onlineTypingDraft}
                              onChange={(e) => setOnlineTypingDraft(e.target.value)}
                              placeholder="พิมพ์ชื่อเรื่อง..."
                              className="rounded-2xl h-12"
                              disabled={hasAnswered || onlineBusy || (isBattleRoyale && iAmEliminated)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSubmitTyping();
                              }}
                            />
                            <Button
                              type="button"
                              className="rounded-2xl font-semibold"
                              onClick={handleSubmitTyping}
                              disabled={hasAnswered || onlineBusy || (isBattleRoyale && iAmEliminated) || !String(onlineTypingDraft || "").trim()}
                            >
                              ส่งคำตอบ
                            </Button>
                          </div>
                        )}

                        {hasAnswered ? (
                          <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">ส่งคำตอบแล้ว</div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">กำลังโหลดคำถาม…</div>
                    )}
                  </div>
                ) : null}

                {status === "finished" ? (
                  <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/35 space-y-3">
                    <div className="text-base font-extrabold text-slate-900 dark:text-slate-50">สรุปคะแนน</div>
                    <div className="space-y-2">
                      {players
                        .slice()
                        .sort((a, b) => (Number(b?.score) || 0) - (Number(a?.score) || 0))
                        .map((p, i) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950/35 dark:text-slate-50"
                          >
                            <div className="truncate">{i + 1}. {String(p?.nickname || "ผู้เล่น")}</div>
                            <Badge className="rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0 tabular-nums">⭐ {Math.max(0, Math.floor(Number(p?.score) || 0))}</Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
        </div>

        {countdownOverlayNumber != null ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <Card className="w-full max-w-sm rounded-3xl border border-white/60 bg-white/90 backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-950/70">
              <CardContent className="py-12 flex items-center justify-center">
                <div className="text-7xl font-extrabold tabular-nums text-slate-900 dark:text-slate-50">
                  {countdownOverlayNumber}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {onlineResultsOpen && status === "finished" && isBattleRoyale ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <Card className="w-full max-w-xl rounded-3xl border border-white/60 bg-white/90 backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-950/70">
              <CardHeader>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle className="text-xl">สรุปผล Battle Royale</CardTitle>
                    <CardDescription>เวลารอดชีวิตนับตั้งแต่เริ่มเกม</CardDescription>
                  </div>
                  <Button variant="outline" className="rounded-2xl" onClick={() => setOnlineResultsOpen(false)}>
                    ปิด
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {battleResults.length ? (
                  battleResults.slice(0, 6).map((r, idx) => (
                    <div
                      key={r.id || String(idx)}
                      className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950/35 dark:text-slate-50"
                    >
                      <div className="truncate">
                        {idx + 1}. {r.nickname}
                        {idx === 0 ? " (ชนะ)" : ""}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-full tabular-nums">⏳ {formatDurationMs(r.survivalMs)}</Badge>
                        <Badge className="rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0 tabular-nums">⭐ {r.score}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">ยังไม่มีผลการแข่งขัน</div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </>
    );
  };

  const renderAbout = () => {
    const sections = [
      {
        key: "team",
        title: "Our Team",
        desc: "รวมรายชื่อและทีมงานของ OtoVerse ทั้งผู้พัฒนาและผู้ดูแล",
        icon: Users
      },
      {
        key: "ads",
        title: "Advertise with Us",
        desc: "ติดต่อโฆษณากับ OtoVerse",
        icon: Megaphone
      },
      {
        key: "contact",
        title: "Contact Us",
        desc: "ช่องทางติดต่อ/ข้อเสนอแนะ/ปัญหาการใช้งาน",
        icon: MessageCircle
      },
      {
        key: "privacy",
        title: "Privacy Policy",
        desc: "นโยบายคุ้มครองข้อมูลส่วนบุคคล",
        icon: Shield
      },
      {
        key: "support",
        title: "Support Us",
        desc: "สนับสนุนโปรเจกต์ให้พัฒนาไปต่อ",
        icon: Heart
      },
      {
        key: "branding",
        title: "Branding",
        desc: "ทรัพยากรโลโก้/ภาพปก และแนวทางการใช้งาน",
        icon: Palette
      }
    ];

    const selected = aboutSection ? sections.find((s) => s.key === aboutSection) : null;

    const detailContent = (key) => {
      switch (key) {
        case "team":
          return (
            <div className="space-y-4">
              <div className="space-y-2 text-sm leading-7 text-slate-700 dark:text-slate-200/90">
                <p>ขอบคุณผู้จัดทำและผู้มีส่วนร่วมของ OtoVerse</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <GitHubProfileCard username="bfirstkok" roleLabel="ผู้พัฒนา" />
                <GitHubProfileCard username="Dparamet" roleLabel="ผู้จัดทำภาพพื้นหลังเว็บ" />
              </div>

              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                หมายเหตุ: ข้อมูลโปรไฟล์ดึงจาก GitHub API แบบเรียลไทม์ อาจโหลดไม่ขึ้นหากติด rate limit
              </div>
            </div>
          );
        case "ads":
          return (
            <div className="space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-200/90">
              <p>สำหรับติดต่อโฆษณาหรือพาร์ทเนอร์กับ OtoVerse</p>
              <p>ใส่รายละเอียดแพ็กเกจ/เรทราคา/ช่องทางติดต่อได้ตามต้องการ</p>
            </div>
          );
        case "contact":
          return (
            <div className="space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-200/90">
              <p>แจ้งปัญหา/ส่งข้อเสนอแนะเกี่ยวกับเว็บได้ตรงนี้</p>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">รายละเอียด</div>
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  rows={5}
                  placeholder="พิมพ์สิ่งที่เจอ เช่น ลิงก์/ชื่อเพลง/อุปกรณ์/ขั้นตอนที่ทำ แล้วเกิดอะไรขึ้น"
                  className="w-full rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950/45 dark:text-slate-100"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    className="rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl"
                    onClick={submitReport}
                    disabled={reportBusy}
                  >
                    {reportBusy ? "กำลังส่ง…" : "ส่งรายงาน"}
                  </Button>
                  {reportNotice ? <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">{reportNotice}</div> : null}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  หมายเหตุ: ระบบจะบันทึกข้อความ + เวลา + ข้อมูลพื้นฐานของเบราว์เซอร์เพื่อช่วยตรวจปัญหา
                </div>
              </div>
            </div>
          );
        case "privacy":
          return (
            <div className="space-y-4 text-sm leading-7 text-slate-700 dark:text-slate-200/90">
              <div className="space-y-2">
                <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">Privacy Policy (นโยบายคุ้มครองข้อมูลส่วนบุคคล)</div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">ปรับปรุงล่าสุด: 10 เมษายน 2026</div>
              </div>

              <div className="space-y-3">
                <p>
                  ทีมงาน OtoVerse ("ทีมงาน") เป็นผู้พัฒนาและเจ้าของเว็บไซต์ OtoVerse ("บริการ") เมื่อท่านใช้งานเว็บไซต์ สมัครสมาชิก
                  หรือใช้งานฟีเจอร์ต่าง ๆ เช่น คอมมูนิตี้/แชท/ห้องออนไลน์ ท่านถือเป็นผู้ใช้บริการ ("ผู้ใช้บริการ")
                  และทีมงานมีความจำเป็นต้องประมวลผลข้อมูลส่วนบุคคลบางส่วนเพื่อให้บริการแก่ท่าน
                </p>
                <p>
                  นโยบายฉบับนี้มีผลใช้บังคับกับบริการของ OtoVerse เท่านั้น ไม่ครอบคลุมเว็บไซต์/บริการของบุคคลภายนอกที่มีการเชื่อมต่อ
                  (เช่น ลิงก์ YouTube, GitHub, หรือผู้ให้บริการสตรีมมิ่งภายนอก) ซึ่งผู้ใช้บริการต้องศึกษานโยบายของบุคคลภายนอกนั้นแยกต่างหาก
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-extrabold text-slate-900 dark:text-slate-100">1) ประเภทข้อมูลส่วนบุคคลที่เราเก็บ/ประมวลผล</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    ข้อมูลบัญชีผู้ใช้: อีเมล/ชื่อที่แสดง/รูปโปรไฟล์ และตัวระบุบัญชี (เช่น UID) เมื่อท่านสมัครหรือเข้าสู่ระบบผ่านผู้ให้บริการ
                    (เช่น Google/GitHub)
                  </li>
                  <li>
                    ข้อมูลที่ท่านสร้างบนบริการ: โพสต์ คอมเมนท์ ข้อความแชท ข้อความในห้องออนไลน์ และรูปที่ท่านอัปโหลด (ถ้ามี)
                  </li>
                  <li>
                    ข้อมูลการใช้งานและข้อมูลทางเทคนิค: เช่น IP address, ประเภทอุปกรณ์/เบราว์เซอร์, เวลาเข้าใช้งาน, การตั้งค่าเบื้องต้น
                    (ข้อมูลลักษณะนี้อาจถูกบันทึกใน log ของระบบ/ผู้ให้บริการโฮสต์ตามมาตรฐานการให้บริการ)
                  </li>
                  <li>
                    ข้อมูลที่เก็บในเครื่องของท่าน (local storage): เช่น รายการโปรด/สถิติการเล่น/การตั้งค่าบางอย่าง เพื่อให้ใช้งานได้สะดวกขึ้น
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="font-extrabold text-slate-900 dark:text-slate-100">2) วัตถุประสงค์ในการประมวลผลข้อมูล</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>เพื่อให้บริการหลักของเว็บ เช่น เล่นเกม บันทึกสถิติ ฟีเจอร์คอมมูนิตี้ แชท และห้องออนไลน์</li>
                  <li>เพื่อยืนยันตัวตน ป้องกันการใช้งานผิดปกติ และดูแลความปลอดภัยของระบบ</li>
                  <li>เพื่อตอบคำร้อง/รายงานปัญหา/ข้อเสนอแนะที่ผู้ใช้บริการส่งเข้ามา</li>
                  <li>เพื่อปฏิบัติตามกฎหมายหรือคำสั่งของหน่วยงานรัฐ (เมื่อมีเหตุจำเป็นและเป็นไปตามกฎหมาย)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="font-extrabold text-slate-900 dark:text-slate-100">3) การเปิดเผยข้อมูลและผู้ให้บริการภายนอก</div>
                <p>
                  เพื่อให้บริการทำงานได้ ทีมงานอาจใช้ผู้ให้บริการภายนอกในฐานะผู้ประมวลผลข้อมูล (data processor) ตามความจำเป็น เช่น
                  บริการของ Firebase/Google สำหรับโฮสต์ระบบ ยืนยันตัวตน และฐานข้อมูล โดยทีมงานจะเปิดเผยข้อมูลเฉพาะเท่าที่จำเป็นต่อการให้บริการ
                </p>
                <p>
                  นอกจากนี้ เมื่อท่านกดลิงก์ไปยังบริการภายนอก (เช่น YouTube, GitHub, เว็บไซต์ผู้ให้บริการสตรีมมิ่ง) ข้อมูลของท่านอาจถูกเก็บตามนโยบายของบริการนั้น
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-extrabold text-slate-900 dark:text-slate-100">4) คุกกี้และการจัดเก็บบนเบราว์เซอร์</div>
                <p>
                  บริการอาจใช้คุกกี้/การจัดเก็บข้อมูลบนเบราว์เซอร์ (เช่น localStorage) เพื่อให้ระบบล็อกอินทำงานได้อย่างถูกต้อง
                  จดจำการตั้งค่า และเพิ่มความสะดวกในการใช้งาน ผู้ใช้บริการสามารถลบ/ปิดคุกกี้หรือเคลียร์ข้อมูลไซต์ผ่านการตั้งค่าเบราว์เซอร์ได้
                  อย่างไรก็ตาม การดำเนินการดังกล่าวอาจทำให้บางฟีเจอร์ใช้งานไม่ได้หรือไม่สะดวก
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-extrabold text-slate-900 dark:text-slate-100">5) ระยะเวลาการเก็บรักษาข้อมูล</div>
                <p>
                  ทีมงานจะเก็บข้อมูลส่วนบุคคลเท่าที่จำเป็นตามวัตถุประสงค์ในการให้บริการ และ/หรือ ตามที่กฎหมายกำหนด
                  โดยทั่วไปข้อมูลที่ท่านสร้างบนระบบ (เช่น โพสต์/คอมเมนท์/แชท) อาจยังคงอยู่จนกว่าจะมีการลบโดยท่านหรือโดยผู้ดูแลตามเหตุจำเป็น
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-extrabold text-slate-900 dark:text-slate-100">6) มาตรการความมั่นคงปลอดภัย</div>
                <p>
                  ทีมงานจัดให้มีมาตรการที่เหมาะสมเพื่อปกป้องข้อมูลส่วนบุคคลจากการเข้าถึง ใช้ เปลี่ยนแปลง หรือเปิดเผยโดยไม่ได้รับอนุญาต
                  และจำกัดการเข้าถึงข้อมูลเฉพาะผู้ที่จำเป็นต้องใช้เพื่อให้บริการ
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-extrabold text-slate-900 dark:text-slate-100">7) สิทธิของเจ้าของข้อมูล</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>สิทธิขอเข้าถึง/ขอรับสำเนาข้อมูลส่วนบุคคล และขอแก้ไขให้ถูกต้อง</li>
                  <li>สิทธิขอลบ ทำลาย หรือทำให้ไม่สามารถระบุตัวบุคคลได้ เมื่อไม่มีความจำเป็นหรือเมื่อถอนความยินยอม (ตามเงื่อนไขกฎหมายที่เกี่ยวข้อง)</li>
                  <li>สิทธิคัดค้าน หรือขอให้ระงับการประมวลผลข้อมูลในบางกรณี</li>
                  <li>สิทธิถอนความยินยอม (หากการประมวลผลนั้นอาศัยความยินยอม)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="font-extrabold text-slate-900 dark:text-slate-100">8) ช่องทางการติดต่อ</div>
                <p>
                  หากต้องการสอบถามหรือใช้สิทธิที่เกี่ยวข้องกับข้อมูลส่วนบุคคล สามารถติดต่อทีมงานผ่านหน้า “Contact Us” ในแอปได้
                  (เมนูเกี่ยวกับเรา) โดยทีมงานจะพิจารณาและตอบกลับภายในระยะเวลาที่เหมาะสม
                </p>
              </div>
            </div>
          );
        case "support":
          return (
            <div className="space-y-4">
              <div className="space-y-2 text-sm leading-7 text-slate-700 dark:text-slate-200/90">
                <p>สนับสนุนโปรเจกต์ให้พัฒนาไปต่อได้ด้วยการสแกน QR ด้านล่าง</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/35">
                <img
                  src={qrPaymentImg}
                  alt="QR สำหรับสนับสนุน OtoVerse"
                  className="mx-auto w-full max-w-[320px] rounded-2xl border border-slate-200 bg-white object-contain dark:border-slate-800"
                  draggable={false}
                  loading="lazy"
                />
              </div>

              <div className="text-center text-xs font-semibold text-slate-600 dark:text-slate-300">ขอบคุณที่สนับสนุน OtoVerse</div>
            </div>
          );
        case "branding":
          return (
            <div className="space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-200/90">
              <p>ทรัพยากรแบรนด์ (โลโก้/ไอคอน/ภาพปก) และแนวทางการใช้งาน</p>
              <p>ถ้ามีไฟล์โลโก้ในโปรเจกต์หรืออยากให้ทำปุ่มดาวน์โหลด/ลิงก์ไดรฟ์ บอกได้ครับ</p>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <Card className="rounded-3xl border border-white/70 bg-white/85 shadow-[0_28px_56px_rgba(19,34,76,0.18)] backdrop-blur-xl overflow-hidden dark:border-slate-700/40 dark:bg-slate-950/55 dark:shadow-[0_28px_56px_rgba(0,0,0,0.35)]">
          <CardHeader className="space-y-2">
            <CardTitle className="font-display text-3xl">เกี่ยวกับ OtoVerse</CardTitle>
            <CardDescription className="text-slate-700 dark:text-slate-200/80">
              เว็บทายเพลงอนิเมะจาก OP/ED พร้อมคลังเพลงและข้อมูลช่องทางดู/ฟัง
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selected ? (
              <>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-slate-900/5 dark:bg-slate-50/10">
                      <selected.icon className="h-5 w-5 text-slate-900 dark:text-slate-100" />
                    </div>
                    <div>
                      <div className="text-base font-extrabold text-pink-500">{selected.title}</div>
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">{selected.desc}</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-semibold"
                    onClick={() => setAboutSection(null)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    ย้อนกลับ
                  </Button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 dark:border-slate-700 dark:bg-slate-950/35">
                  {detailContent(selected.key)}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-200/90">
                  <p>
                    OtoVerse คือเว็บเกมทายเพลงอนิเมะจากเพลง OP/ED ที่ออกแบบให้เล่นง่าย เลือกแนว เลือกโหมด แล้วเด้งเข้าเล่นได้ทันที
                    เหมาะทั้งเล่นคนเดียว เล่นท้าทาย หรือเล่นแบบกลุ่มกับเพื่อน
                  </p>
                  <p>
                    เรามีคลังเพลงให้ค้นหา และหน้าช่องทางดู/ฟังเพื่อช่วยตามหาแหล่งรับชมที่เหมาะกับคุณ (ข้อมูลอาจมีการเปลี่ยนแปลงตามผู้ให้บริการ)
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  {sections.map((s) => {
                    const Icon = s.icon;
                    return (
                      <button
                        type="button"
                        key={s.key}
                        onClick={() => setAboutSection(s.key)}
                        className="text-left rounded-2xl border border-slate-200 bg-white/70 p-5 hover:border-slate-300 hover:bg-white transition-colors dark:border-slate-700 dark:bg-slate-950/35 dark:hover:border-slate-600 dark:hover:bg-slate-950/50"
                        title={s.title}
                      >
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-slate-900/5 dark:bg-slate-50/10">
                            <Icon className="h-5 w-5 text-slate-900 dark:text-slate-100" />
                          </div>
                          <div>
                            <div className="text-base font-bold text-pink-500">{s.title}</div>
                            <div className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">{s.desc}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderCommunity = () => (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-1">
          <Card className="rounded-3xl border border-white/70 bg-white/85 shadow-[0_16px_28px_rgba(15,23,42,0.1)] dark:border-slate-700/40 dark:bg-slate-950/55 dark:shadow-[0_16px_28px_rgba(0,0,0,0.35)]">
            <CardHeader className="space-y-3">
              <div>
                <CardTitle className="text-xl">Community</CardTitle>
                <CardDescription>ค้นหารายชื่อผู้เล่น</CardDescription>
              </div>
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-slate-400" />
                <Input
                  value={communitySearch}
                  onChange={(e) => setCommunitySearch(e.target.value)}
                  placeholder="ค้นหารายชื่อ..."
                  className="pl-9 rounded-2xl"
                />
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-2">
              {communityError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-900 dark:border-rose-400/40 dark:bg-slate-900/40 dark:text-rose-100">
                  โหลดรายชื่อไม่สำเร็จ ({communityError})
                </div>
              ) : null}

              {communityLoading ? (
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">กำลังโหลดรายชื่อ...</div>
              ) : null}

              {!communityLoading && !(communityFiltered || []).length ? (
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">ไม่พบรายชื่อ</div>
              ) : null}

              <div className="space-y-2 max-h-[70vh] overflow-auto pr-1">
                {(communityFiltered || []).map((p, idx) => {
                  const name =
                    String(p?.nickname || "").trim() ||
                    String(p?.displayName || "").trim() ||
                    String(p?.email || "").split("@")[0] ||
                    "ผู้เล่น";
                  const photo = String(p?.photoURL || "").trim();
                  const plays = typeof p?.playCount === "number" ? p.playCount : 0;
                  const total = typeof p?.totalScore === "number" ? p.totalScore : 0;
                  const onlineNow = isProbablyOnline(p);

                  return (
                    <button
                      type="button"
                      key={p.id || idx}
                      onClick={() => (p?.id ? openPublicProfile(p.id) : null)}
                      className="w-full flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-900 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/35 dark:text-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-950/55"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 text-center font-black text-slate-700 dark:text-slate-200">{idx + 1}</div>
                        <div className="relative h-8 w-8 rounded-2xl border border-slate-200 bg-white/70 overflow-hidden flex items-center justify-center flex-shrink-0 dark:border-slate-700 dark:bg-slate-950/30">
                          {photo ? (
                            <img src={photo} alt="" className="h-full w-full object-cover" draggable={false} />
                          ) : (
                            <span aria-hidden>👤</span>
                          )}
                          <span
                            aria-label={onlineNow ? "ออนไลน์" : "ออฟไลน์"}
                            title={onlineNow ? "ออนไลน์" : "ออฟไลน์"}
                            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-950 ${
                              onlineNow ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                        </div>
                        <div className="truncate">
                          {name}
                          <span className="ml-2 text-[11px] font-semibold text-slate-500 dark:text-slate-300/80">• {onlineNow ? "ออนไลน์" : "ออฟไลน์"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="rounded-full">🎮 {plays}</Badge>
                        <Badge className="rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0">⭐ {total}</Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="rounded-3xl border border-white/70 bg-white/85 shadow-[0_20px_40px_rgba(19,34,76,0.14)] dark:border-slate-700/40 dark:bg-slate-950/55 dark:shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
            <CardHeader>
              <CardTitle className="text-xl">โพสต์ / พูดคุย</CardTitle>
              <CardDescription>หัวเรื่อง • เนื้อหา • รูป • ไลค์ • คอมเมนท์</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="button"
                    className="rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl"
                    onClick={() => {
                      setPostEditingId("");
                      setPostNotice("");
                      setPostTitleDraft("");
                      setPostBodyDraft("");
                      handlePickPostImage(null);
                      setPostModalOpen(true);
                    }}
                  >
                    เพิ่มโพสต์
                  </Button>
                </motion.div>
                {postNotice ? <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">{postNotice}</div> : null}
              </div>

              {postsError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-900 dark:border-rose-400/40 dark:bg-slate-900/40 dark:text-rose-100">
                  โหลดโพสต์ไม่สำเร็จ ({postsError})
                </div>
              ) : null}
              {postsLoading ? <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">กำลังโหลดโพสต์...</div> : null}

              <div className="space-y-4">
                {(posts || []).map((p) => {
                  const authorName = String(p?.authorNickname || "").trim() || "ผู้เล่น";
                  const authorPhoto = String(p?.authorPhotoURL || "").trim();
                  const likedBy = Array.isArray(p?.likedBy) ? p.likedBy : [];
                  const likeCount = likedBy.length;
                  const isLiked = Boolean(user?.uid && likedBy.includes(user.uid));
                  const postId = String(p?.id || "");
                  const isCommentsOpen = postId && activeCommentsPostId === postId;
                  const isOwner = Boolean(user?.uid && String(p?.authorUid || "") === String(user.uid));

                  return (
                    <div
                      key={postId || p?.createdAt?.seconds || Math.random()}
                      className="rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/35"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-2xl border border-slate-200 bg-white/70 overflow-hidden flex items-center justify-center flex-shrink-0 dark:border-slate-700 dark:bg-slate-950/30">
                            {authorPhoto ? (
                              <img src={authorPhoto} alt="" className="h-full w-full object-cover" draggable={false} />
                            ) : (
                              <span aria-hidden>👤</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 dark:text-slate-50 truncate">{authorName}</div>
                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-300/80">{formatTs(p?.createdAt)}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isOwner ? (
                            <>
                              <Button type="button" variant="outline" className="rounded-2xl" onClick={() => openEditPost(p)} disabled={postBusy}>
                                แก้ไข
                              </Button>
                              <Button type="button" variant="outline" className="rounded-2xl" onClick={() => confirmDeletePost(p)} disabled={postBusy}>
                                ลบ
                              </Button>
                            </>
                          ) : null}

                          {p?.authorUid ? (
                            <Button type="button" variant="ghost" className="rounded-2xl" onClick={() => openPublicProfile(p.authorUid)}>
                              ดูโปรไฟล์
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        <div className="text-base font-black text-slate-950 dark:text-slate-50 break-words">{String(p?.title || "")}</div>
                        {String(p?.body || "").trim() ? (
                          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words">{String(p.body)}</div>
                        ) : null}
                        {String(p?.imageUrl || "").trim() ? (
                          <div className="rounded-2xl border border-slate-200 bg-white/70 p-2 dark:border-slate-800 dark:bg-slate-950/35">
                            <img src={p.imageUrl} alt="" className="w-full max-h-[520px] object-contain rounded-xl" draggable={false} />
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className={`rounded-2xl font-semibold ${isLiked ? "border-rose-300 text-rose-700 dark:border-rose-400/40 dark:text-rose-200" : ""}`}
                          onClick={() => toggleLike(p)}
                        >
                          <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                          ไลค์ {likeCount ? `(${likeCount})` : ""}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl font-semibold"
                          onClick={() => {
                            const next = isCommentsOpen ? "" : postId;
                            setActiveCommentsPostId(next);
                            setCommentDraft("");
                          }}
                          disabled={!postId}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          คอมเมนท์
                        </Button>
                      </div>

                      {isCommentsOpen ? (
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-950/35 space-y-3">
                          {activeCommentsError ? (
                            <div className="text-sm font-semibold text-rose-700 dark:text-rose-200">โหลดคอมเมนท์ไม่สำเร็จ ({activeCommentsError})</div>
                          ) : null}
                          {activeCommentsLoading ? (
                            <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">กำลังโหลดคอมเมนท์...</div>
                          ) : null}

                          <div className="space-y-2">
                            {(activeComments || []).map((c) => {
                              const cn = String(c?.authorNickname || "").trim() || "ผู้เล่น";
                              const cp = String(c?.authorPhotoURL || "").trim();
                              return (
                                <div key={c.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-950/30">
                                  <div className="h-8 w-8 rounded-2xl border border-slate-200 bg-white/70 overflow-hidden flex items-center justify-center flex-shrink-0 dark:border-slate-700 dark:bg-slate-950/30">
                                    {cp ? <img src={cp} alt="" className="h-full w-full object-cover" draggable={false} /> : <span aria-hidden>👤</span>}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline justify-between gap-3">
                                      <div className="font-extrabold text-slate-900 dark:text-slate-50 truncate">{cn}</div>
                                      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-300/80">{formatTs(c?.createdAt)}</div>
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words">{String(c?.body || "")}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                              value={commentDraft}
                              onChange={(e) => setCommentDraft(e.target.value)}
                              placeholder="เขียนคอมเมนท์..."
                              className="rounded-2xl h-11"
                              maxLength={1000}
                            />
                            <Button
                              type="button"
                              className="rounded-2xl font-semibold bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg hover:shadow-xl"
                              onClick={submitComment}
                              disabled={commentBusy || !String(commentDraft || "").trim()}
                            >
                              {commentBusy ? "กำลังส่ง..." : "ส่ง"}
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}

                {!postsLoading && !(posts || []).length ? (
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">ยังไม่มีโพสต์</div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {postModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            aria-label="ปิดหน้าต่างเพิ่มโพสต์"
            onClick={closePostModal}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl"
          >
            <Card className="rounded-3xl border-2 border-slate-200 bg-white text-slate-950 shadow-2xl overflow-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50">
              <CardHeader className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="font-display text-2xl">{postEditingId ? "✏️ แก้ไขโพสต์" : "📝 เพิ่มโพสต์"}</CardTitle>
                    <CardDescription className="text-slate-800 dark:text-slate-200">
                      {postEditingId ? "แก้ไขหัวเรื่อง/เนื้อหา และรูปได้" : "ใส่หัวเรื่องและเรื่องที่อยากพูด"}
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl"
                    onClick={closePostModal}
                    title="ปิด"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <Input
                  value={postTitleDraft}
                  onChange={(e) => setPostTitleDraft(e.target.value)}
                  placeholder="หัวเรื่อง..."
                  maxLength={120}
                  className="rounded-2xl h-11"
                />

                <textarea
                  value={postBodyDraft}
                  onChange={(e) => setPostBodyDraft(e.target.value)}
                  placeholder="เล่าเรื่องราว..."
                  rows={6}
                  maxLength={2000}
                  className="w-full rounded-2xl border border-slate-200 bg-white/70 px-3 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950/45 dark:text-slate-100 dark:placeholder:text-slate-500"
                />

                {postImagePreview ? (
                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-2 dark:border-slate-800 dark:bg-slate-950/35">
                    <img src={postImagePreview} alt="" className="w-full max-h-[420px] object-contain rounded-xl" draggable={false} />
                    <div className="mt-2 flex justify-end">
                      <Button type="button" variant="outline" className="rounded-2xl" onClick={() => handlePickPostImage(null)}>
                        ลบรูป
                      </Button>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <label className="relative inline-flex">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onClick={(e) => {
                        try {
                          e.currentTarget.value = "";
                        } catch {
                          // ignore
                        }
                      }}
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        try {
                          e.currentTarget.value = "";
                        } catch {
                          // ignore
                        }
                        handlePickPostImage(file);
                      }}
                    />
                    <Button type="button" variant="outline" className="rounded-2xl font-semibold">
                      <ImagePlus className="w-4 h-4 mr-2" />
                      อัปโหลดรูป
                    </Button>
                  </label>

                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" className="rounded-2xl" onClick={closePostModal}>
                      ยกเลิก
                    </Button>
                    <Button
                      type="button"
                      className="rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl"
                      onClick={submitPost}
                      disabled={postBusy}
                    >
                      {postBusy
                        ? postStep === "uploading"
                          ? "กำลังอัปโหลดรูป..."
                          : postStep === "saving"
                            ? postEditingId
                              ? "กำลังบันทึก..."
                              : "กำลังโพสต์..."
                            : postEditingId
                              ? "กำลังบันทึก..."
                              : "กำลังโพสต์..."
                        : postEditingId
                          ? "บันทึก"
                          : "โพสต์"}
                    </Button>
                  </div>
                </div>

                {postNotice ? <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">{postNotice}</div> : null}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );

  const renderLibrary = () => (
    <div className="space-y-6">
      <Card className="rounded-3xl border border-white/70 bg-white/85 shadow-[0_20px_40px_rgba(19,34,76,0.14)] dark:border-slate-700/40 dark:bg-slate-950/55 dark:shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">
                {libraryTab === "legal" ? (legalSelectedItem ? "รายละเอียด" : "รายชื่ออนิเมะ") : "Anime Library"}
              </CardTitle>
              <CardDescription>
                {libraryTab === "catalog"
                  ? <>ตอนนี้มีอนิเมะให้ทายทั้งหมด {totalCount} เรื่อง • กำลังดู {selectedGenreLabel}</>
                  : legalSelectedItem
                    ? <>ดูข้อมูลเรื่อง/เพลง และช่องทางรับชม/ฟัง (ลิขสิทธิ์ไทย)</>
                    : <>ดูรายชื่อ + ช่องทางรับชม/ฟัง (ลิขสิทธิ์ไทย)</>}
              </CardDescription>
            </div>
            {libraryTab === "catalog" && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ค้นหาชื่อเรื่อง..."
                    className="pl-9 rounded-2xl"
                  />
                </div>

                <Button
                  variant="outline"
                  className="rounded-2xl sm:shrink-0"
                  onClick={submitSongRequest}
                  disabled={songRequestBusy}
                  title="ส่งคำขอเพลงที่อยากได้ให้ผู้พัฒนา"
                >
                  {songRequestBusy ? "กำลังส่ง…" : "ขอเพลงเพิ่ม"}
                </Button>
              </div>
            )}

            {libraryTab === "legal" && legalSelectedItem ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => setLegalSelectedKey("")}
                  title="กลับไปหน้ารายชื่อ"
                >
                  ← กลับ
                </Button>
              </div>
            ) : null}
          </div>

          {libraryTab === "legal" && !legalSelectedItem ? (
            <div className="space-y-3">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-slate-400" />
                <Input
                  value={legalSearch}
                  onChange={(e) => setLegalSearch(e.target.value)}
                  placeholder="พิมพ์ชื่อเรื่องที่นี่ (ตามไทย, Romaji, 日本語)"
                  className="pl-9 rounded-2xl"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200/80">
                    <Shield className="h-4 w-4" />
                    ลิขสิทธิ์ (ไทย)
                  </div>
                  <select
                    value={legalProviderFilter}
                    onChange={(e) => setLegalProviderFilter(e.target.value)}
                    className="h-10 w-full rounded-2xl border border-slate-200 bg-white/70 px-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950/45 dark:text-slate-100"
                  >
                    <option value="all">ทั้งหมด</option>
                    {libraryListMode === "songs" ? (
                      <>
                        <option value="spotify">Spotify</option>
                        <option value="applemusic">Apple Music</option>
                        <option value="ytmusic">YouTube Music</option>
                        <option value="youtube">YouTube</option>
                      </>
                    ) : (
                      <>
                        <option value="netflix">Netflix</option>
                        <option value="prime">Prime Video</option>
                        <option value="disney">Disney+</option>
                        <option value="crunchyroll">Crunchyroll</option>
                        <option value="iqiyi">iQIYI</option>
                        <option value="bilibili">Bilibili</option>
                        <option value="trueid">TrueID</option>
                        <option value="viu">Viu</option>
                        <option value="muse">Muse Thailand</option>
                        <option value="anione">Ani-One Asia</option>
                        <option value="flixer">Flixer</option>
                        <option value="gundaminfo">GundamInfo</option>
                        <option value="pops">POPS</option>
                        <option value="linetv">LINE TV</option>
                        <option value="youtube">YouTube</option>
                        <option value="x">X</option>
                        <option value="appletv">Apple TV</option>
                        <option value="pokemonasia">Pokémon Asia (YouTube)</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200/80">
                    <Headphones className="h-4 w-4" />
                    เสียงพากย์
                  </div>
                  <select
                    disabled
                    className="h-10 w-full rounded-2xl border border-slate-200 bg-white/50 px-3 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950/35 dark:text-slate-200/70"
                    title="ยังไม่มีข้อมูลเสียงพากย์ในชุดข้อมูล"
                  >
                    <option>ทั้งหมด</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200/80">
                    <Eye className="h-4 w-4" />
                    ซับได้
                  </div>
                  <select
                    disabled
                    className="h-10 w-full rounded-2xl border border-slate-200 bg-white/50 px-3 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950/35 dark:text-slate-200/70"
                    title="ยังไม่มีข้อมูลซับในชุดข้อมูล"
                  >
                    <option>ทั้งหมด</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200/80">
                    <Info className="h-4 w-4" />
                    สถานะ
                  </div>
                  <select
                    disabled
                    className="h-10 w-full rounded-2xl border border-slate-200 bg-white/50 px-3 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950/35 dark:text-slate-200/70"
                    title="ยังไม่มีข้อมูลสถานะฉาย/จบในชุดข้อมูล"
                  >
                    <option>ทั้งหมด</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200/80">
                    <ListMusic className="h-4 w-4" />
                    ประเภท
                  </div>
                  <select
                    value={legalGenreFilter}
                    onChange={(e) => setLegalGenreFilter(e.target.value)}
                    disabled={libraryListMode === "songs"}
                    className="h-10 w-full rounded-2xl border border-slate-200 bg-white/70 px-3 text-sm text-slate-900 outline-none disabled:bg-white/50 disabled:text-slate-700 dark:border-slate-700 dark:bg-slate-950/45 dark:text-slate-100 dark:disabled:bg-slate-950/35 dark:disabled:text-slate-200/70"
                    title={libraryListMode === "songs" ? "โหมดเพลงยังไม่รองรับกรองตามแนว" : ""}
                  >
                    <option value="all">ทั้งหมด</option>
                    {libraryListMode !== "songs" && legalGenreTagOptions.length
                      ? legalGenreTagOptions.map((tag) => (
                          <option key={tag} value={tag}>
                            {tag}
                          </option>
                        ))
                      : null}
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200/80">
                    <Trophy className="h-4 w-4" />
                    ปี
                  </div>
                  <select
                    value={legalYearFilter}
                    onChange={(e) => setLegalYearFilter(e.target.value)}
                    className="h-10 w-full rounded-2xl border border-slate-200 bg-white/70 px-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950/45 dark:text-slate-100"
                  >
                    <option value="all">ทั้งหมด</option>
                    {legalYearOptions.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200/80">
                    <RotateCcw className="h-4 w-4" />
                    ฉาย/จบ
                  </div>
                  <select
                    disabled
                    className="h-10 w-full rounded-2xl border border-slate-200 bg-white/50 px-3 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950/35 dark:text-slate-200/70"
                    title="ยังไม่มีข้อมูลฉาย/จบในชุดข้อมูล"
                  >
                    <option>ทั้งหมด</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200/80">
                    <Palette className="h-4 w-4" />
                    รูปแบบ
                  </div>
                  <select
                    value={libraryListMode}
                    onChange={(e) => setLibraryListMode(e.target.value)}
                    className="h-10 w-full rounded-2xl border border-slate-200 bg-white/70 px-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950/45 dark:text-slate-100"
                  >
                    <option value="works">รายชื่อเรื่อง (ตัดภาค)</option>
                    <option value="songs">เพลง OP/ED</option>
                    <option value="all">ทั้งหมด (รวมภาค/ซีซั่น + OP/ED)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="font-semibold">{legalFilteredItems.length.toLocaleString()} รายการ</div>
                <div>หมายเหตุ: ผลลัพธ์ขึ้นกับสิทธิ์ในไทยและอาจเปลี่ยนแปลงได้</div>
              </div>
            </div>
          ) : null}
        </CardHeader>
      </Card>

      {libraryTab === "legal" ? (
        legalSelectedItem ? (
          <>
            <Card className="rounded-3xl border border-white/70 bg-white/85 shadow-[0_16px_28px_rgba(15,23,42,0.1)] overflow-hidden dark:border-slate-700/40 dark:bg-slate-950/55 dark:shadow-[0_16px_28px_rgba(0,0,0,0.35)]">
              <div className="relative">
                <SmartImage
                  src={getAnimeImageUrl(legalSelectedItem.anime)}
                  fallbackSrc={getYouTubeThumbUrl(legalSelectedItem.anime?.youtubeVideoId)}
                  alt={legalSelectedDisplayTitle || ""}
                  className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/55 to-transparent" />
                <div className="relative p-5 sm:p-6">
                  <div className="flex flex-col md:flex-row gap-5">
                    <div className="shrink-0">
                      <SmartImage
                        src={getAnimeImageUrl(legalSelectedItem.anime)}
                        fallbackSrc={getYouTubeThumbUrl(legalSelectedItem.anime?.youtubeVideoId)}
                        alt={legalSelectedDisplayTitle || ""}
                        className="h-[188px] w-[140px] sm:h-[220px] sm:w-[164px] rounded-2xl object-cover border border-white/30 bg-slate-100/20 shadow-xl"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      {(() => {
                        const providerOrderWorks = [
                          "netflix",
                          "prime",
                          "disney",
                          "crunchyroll",
                          "bilibili",
                          "iqiyi",
                          "trueid",
                          "viu",
                          "muse",
                          "anione",
                          "flixer",
                          "gundaminfo",
                          "pops",
                          "linetv",
                          "youtube",
                          "pokemonasia",
                          "x",
                          "appletv"
                        ];
                        const providerOrderSongs = ["spotify", "applemusic", "ytmusic", "youtube"];
                        const fallbackProviderKeys = legalSelectedIsSongLike
                          ? providerOrderSongs
                          : ["netflix", "prime", "disney", "crunchyroll", "iqiyi", "bilibili", "trueid"];

                        const displayTitle = legalSelectedDisplayTitle;
                        const rawTitle = String(legalSelectedItem.title || "");
                        const year = Number.isFinite(legalSelectedItem?.anime?.year) ? Math.floor(legalSelectedItem.anime.year) : null;

                        const catalogByTitle = legalCatalogTH?.byTitle || null;
                        const catalogByBase = legalCatalogTH?.byBase || null;
                        const catalogByTitleLoose = legalCatalogTH?.byTitleLoose || null;
                        const catalogByBaseLoose = legalCatalogTH?.byBaseLoose || null;

                        const titleKey = normalizeAvailabilityKey(legalSelectedIsSongLike ? rawTitle : displayTitle);
                        const titleKeyLoose = normalizeAvailabilityKeyLoose(legalSelectedIsSongLike ? rawTitle : displayTitle);
                        const baseKey = availabilityBaseKeyFromTitle(displayTitle);
                        const baseKeyLoose = normalizeAvailabilityKeyLoose(baseKey);

                        const catalogEntryTitle = catalogByTitle?.[titleKey] || catalogByTitleLoose?.[titleKeyLoose] || null;
                        const catalogEntryBase = catalogByBase?.[baseKey] || catalogByBaseLoose?.[baseKeyLoose] || null;
                        const catalogGenres = catalogEntryTitle?.genres || catalogEntryBase?.genres || null;
                        const catalogNote = catalogEntryTitle?.note || catalogEntryBase?.note || "";

                        const fallbackGenreLabel = getFallbackGenreLabel(legalSelectedItem?.anime);
                        const effectiveGenres = Array.isArray(catalogGenres) && catalogGenres.length
                          ? catalogGenres
                          : fallbackGenreLabel
                            ? [fallbackGenreLabel]
                            : [];

                        const providerKeysRaw = getProvidersForQueryTitle({ rawTitle: rawTitle || displayTitle, isSongLike: legalSelectedIsSongLike });
                        const order = legalSelectedIsSongLike ? providerOrderSongs : providerOrderWorks;
                        const ordered = order.filter((k) => providerKeysRaw.includes(k));
                        const effectiveProviderKeys = ordered.length ? ordered : (providerKeysRaw.length ? providerKeysRaw : fallbackProviderKeys);

                        const manualEntry = findManualSynopsisEntry(manualSynopsisDb, displayTitle);
                        const altTitle = pickAltTitleLabel(manualEntry, displayTitle);
                        const isSong = legalSelectedIsSongLike;
                        const googleUrl = buildLegalSearchUrl(displayTitle);
                        const anilistUrl = `https://anilist.co/search/anime?search=${encodeURIComponent(displayTitle)}`;
                        const malUrl = `https://myanimelist.net/anime.php?q=${encodeURIComponent(displayTitle)}&cat=anime`;

                        return (
                          <>
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-2xl sm:text-3xl font-extrabold text-white leading-tight break-words">
                                  {displayTitle}
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-white/80">
                                  <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1">
                                    {isSong ? "เพลง OP/ED" : "เรื่อง"}
                                  </span>
                                  {year ? (
                                    <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1">ปี {year}</span>
                                  ) : null}
                                  {altTitle ? (
                                    <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1">ชื่ออื่น: {altTitle}</span>
                                  ) : null}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="rounded-2xl border-white/30 bg-white/10 text-white hover:bg-white/15"
                                  onClick={() => window.open(googleUrl, "_blank", "noopener,noreferrer")}
                                >
                                  Google
                                </Button>
                                {!isSong ? (
                                  <>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="rounded-2xl border-white/30 bg-white/10 text-white hover:bg-white/15"
                                      onClick={() => window.open(anilistUrl, "_blank", "noopener,noreferrer")}
                                    >
                                      AniList
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="rounded-2xl border-white/30 bg-white/10 text-white hover:bg-white/15"
                                      onClick={() => window.open(malUrl, "_blank", "noopener,noreferrer")}
                                    >
                                      MyAnimeList
                                    </Button>
                                  </>
                                ) : null}
                              </div>
                            </div>

                            {effectiveGenres.length && !isSong ? (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {effectiveGenres.slice(0, 8).map((g) => (
                                  <Badge
                                    key={g}
                                    variant="outline"
                                    className="rounded-full border-white/25 bg-white/10 text-white"
                                  >
                                    {g}
                                  </Badge>
                                ))}
                              </div>
                            ) : null}

                            {catalogNote ? (
                              <div className="mt-4 text-sm font-semibold text-white/80 whitespace-pre-line">{catalogNote}</div>
                            ) : null}

                            <div className="mt-5">
                              <div className="text-xs font-semibold text-white/80 mb-2">ช่องทางรับชม/ฟัง (กดไอคอนเพื่อค้นหา)</div>
                              <div className="flex flex-wrap items-center gap-2">
                                {effectiveProviderKeys.slice(0, 18).map((providerKey) => {
                                  const provider = LEGAL_PROVIDER_PRESETS[providerKey];
                                  const term = isSong ? rawTitle : displayTitle;
                                  return (
                                    <ProviderIconButton
                                      key={providerKey}
                                      providerKey={providerKey}
                                      term={term}
                                      title={provider?.label}
                                      iconSrc={providerIcons?.[providerKey] || ""}
                                      size="md"
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {!legalSelectedIsSongLike ? (
              <Card className="rounded-3xl border border-white/70 bg-white/85 shadow-[0_16px_28px_rgba(15,23,42,0.1)] dark:border-slate-700/40 dark:bg-slate-950/55 dark:shadow-[0_16px_28px_rgba(0,0,0,0.35)]">
                <CardContent className="space-y-3">
                  <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100">📖 เรื่องย่อ</div>
                  <SynopsisInline
                    title={legalSelectedDisplayTitle}
                    synopsisCache={synopsisCache}
                    synopsisLoading={synopsisLoading}
                    ensureSynopsis={ensureSynopsis}
                  />
                  {manualSynopsisDb?.generatedAt ? (
                    <div className="text-xs text-slate-600 dark:text-slate-300">อัปเดตฐานข้อมูลเรื่องย่อ: {String(manualSynopsisDb.generatedAt)}</div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}
          </>
        ) : (
          <>
            <Card className="rounded-3xl border border-white/70 bg-white/85 shadow-[0_16px_28px_rgba(15,23,42,0.1)] dark:border-slate-700/40 dark:bg-slate-950/55 dark:shadow-[0_16px_28px_rgba(0,0,0,0.35)]">
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100"> รายการ</div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    แสดง {legalFilteredItems.length.toLocaleString()} จาก {(libraryListMode === "works"
                      ? libraryTitleLists.works.length
                      : libraryListMode === "songs"
                        ? libraryTitleLists.songs.length
                        : libraryTitleLists.all.length
                    ).toLocaleString()}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {legalFilteredItems.map((item) => {
                    const providerOrderWorks = [
                      "netflix",
                      "prime",
                      "disney",
                      "crunchyroll",
                      "bilibili",
                      "iqiyi",
                      "trueid",
                      "viu",
                      "muse",
                      "anione",
                      "flixer",
                      "gundaminfo",
                      "pops",
                      "linetv",
                      "youtube",
                      "pokemonasia",
                      "x",
                      "appletv"
                    ];
                    const providerOrderSongs = ["spotify", "applemusic", "ytmusic", "youtube"];

                    const fallbackProviderKeys = libraryListMode === "songs"
                      ? providerOrderSongs
                      : ["netflix", "prime", "disney", "crunchyroll", "iqiyi", "bilibili", "trueid"];

                    const availabilityByTitle = legalAvailability?.byTitle || null;
                    const availabilityByBase = legalAvailability?.byBase || null;
                    const availabilityByTitleLoose = legalAvailability?.byTitleLoose || null;
                    const availabilityByBaseLoose = legalAvailability?.byBaseLoose || null;

                    const catalogByTitle = legalCatalogTH?.byTitle || null;
                    const catalogByBase = legalCatalogTH?.byBase || null;
                    const catalogByTitleLoose = legalCatalogTH?.byTitleLoose || null;
                    const catalogByBaseLoose = legalCatalogTH?.byBaseLoose || null;

                    const isSongLike = libraryListMode === "songs" || (libraryListMode !== "works" && isSongEntryTitle(item.title));
                    const displayTitle = libraryListMode === "songs" ? item.title : stripOpEdSuffix(item.title);

                    // In works mode, the representative title can still contain (OP/EDn).
                    // Use the display title (suffix-stripped) for base/title lookups.
                    const titleKey = normalizeAvailabilityKey(isSongLike ? item.title : displayTitle);
                    const titleKeyLoose = normalizeAvailabilityKeyLoose(isSongLike ? item.title : displayTitle);
                    const baseKey = availabilityBaseKeyFromTitle(displayTitle);
                    const baseKeyLoose = normalizeAvailabilityKeyLoose(baseKey);

                    const catalogEntryTitle = catalogByTitle?.[titleKey] || catalogByTitleLoose?.[titleKeyLoose] || null;
                    const catalogEntryBase = catalogByBase?.[baseKey] || catalogByBaseLoose?.[baseKeyLoose] || null;
                    const catalogProviders = catalogEntryTitle?.providers || catalogEntryBase?.providers || null;
                    const catalogGenres = catalogEntryTitle?.genres || catalogEntryBase?.genres || null;
                    const catalogNote = catalogEntryTitle?.note || catalogEntryBase?.note || "";
                    const availableKeys = isSongLike
                      ? availabilityByTitle?.[titleKey]?.providers || availabilityByTitleLoose?.[titleKeyLoose]?.providers || null
                      : availabilityByBase?.[baseKey] || availabilityByBaseLoose?.[baseKeyLoose] || null;

                    const fallbackGenreLabel = getFallbackGenreLabel(item?.anime);
                    const effectiveGenres = Array.isArray(catalogGenres) && catalogGenres.length
                      ? catalogGenres
                      : [fallbackGenreLabel];

                    const unsortedEffective = Array.isArray(catalogProviders) && catalogProviders.length
                      ? catalogProviders
                      : Array.isArray(availableKeys) && availableKeys.length
                        ? availableKeys
                        : fallbackProviderKeys;

                    const order = libraryListMode === "songs" ? providerOrderSongs : providerOrderWorks;
                    const effectiveProviderKeys = order.filter((k) => unsortedEffective.includes(k));

                    const visibleProviderKeys = legalProviderFilter === "all"
                      ? effectiveProviderKeys.slice(0, 4)
                      : effectiveProviderKeys.includes(legalProviderFilter)
                        ? [legalProviderFilter]
                        : [];

                    return (
                      <div
                        key={item.key}
                        role="button"
                        tabIndex={0}
                        onClick={() => openLegalDetail(item.key)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openLegalDetail(item.key);
                          }
                        }}
                        className="rounded-2xl border border-slate-200 bg-white/70 overflow-hidden cursor-pointer transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-slate-700 dark:bg-slate-950/45 dark:hover:border-slate-600"
                        title="คลิกเพื่อดูรายละเอียด"
                      >
                        <div className="flex">
                          <div className="shrink-0">
                            <SmartImage
                              src={getAnimeImageUrl(item.anime)}
                              fallbackSrc={getYouTubeThumbUrl(item.anime?.youtubeVideoId)}
                              alt={displayTitle}
                              className="h-[138px] w-[104px] sm:h-[150px] sm:w-[112px] object-cover border-r border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900"
                            />
                          </div>

                          <div className="min-w-0 flex-1 p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-snug break-words">
                                  {displayTitle}
                                </div>
                                {libraryListMode !== "songs" ? (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {effectiveGenres.slice(0, 3).map((g) => (
                                      <Badge
                                        key={g}
                                        variant="outline"
                                        className="rounded-full border-slate-200 bg-white/60 text-slate-800 dark:border-slate-700 dark:bg-slate-950/35 dark:text-slate-100"
                                      >
                                        {g}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : null}

                                {catalogNote ? (
                                  <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">{catalogNote}</div>
                                ) : null}
                              </div>

                              <div className="hidden sm:flex items-center gap-1">
                                {visibleProviderKeys.map((k) => (
                                  <ProviderTextBadge key={k} providerKey={k} />
                                ))}
                              </div>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {effectiveProviderKeys.slice(0, 8).map((providerKey) => {
                                const provider = LEGAL_PROVIDER_PRESETS[providerKey];
                                const term = libraryListMode === "songs" ? item.title : displayTitle;
                                return (
                                  <ProviderIconButton
                                    key={providerKey}
                                    providerKey={providerKey}
                                    term={term}
                                    title={provider?.label}
                                    iconSrc={providerIcons?.[providerKey] || ""}
                                    size="sm"
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300">
                  กดไอคอนเพื่อเปิดค้นหาในแพลตฟอร์มนั้น ๆ • คลิกการ์ดเพื่อดูรายละเอียด
                </div>
              </CardContent>
            </Card>

            {page === "library" && libraryTab === "legal" ? (
              <div className="fixed bottom-20 right-4 z-[139]">
                <div className="relative">
                  {legalBotOpen ? (
                    <div className="absolute bottom-0 right-full mr-3 w-[340px] max-w-[calc(100vw-7.5rem)]">
                  <Card className="rounded-3xl border border-white/70 bg-white/90 shadow-[0_16px_28px_rgba(15,23,42,0.16)] dark:border-slate-700/40 dark:bg-slate-950/70 dark:shadow-[0_16px_28px_rgba(0,0,0,0.45)]">
                    <CardHeader className="py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <CardTitle className="text-base">แชทบอทช่วยค้นหาช่องทางรับชม/ฟัง</CardTitle>
                          <CardDescription className="text-xs">
                            ถามได้เลย เช่น “Jujutsu Kaisen ดูที่ไหน” หรือ “เพลง OP Demon Slayer ฟังที่ไหน”
                          </CardDescription>
                        </div>
                        <Button type="button" variant="outline" className="rounded-2xl" onClick={() => setLegalBotOpen(false)}>
                          ปิด
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div
                        ref={legalBotScrollRef}
                        className="h-56 overflow-auto rounded-2xl border border-slate-200 bg-white/60 p-3 space-y-2 dark:border-slate-700 dark:bg-slate-950/35"
                      >
                        {(legalBotMessages || []).map((m) => (
                          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                            <div
                              className={
                                m.role === "user"
                                  ? "max-w-[85%] rounded-2xl bg-slate-900 text-white px-3 py-2 text-sm dark:bg-slate-200 dark:text-slate-900"
                                  : "max-w-[85%] rounded-2xl bg-slate-100 text-slate-900 px-3 py-2 text-sm dark:bg-slate-900/60 dark:text-slate-100"
                              }
                            >
                              {m.text}
                            </div>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleLegalBotSend} className="flex gap-2">
                        <Input
                          value={legalBotInput}
                          onChange={(e) => setLegalBotInput(e.target.value)}
                          placeholder="พิมพ์คำถาม..."
                          className="rounded-2xl"
                        />
                        <Button type="submit" className="rounded-2xl">ส่ง</Button>
                      </form>
                    </CardContent>
                  </Card>
                    </div>
                  ) : null}

                  <Button
                    type="button"
                    className="rounded-2xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg hover:shadow-xl relative"
                    onClick={() => setLegalBotOpen((v) => !v)}
                    title="แชทบอทช่องทางรับชม/ฟัง"
                  >
                    🤖 แชทบอท
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )
      ) : (
        <>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAnime.map((anime) => (
              <Card key={anime.id} className="rounded-3xl border border-white/70 bg-white/85 shadow-[0_16px_28px_rgba(15,23,42,0.1)] dark:border-slate-700/40 dark:bg-slate-950/55 dark:shadow-[0_16px_28px_rgba(0,0,0,0.35)]">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg leading-6">{anime.title}</CardTitle>
                      <CardDescription className="mt-1">{anime.altTitles.join(" • ") || "-"}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {anime?.id != null ? (
                        <button
                          type="button"
                          onClick={() => toggleFavoriteId(anime.id)}
                          title={favoriteSet.has(Number(anime.id)) ? "ลบออกจาก Favorites" : "เพิ่มเข้า Favorites"}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-slate-200 bg-white/70 text-slate-900 hover:bg-white hover:border-slate-300 transition-colors dark:border-slate-700 dark:bg-slate-950/45 dark:text-slate-100 dark:hover:bg-slate-900/55"
                        >
                          {favoriteSet.has(Number(anime.id)) ? "⭐" : "☆"}
                        </button>
                      ) : null}
                      <Badge className="rounded-full">{genreConfig[anime.genre]?.label || anime.genre}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-zinc-600 dark:text-slate-200/80">
                  <div>ปีฉาย: {anime.year}</div>
                  <div>OP: {anime.note}</div>
                  <LazyYouTube videoSource={anime.youtubeVideoId} title={anime.title} />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-3">
            <Button className="rounded-2xl" onClick={() => setPage("home")}>กลับหน้าแรก</Button>
            <Button variant="outline" className="rounded-2xl" onClick={startGame}>เริ่มเล่นเลย</Button>
          </div>
        </>
      )}
    </div>
  );

  const renderPlay = () => {
    if (!currentAnime) return null;

    const groupTotal = Array.isArray(groupPlayers) ? groupPlayers.length : 0;
    const groupAlive = Array.isArray(groupPlayers)
      ? groupPlayers.filter((p) => (typeof p?.hp === "number" ? p.hp : 0) > 0).length
      : 0;

    const groupTurnSafe = Math.max(0, Math.min((groupPlayers || []).length - 1, Number(groupTurnIndex) || 0));
    const groupTurnPlayer = isGroupMode ? (groupPlayers || [])[groupTurnSafe] : null;
    const remainingMs = isTimeAttack ? Math.max(0, TIME_ATTACK_MS - playElapsedMs) : 0;

    return (
      <>
        <div className="grid gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="rounded-3xl border border-white/70 bg-gradient-to-br from-white/90 via-white/85 to-blue-50/40 shadow-[0_28px_56px_rgba(19,34,76,0.18)] backdrop-blur-xl overflow-hidden dark:border-slate-700/40 dark:from-slate-950/60 dark:via-slate-950/45 dark:to-slate-900/40 dark:shadow-[0_28px_56px_rgba(0,0,0,0.45)]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-purple-400/5 pointer-events-none dark:from-cyan-400/10 dark:to-blue-500/10" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold text-sm">
                        {currentIndex + 1}
                      </div>
                      <CardTitle className="font-display text-2xl">ข้อ {currentIndex + 1}{isNormalPlay ? ` / ${gameList.length}` : ""}</CardTitle>
                    </div>
                      <CardDescription className="text-sm">
                        แนว <span className="font-semibold">{selectedGenreLabel}</span>
                        {isGroupMode ? (
                            <> • เล่นกลุ่ม • <span className="text-emerald-600 dark:text-emerald-300 font-semibold">ตาคนตอบ: {String(groupTurnPlayer?.name || "ผู้เล่น")}</span> • <span className="font-semibold">🔥 streak: {runCurrStreak}</span></>
                        ) : (
                          <> • {answerModeConfig[answerMode].label} • <span className="text-emerald-600 dark:text-emerald-300 font-semibold">คะแนน: {score}</span> • <span className="font-semibold">🔥 streak: {runCurrStreak}</span></>
                        )}
                        {isTimeAttack ? <> • จับเวลา 3 นาที</> : null}
                        {isSoloChallenge ? (
                          <> • <span className="font-semibold text-rose-600 dark:text-rose-300">HP: {soloHp}</span> • <span className="font-semibold text-amber-600 dark:text-amber-300">x{soloWrongMultiplier}</span></>
                        ) : null}
                      </CardDescription>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white border-0">
                      {isTimeAttack ? `⏳ เหลือ ${formatRemainingThai(remainingMs)}` : `⏱️ เล่นมา ${formatPlayElapsedThai(playElapsedMs)}`}
                    </Badge>
                    <Badge variant="outline" className="rounded-full border-2 border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-950/45">🔥 {runCurrStreak}</Badge>
                      <Badge variant="outline" className="rounded-full border-2 border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-950/45">{genreConfig[currentAnime.genre]?.label || currentAnime.genre}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 relative">
              {isGroupMode ? (
                <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/35">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50 mb-3">สกอร์บอร์ดผู้เล่น</div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(groupPlayers || []).map((p) => {
                      const hp = typeof p?.hp === "number" ? p.hp : 0;
                      const mult = typeof p?.mult === "number" ? p.mult : 1;
                      const ps = typeof p?.score === "number" ? p.score : 0;
                      const eliminated = hp <= 0;
                      return (
                        <div
                          key={p.id}
                          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                            eliminated
                              ? "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-400/30 dark:bg-slate-950/45 dark:text-rose-200"
                              : "border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950/30 dark:text-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="truncate">{p.name || "ผู้เล่น"}</div>
                            <Badge variant="outline" className="rounded-full">⭐ {ps}</Badge>
                          </div>
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <Badge className="rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white border-0">HP {hp}</Badge>
                            <Badge variant="outline" className="rounded-full">x{mult}</Badge>
                            {eliminated ? <Badge variant="outline" className="rounded-full">ตกรอบ</Badge> : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <div ref={playFocusRef} className="space-y-5">
              <div className="space-y-2">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="relative aspect-video overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-black shadow-2xl w-[70%] mx-auto"
                >
                  <iframe
                    ref={iframeRef}
                    key={getYouTubeId(currentAnime.youtubeVideoId) || String(currentAnime.youtubeVideoId || "")}
                    title={currentAnime.title}
                    className="w-full h-[calc(100%+72px)] -mt-[72px]"
                    src={buildYouTubeEmbedUrl(currentAnime.youtubeVideoId, { start: 0 })}
                    referrerPolicy="origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-black" />
                </motion.div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className="rounded-2xl border-2 border-slate-300 hover:border-orange-400 hover:bg-orange-50 font-semibold dark:border-slate-700 dark:hover:bg-slate-900/60 dark:hover:border-cyan-400/40"
                    onClick={skipQuestion}
                    disabled={!!feedback}
                    title="ข้ามข้อนี้"
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    ข้าม
                  </Button>
                  <Button
                    className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl"
                    onClick={goNext}
                    disabled={!feedback}
                    title="ไปข้อต่อไป"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    ต่อไป
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-2xl border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 font-semibold dark:border-slate-700 dark:hover:bg-slate-900/60 dark:hover:border-cyan-400/40"
                    onClick={resetAll}
                    title="กลับหน้าแรก"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    หน้าแรก
                  </Button>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-2xl border-2 border-slate-300 hover:border-rose-400 hover:bg-rose-50 font-semibold dark:border-slate-700 dark:hover:bg-slate-900/60 dark:hover:border-rose-400/40"
                      onClick={() => {
                        const nextOpen = !videoReportOpen;
                        setVideoReportNotice("");
                        setVideoReportOpen(nextOpen);
                        if (nextOpen) {
                          const title = String(currentAnime?.title || "").trim();
                          if (!String(videoReportSubject || "").trim()) {
                            setVideoReportSubject(title ? `วิดีโอมีปัญหา: ${title}`.slice(0, 80) : "วิดีโอมีปัญหา");
                          }
                        }
                      }}
                      disabled={!currentAnime}
                      title="รายงานกรณีวิดีโอมีปัญหา"
                    >
                      รายงานวิดีโอมีปัญหา
                    </Button>
                    {videoReportNotice ? (
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">{videoReportNotice}</div>
                    ) : null}
                  </div>

                  {videoReportOpen ? (
                    <div className="mt-3 rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/35 space-y-3">
                      <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50">รายงานปัญหาวิดีโอ</div>

                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">หัวเรื่อง</div>
                        <Input
                          value={videoReportSubject}
                          onChange={(e) => setVideoReportSubject(e.target.value)}
                          placeholder="เช่น วิดีโอเล่นไม่ได้ / ขึ้น error / ไม่มีเสียง"
                          className="rounded-2xl h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">รายละเอียด</div>
                        <textarea
                          value={videoReportDetails}
                          onChange={(e) => setVideoReportDetails(e.target.value)}
                          rows={4}
                          placeholder="อธิบายสิ่งที่เจอ เช่น ขึ้นข้อความอะไร, อุปกรณ์/บราวเซอร์, ทำขั้นตอนไหนแล้วเกิด"
                          className="w-full rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950/45 dark:text-slate-100"
                        />
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          ระบบจะแนบชื่อเพลง + YouTube ID ให้อัตโนมัติ
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          className="rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl"
                          onClick={submitVideoReport}
                          disabled={videoReportBusy}
                        >
                          {videoReportBusy ? "กำลังส่ง…" : "ส่งรายงาน"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl"
                          onClick={() => {
                            setVideoReportOpen(false);
                          }}
                          disabled={videoReportBusy}
                        >
                          ปิด
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

            {answerModeConfig[answerMode].choices ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="grid sm:grid-cols-2 gap-3 pt-2"
              >
                {currentChoices.map((choice, idx) => (
                  <motion.div
                    key={choice.id}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Button
                      variant="outline"
                      className="group rounded-2xl h-auto py-4 whitespace-normal w-full bg-white hover:bg-gradient-to-br hover:from-sky-50 hover:to-indigo-50 border-2 border-slate-200 hover:border-sky-300 text-slate-900 font-semibold transition-all duration-200 shadow-sm hover:shadow-md dark:bg-slate-950/35 dark:hover:bg-gradient-to-br dark:hover:from-cyan-400/10 dark:hover:to-blue-500/10 dark:border-slate-700 dark:hover:border-cyan-400/60 dark:text-slate-100"
                      disabled={!!feedback}
                      onClick={() => {
                        setAnswer(choice.title);
                        checkAnswer(choice);
                      }}
                    >
                      <span className="text-sm text-slate-600 group-hover:text-slate-800 dark:text-slate-200/75 dark:group-hover:text-cyan-200 mr-2">({String.fromCharCode(65 + idx)})</span>
                      <span className="leading-snug">{choice.title}</span>
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="space-y-3 pt-2"
              >
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">พิมพ์ชื่อเรื่องที่คิดว่าใช่</label>
                  <Input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="ตัวอย่าง: Attack on Titan..."
                      className="rounded-2xl h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-medium dark:border-slate-700 dark:bg-slate-950/45 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20"
                    disabled={!!feedback}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitAnswer();
                    }}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 min-w-max">
                    <Button className="rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl w-full" onClick={submitAnswer} disabled={!!feedback}>✓ ส่งคำตอบ</Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" className="rounded-2xl border-2 border-amber-300 hover:bg-amber-50 text-amber-700 font-semibold" onClick={() => setShowHint(true)}>
                      <Info className="w-4 h-4 mr-2" />
                      💡 Hint
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {showHint && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-4 text-sm text-amber-900 shadow-lg font-semibold dark:border-cyan-400/35 dark:bg-none dark:bg-slate-950/55 dark:text-slate-100"
              >
                💡 คำใบ้: ชื่อเรื่องขึ้นต้นด้วย <span className="font-bold text-lg text-amber-700 dark:text-cyan-200">"{currentAnime.title.charAt(0)}"</span>
              </motion.div>
            )}
            </div>
          </CardContent>
        </Card>
        </motion.div>
        </div>

      {feedback && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl"
          >
            <Card className={`rounded-3xl border-2 shadow-2xl overflow-hidden bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-50 ${
              feedback.type === "correct"
                ? "border-emerald-300 dark:border-emerald-400/50"
                : feedback.type === "skip"
                  ? "border-amber-300 dark:border-cyan-400/50"
                  : "border-rose-300 dark:border-rose-400/50"
            }`}
            >
              <CardHeader className="relative pb-3">
                <CardTitle className="font-display text-2xl text-slate-950 dark:text-slate-50 drop-shadow-sm">
                  {feedback.type === "correct" ? "✅ ถูกต้อง!" : feedback.type === "skip" ? "⏭️ ข้ามข้อ" : "❌ ยังไม่ถูก"}
                </CardTitle>
                <CardDescription className="text-sm text-slate-800 dark:text-slate-200">
                  {isGroupMode
                    ? feedback?.type === "wrong"
                      ? "เลือกคนที่ตอบผิดก่อน แล้วให้คนถัดไปตอบต่อ"
                      : feedback?.type === "correct"
                        ? "เลือกคนที่ตอบถูกเพื่อรับคะแนน"
                        : "กดเพื่อไปข้อถัดไป"
                    : "กดปุ่มต่อไปเพื่อไปข้อถัดไป"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <div className="text-base font-semibold text-slate-950 dark:text-slate-50">{feedback.message}</div>
                <div className="rounded-2xl border border-slate-200 bg-slate-100 p-3 text-sm font-semibold text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-50">
                  🎵 OP: {currentAnime.note}
                </div>

                {isGroupMode && feedback?.type === "wrong" ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40">
                    <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50 mb-2">ใครตอบผิด?</div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {(groupPlayers || []).map((p) => {
                        const hp = typeof p?.hp === "number" ? p.hp : 10;
                        const eliminated = hp <= 0;
                        const picked = String(groupWrongPickId || "") === String(p?.id || "");

                        return (
                          <button
                            key={p.id}
                            type="button"
                            disabled={eliminated}
                            onClick={() => {
                              if (eliminated) return;
                              setGroupWrongPickId(String(p?.id || ""));
                            }}
                            className={`flex items-center justify-between gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition-colors ${
                              eliminated
                                ? "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-500"
                                : picked
                                  ? "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-200"
                                  : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-50 dark:hover:bg-slate-900/40"
                            }`}
                          >
                            <span className="truncate">{p.name || "ผู้เล่น"}</span>
                            <span className="flex-shrink-0">{eliminated ? "ตกรอบ" : picked ? "✅" : "⬜"}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">ระบบจะลดคะแนนของคนที่เลือกลง 1 แล้วให้คนถัดไปตอบต่อ</div>
                  </div>
                ) : null}

                {isGroupMode && feedback?.type === "correct" ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40">
                    <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50 mb-2">ใครตอบถูก?</div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {(groupPlayers || []).map((p) => {
                        const hp = typeof p?.hp === "number" ? p.hp : 10;
                        const eliminated = hp <= 0;
                        const picked = String(groupCorrectPickId || "") === String(p?.id || "");

                        return (
                          <button
                            key={p.id}
                            type="button"
                            disabled={eliminated}
                            onClick={() => {
                              if (eliminated) return;
                              setGroupCorrectPickId(String(p?.id || ""));
                            }}
                            className={`flex items-center justify-between gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition-colors ${
                              eliminated
                                ? "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-500"
                                : picked
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-200"
                                  : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-50 dark:hover:bg-slate-900/40"
                            }`}
                          >
                            <span className="truncate">{p.name || "ผู้เล่น"}</span>
                            <span className="flex-shrink-0">{eliminated ? "ตกรอบ" : picked ? "✅" : "⬜"}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">ระบบจะเพิ่มคะแนนของคนที่เลือกขึ้น 1 แล้วไปข้อต่อไป</div>
                  </div>
                ) : null}

                <Button
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl"
                  onClick={() => {
                    if (isGroupMode) {
                      if (feedback?.type === "wrong") {
                        const picked = String(groupWrongPickId || "").trim();
                        if (!picked) return;

                        setGroupPlayers((prev) =>
                          (prev || []).map((p) => {
                            if (String(p?.id || "") !== picked) return p;
                            const currScore = typeof p?.score === "number" ? p.score : 0;
                            return { ...p, score: Math.max(0, currScore - 1) };
                          })
                        );

                        const idx = (groupPlayers || []).findIndex((p) => String(p?.id || "") === picked);
                        const nextTurn = getGroupNextTurnIndex(groupPlayers, idx >= 0 ? idx : groupTurnSafe);
                        setGroupTurnIndex(nextTurn);
                        setAnswer("");
                        setShowHint(false);
                        setFeedback(null);
                        return;
                      }

                      if (feedback?.type === "correct") {
                        const picked = String(groupCorrectPickId || "").trim();
                        if (!picked) return;

                        setGroupPlayers((prev) =>
                          (prev || []).map((p) => {
                            if (String(p?.id || "") !== picked) return p;
                            const currScore = typeof p?.score === "number" ? p.score : 0;
                            return { ...p, score: Math.max(0, currScore + 1), mult: 1 };
                          })
                        );

                        const idx = (groupPlayers || []).findIndex((p) => String(p?.id || "") === picked);
                        const nextTurn = getGroupNextTurnIndex(groupPlayers, idx >= 0 ? idx : groupTurnSafe);
                        setGroupTurnIndex(nextTurn);
                        setGroupCorrectPickId("");
                        setGroupWrongPickId("");
                        goNext();
                        return;
                      }

                      // correct/skip -> advance to next question
                      const nextTurn = getGroupNextTurnIndex(groupPlayers, groupTurnSafe);
                      setGroupTurnIndex(nextTurn);
                      setGroupWrongPickId("");
                      setGroupCorrectPickId("");
                      goNext();
                      return;
                    }
                    if (isSoloChallenge && soloHp <= 0) {
                      setPage("result");
                      return;
                    }
                    goNext();
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isGroupMode
                    ? feedback?.type === "wrong"
                      ? "ยืนยันคนที่ตอบผิด"
                      : feedback?.type === "correct"
                        ? "ยืนยันคนที่ตอบถูก"
                        : "ไปข้อต่อไป"
                    : isSoloChallenge && soloHp <= 0
                      ? "ดูผลลัพธ์"
                      : "ไปข้อต่อไป"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
      </>
    );
  };

  const renderResult = () => {
    const isNormal = isNormalPlay;
    const percentage = isNormal ? Math.round((score / gameList.length) * 100) : 0;

    const qStats = Array.isArray(runQuestionStats) ? runQuestionStats : [];
    const totalQs = qStats.length;
    const correctQs = qStats.filter((x) => x?.outcome === "correct").length;
    const wrongQs = qStats.filter((x) => x?.outcome === "wrong").length;
    const skipQs = qStats.filter((x) => x?.outcome === "skip").length;
    const avgMs = totalQs
      ? Math.round(qStats.reduce((sum, x) => sum + (Number(x?.ms || 0) || 0), 0) / totalQs)
      : 0;

    const topGenres = (() => {
      const map = {};
      for (const x of qStats) {
        const g = String(x?.genre || "");
        if (!g) continue;
        map[g] = (Number(map[g] || 0) || 0) + 1;
      }
      return Object.entries(map)
        .sort((a, b) => (b[1] || 0) - (a[1] || 0))
        .slice(0, 5);
    })();

    const groupSorted = isGroupMode
      ? (groupPlayers || [])
          .slice()
          .sort((a, b) => {
            const sa = typeof a?.score === "number" ? a.score : 0;
            const sb = typeof b?.score === "number" ? b.score : 0;
            if (sb !== sa) return sb - sa;
            const ha = typeof a?.hp === "number" ? a.hp : 0;
            const hb = typeof b?.hp === "number" ? b.hp : 0;
            return hb - ha;
          })
      : [];

    const groupAlive = isGroupMode ? groupSorted.filter((p) => (typeof p?.hp === "number" ? p.hp : 0) > 0) : [];
    const groupWinner = isGroupMode
      ? groupAlive.length === 1
        ? groupAlive[0]
        : groupSorted[0] || null
      : null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <Card className="rounded-3xl border border-white/70 bg-white/85 shadow-[0_28px_56px_rgba(19,34,76,0.18)] backdrop-blur-xl overflow-hidden dark:border-slate-700/40 dark:bg-slate-950/55 dark:shadow-[0_28px_56px_rgba(0,0,0,0.35)]">
          <CardHeader className="space-y-2">
            <CardTitle className="font-display text-3xl">🏁 สรุปผล</CardTitle>
            <CardDescription>
              {sessionMode === "daily" && sessionDailyKey
                ? `Daily Challenge • ${sessionDailyKey}`
                : isGroupMode
                  ? "โหมดเล่นกลุ่ม"
                  : isSoloChallenge
                    ? "Solo Challenge"
                    : isTimeAttack
                      ? "จับเวลา 3 นาที"
                    : "โหมดปกติ"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3"
            >
              {isGroupMode ? (
                <>
                  <StatCard label="🎮 โหมด" value="เล่นกลุ่ม" />
                  <StatCard label="🏁 ผู้ชนะ" value={groupWinner?.name || "-"} />
                  <StatCard label="🧩 เล่นไป" value={`${gameList.length}`} />
                  <StatCard label="⏱️ เวลาเล่น" value={formatPlayElapsedThai(playElapsedMs)} />
                </>
              ) : isSoloChallenge ? (
                <>
                  <StatCard label="✅ ตอบถูก" value={`${score}`} />
                  <StatCard label="❤️ HP" value={`${soloHp}`} />
                  <StatCard label="🧩 เล่นไป" value={`${gameList.length}`} />
                  <StatCard label="⏱️ เวลาเล่น" value={formatPlayElapsedThai(playElapsedMs)} />
                </>
              ) : isTimeAttack ? (
                <>
                  <StatCard label="✅ ตอบถูก" value={`${score}`} />
                  <StatCard label="🧩 เล่นไป" value={`${gameList.length}`} />
                  <StatCard label="⏱️ เวลาเล่น" value={formatPlayElapsedThai(playElapsedMs)} />
                  <StatCard label="⏳ จำกัดเวลา" value="3 นาที" />
                </>
              ) : (
                <>
                  <StatCard label="📊 คะแนน" value={`${score}/${gameList.length}`} />
                  <StatCard label="🎯 % ถูก" value={`${percentage}%`} />
                  <StatCard label="✅ ตอบถูก" value={`${score}`} />
                  <StatCard label="⏱️ เวลาเล่น" value={formatPlayElapsedThai(playElapsedMs)} />
                </>
              )}
            </motion.div>

            {isGroupMode ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-950/40"
              >
                <div className="font-semibold mb-3 text-slate-900 dark:text-slate-100">สรุปคะแนนผู้เล่น</div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {groupSorted.map((p) => {
                    const hp = typeof p?.hp === "number" ? p.hp : 0;
                    const ps = typeof p?.score === "number" ? p.score : 0;
                    const eliminated = hp <= 0;
                    return (
                      <div
                        key={p.id}
                        className={`rounded-2xl border bg-white p-4 text-sm font-semibold dark:bg-slate-950/30 ${
                          eliminated
                            ? "border-rose-200 text-rose-900 dark:border-rose-400/30 dark:text-rose-200"
                            : "border-slate-200 text-slate-900 dark:border-slate-700 dark:text-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="truncate">{p.name || "ผู้เล่น"}</div>
                          <Badge className="rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0">⭐ {ps}</Badge>
                        </div>
                        <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">HP: {hp}{eliminated ? " • ตกรอบ" : ""}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-300">หมายเหตุ: โหมดกลุ่มจะไม่สะสมคะแนนเข้า account</div>
              </motion.div>
            ) : null}

            {!isGroupMode ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
                className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-950/40"
              >
                <div className="font-semibold mb-3 text-slate-900 dark:text-slate-100">📈 สถิติรอบนี้</div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <StatCard label="🔥 Max streak" value={`${runMaxStreak}`} />
                  <StatCard label="⏱️ เฉลี่ย/ข้อ" value={avgMs ? `${Math.max(1, Math.round(avgMs / 100)) / 10} วิ` : "-"} />
                  <StatCard label="✅ ถูก" value={`${correctQs}`} />
                  <StatCard label="❌ ผิด/ข้าม" value={`${wrongQs + skipQs}`} />
                </div>
                {topGenres.length ? (
                  <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                    แนวที่เจอบ่อย: {topGenres.map(([g, c]) => `${genreConfig[g]?.label || g} (${c})`).join(" • ")}
                  </div>
                ) : null}
              </motion.div>
            ) : null}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-950/40"
            >
              <div className="font-semibold mb-3 text-slate-900 dark:text-slate-100 flex items-center gap-2">📺 เรื่องที่ใช้ในรอบนี้ ({gameList.length})</div>
              <div className="flex flex-wrap gap-2">
                {gameList.map((anime, idx) => (
                  <motion.div
                    key={anime.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.05 }}
                  >
                    <Badge className="rounded-full bg-gradient-to-r from-slate-700 to-slate-800 text-white border-0 px-3 py-1 font-semibold">
                      {anime.title}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-3 flex-wrap justify-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl px-6" onClick={restartSession}>🔄 เล่นใหม่</Button>
              </motion.div>
              {!isGroupMode ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    className="rounded-2xl border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 font-semibold dark:border-slate-700 dark:hover:bg-slate-900/60 dark:hover:border-cyan-400/40"
                    onClick={shareResultAsImage}
                    disabled={!gameList.length}
                  >
                    📸 แชร์เป็นรูป
                  </Button>
                </motion.div>
              ) : null}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="rounded-2xl border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 font-semibold dark:border-slate-700 dark:hover:bg-slate-900/60 dark:hover:border-cyan-400/40" onClick={() => setPage("library")}>📚 ดูรายชื่อทั้งหมด</Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="rounded-2xl border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 font-semibold dark:border-slate-700 dark:hover:bg-slate-900/60 dark:hover:border-cyan-400/40" onClick={resetAll}>🏠 กลับหน้าแรก</Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const shouldShowHomeVideoBg = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (reduceMotion) return false;

      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;

      if (connection?.saveData) return false;

      const effectiveType = connection?.effectiveType;
      if (effectiveType === "slow-2g" || effectiveType === "2g") return false;
    } catch {
      // If the browser blocks these APIs, fall back to showing the video.
    }
    return true;
  }, []);

  const shouldShowLibraryGifBg = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (reduceMotion) return false;

      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;

      if (connection?.saveData) return false;

      const effectiveType = connection?.effectiveType;
      if (effectiveType === "slow-2g" || effectiveType === "2g") return false;
    } catch {
      // If the browser blocks these APIs, fall back to showing the GIF.
    }
    return true;
  }, []);

  const canPlayLibraryMp4Bg = useMemo(() => {
    if (typeof document === "undefined") return false;
    try {
      const v = document.createElement("video");
      if (!v?.canPlayType) return false;
      return Boolean(v.canPlayType("video/mp4"));
    } catch {
      return false;
    }
  }, []);

  const [libraryBgVideoFailed, setLibraryBgVideoFailed] = useState(false);
  const libraryGifUrl1 = String(import.meta?.env?.VITE_LIBRARY_BG_GIF1 || "").trim();
  const libraryGifUrl2 = String(import.meta?.env?.VITE_LIBRARY_BG_GIF2 || "").trim();
  useEffect(() => {
    if (page !== "library") return;
    setLibraryBgVideoFailed(false);
  }, [page, libraryTab]);

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-slate-900 dark:text-slate-100 p-4 md:p-8">
      {page === "library" && shouldShowLibraryGifBg ? (
        canPlayLibraryMp4Bg && !libraryBgVideoFailed ? (
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
            <video
              key="librarybg"
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onError={() => setLibraryBgVideoFailed(true)}
            >
              <source src="/libarry2.mp4" type="video/mp4" />
            </video>
          </div>
        ) : (
          <div
            className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: (() => {
                const url = libraryTab === "legal" ? libraryGifUrl2 : libraryGifUrl1;
                return url ? `url(${url})` : "";
              })()
            }}
            aria-hidden="true"
          />
        )
      ) : null}
      {page === "home" && shouldShowHomeVideoBg ? (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          >
            <source src="/bg.mp4" type="video/mp4" />
          </video>
        </div>
      ) : null}
      {page === "library" ? (
        <div className="pointer-events-none absolute inset-0 z-10 opacity-35">
          <div className="absolute -top-24 -left-10 h-72 w-72 rounded-full bg-rose-300/35 dark:bg-cyan-500/15 blur-3xl" />
          <div className="absolute top-24 -right-10 h-72 w-72 rounded-full bg-blue-300/30 dark:bg-sky-500/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-200/30 dark:bg-blue-500/10 blur-3xl" />
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-0 z-10 opacity-80">
          <div className="absolute -top-24 -left-10 h-72 w-72 rounded-full bg-rose-300/35 dark:bg-cyan-500/15 blur-3xl" />
          <div className="absolute top-24 -right-10 h-72 w-72 rounded-full bg-blue-300/30 dark:bg-sky-500/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-200/30 dark:bg-blue-500/10 blur-3xl" />
        </div>
      )}

      <div className="relative z-20">

      <div className="sticky top-0 z-50 -mx-4 md:-mx-8 mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="backdrop-blur-xl bg-white/75 dark:bg-slate-900/75 border-b border-white/50 dark:border-slate-700/30 shadow-[0_8px_24px_rgba(26,37,80,0.1)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="drop-shadow-lg"
                >
                  <img
                    src="/iconweb-v2.jpg"
                    alt="OtoVerse"
                    className="h-12 w-12 md:h-14 md:w-14 rounded-2xl object-cover border border-white/50 dark:border-slate-700/40"
                    draggable={false}
                  />
                </motion.div>
                <div>
                  <h1 className="font-display text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 dark:from-cyan-300 dark:to-blue-400 bg-clip-text text-transparent leading-snug">OtoVerse</h1>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-cyan-300/70 hidden sm:block">ทายเพลง anime ยอดนิยม</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex gap-2 flex-shrink-0"
            >
              {user &&
                [
                  {
                    key: "home",
                    label: " หน้าหลัก",
                    isActive: page === "home",
                    onClick: () => confirmLeaveGame(() => setPage("home"))
                  },
                  {
                    key: "library",
                    label: " คลังเพลง",
                    isActive: page === "library" && libraryTab === "catalog",
                    onClick: () =>
                      confirmLeaveGame(() => {
                        setPage("library");
                        setLibraryTab("catalog");
                      })
                  },
                  {
                    key: "library-music",
                    label: "ช่องทางดู/ฟัง",
                    isActive: page === "library" && libraryTab === "legal",
                    onClick: () =>
                      confirmLeaveGame(() => {
                        setPage("library");
                        setLibraryTab("legal");
                      })
                  }
                ].map((tab) => (
                  <motion.div key={tab.key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant={tab.isActive ? "default" : "ghost"}
                      className={`rounded-2xl font-semibold transition-all ${
                        tab.isActive
                          ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg hover:shadow-xl"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                      onClick={tab.onClick}
                    >
                      {tab.label}
                    </Button>
                  </motion.div>
                ))}

              {firebaseReady ? (
                user ? (
                  <>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-semibold"
                        onClick={() => setProfileOpen(true)}
                        title={user.email || ""}
                      >
                        <span className="inline-flex items-center gap-2">
                          <span className="h-7 w-7 rounded-xl border border-slate-200 bg-white/70 overflow-hidden flex items-center justify-center dark:border-slate-700 dark:bg-slate-950/30">
                            {headerAvatarUrl ? (
                              <img src={headerAvatarUrl} alt="รูปโปรไฟล์" className="h-full w-full object-cover" draggable={false} />
                            ) : (
                              <span aria-hidden>👤</span>
                            )}
                          </span>
                          <span>โปรไฟล์</span>
                        </span>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-semibold"
                        onClick={handleLogout}
                      >
                        ออกจากระบบ
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-semibold"
                      onClick={() => {
                        setAuthError("");
                        setAuthOpen(true);
                      }}
                    >
                      เข้าสู่ระบบ
                    </Button>
                  </motion.div>
                )
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-semibold"
                    disabled
                    title="ตั้งค่า Firebase ก่อน (ดูไฟล์ .env.example)"
                  >
                    เข้าสู่ระบบ
                  </Button>
                </motion.div>
              )}

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={page === "about" ? "default" : "outline"}
                  className={`rounded-2xl font-semibold ${
                    page === "about"
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg hover:shadow-xl"
                      : "border-2 border-slate-200 dark:border-slate-700"
                  }`}
                  onClick={() => confirmLeaveGame(() => setPage("about"))}
                  title="เกี่ยวกับเรา"
                >
                  <Info className="w-4 h-4 mr-2" />
                  เกี่ยวกับเรา
                </Button>
              </motion.div>

              {/* (removed) GIF background upload UI */}
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="relative max-w-7xl mx-auto space-y-6">
        {loginGateState !== "ok" && page !== "about" ? (
          <Card className="rounded-3xl border-2 border-slate-200 bg-white/80 backdrop-blur shadow-xl dark:border-slate-700 dark:bg-slate-950/40">
            <CardContent className="p-8">
              {loginGateState === "firebase" ? (
                <>
                  <div className="text-2xl font-black text-slate-950 dark:text-white">ยังไม่ได้ตั้งค่า Firebase</div>
                  <div className="mt-2 text-slate-700 dark:text-slate-200">ต้องตั้งค่าไฟล์ .env ตาม .env.example ก่อนจึงจะเข้าสู่ระบบได้</div>
                </>
              ) : loginGateState === "checking" ? (
                <>
                  <div className="text-2xl font-black text-slate-950 dark:text-white">กำลังตรวจสอบสถานะบัญชี...</div>
                  <div className="mt-2 text-slate-700 dark:text-slate-200">รอสักครู่</div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-black text-slate-950 dark:text-white">ต้องเข้าสู่ระบบก่อนใช้งาน</div>
                  <div className="mt-2 text-slate-700 dark:text-slate-200">กรุณาเข้าสู่ระบบเพื่อเริ่มเล่นเกมและเข้าถึงคลังเพลง</div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button
                      className="rounded-2xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg hover:shadow-xl"
                      onClick={() => {
                        setAuthError("");
                        setAuthOpen(true);
                      }}
                    >
                      เข้าสู่ระบบ / สมัครสมาชิก
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {page === "home" && renderHome()}
            {page === "library" && renderLibrary()}
            {page === "community" && renderCommunity()}
            {page === "online" && renderOnline()}
            {page === "play" && renderPlay()}
            {page === "result" && renderResult()}
            {page === "about" && renderAbout()}
          </>
        )}
      </div>

      {authOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            aria-label="ปิดหน้าต่างล็อกอิน"
            onClick={() => setAuthOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg"
          >
            <Card className="rounded-3xl border-2 border-slate-200 bg-white text-slate-950 shadow-2xl overflow-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50">
              <CardHeader className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="font-display text-2xl">🔐 บัญชีผู้ใช้</CardTitle>
                    <CardDescription className="text-slate-800 dark:text-slate-200">
                      สมัครผ่านเว็บ หรือเข้าสู่ระบบด้วย Google/GitHub
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl"
                    onClick={() => setAuthOpen(false)}
                    title="ปิด"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {!firebaseReady ? (
                  <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-900 dark:border-cyan-400/35 dark:bg-slate-900/40 dark:text-slate-100">
                    ยังไม่ได้ตั้งค่า Firebase — ให้สร้างไฟล์ <span className="font-extrabold">.env</span> ตามตัวอย่างใน <span className="font-extrabold">.env.example</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={authMode === "signin" ? "default" : "outline"}
                        className="rounded-2xl font-semibold"
                        onClick={() => {
                          setAuthError("");
                          setAuthMode("signin");
                        }}
                      >
                        เข้าสู่ระบบ
                      </Button>
                      <Button
                        type="button"
                        variant={authMode === "signup" ? "default" : "outline"}
                        className="rounded-2xl font-semibold"
                        onClick={() => {
                          setAuthError("");
                          setAuthMode("signup");
                        }}
                      >
                        สมัครสมาชิก
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="อีเมล"
                        className="rounded-2xl h-12"
                        disabled={authBusy}
                      />
                      <Input
                        type="password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="รหัสผ่าน"
                        className="rounded-2xl h-12"
                        disabled={authBusy}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEmailAuth();
                        }}
                      />
                    </div>

                    {authError && (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-900 dark:border-rose-400/40 dark:bg-slate-900/40 dark:text-rose-100">
                        {authError}
                      </div>
                    )}

                    <Button
                      type="button"
                      className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl"
                      onClick={handleEmailAuth}
                      disabled={authBusy || !authEmail.trim() || !authPassword}
                    >
                      {authMode === "signup" ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
                    </Button>

                    <div className="text-center text-xs font-semibold text-slate-600 dark:text-slate-300">หรือ</div>

                    <div className="grid gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl font-semibold"
                        onClick={() => handleOAuth("google")}
                        disabled={authBusy}
                      >
                        เข้าสู่ระบบด้วย Google
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl font-semibold"
                        onClick={() => handleOAuth("github")}
                        disabled={authBusy}
                      >
                        เข้าสู่ระบบด้วย GitHub
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {profileOpen && user && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            aria-label="ปิดโปรไฟล์"
            onClick={() => setProfileOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl"
          >
            <Card className="rounded-3xl border-2 border-slate-200 bg-white text-slate-950 shadow-2xl overflow-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50">
              <CardHeader className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="font-display text-2xl">👤 โปรไฟล์</CardTitle>
                    <CardDescription className="text-slate-800 dark:text-slate-200">
                      เก็บสถิติและค่าพื้นฐานตามบัญชี
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl"
                    onClick={() => setProfileOpen(false)}
                    title="ปิด"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-50">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl border border-slate-200 bg-white/70 overflow-hidden flex items-center justify-center dark:border-slate-700 dark:bg-slate-950/30">
                      {headerAvatarUrl ? (
                        <img
                          key={headerAvatarUrl}
                          src={headerAvatarUrl}
                          alt="รูปโปรไฟล์"
                          className="h-full w-full object-cover"
                          draggable={false}
                        />
                      ) : (
                        <div className="text-xl">👤</div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div>อีเมล: {user.email || "-"}</div>
                      <div>ชื่อ: {user.displayName || "-"}</div>
                      <div className="pt-2">
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">ชื่อเล่น (แสดงในอันดับ/โปรไฟล์สาธารณะ)</div>
                        <Input
                          value={nicknameDraft}
                          onChange={(e) => setNicknameDraft(String(e.target.value || "").slice(0, 14))}
                          maxLength={14}
                          placeholder="ตั้งชื่อเล่น"
                          className="mt-2 rounded-2xl h-11"
                        />
                        <div className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-300/80">ยาวได้ไม่เกิน 14 ตัวอักษร</div>
                      </div>
                      <div className="pt-2">
                        <input
                          key={avatarInputKey}
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          disabled={avatarBusy}
                          onClick={(e) => {
                            try {
                              e.currentTarget.value = "";
                            } catch {
                              // ignore
                            }
                          }}
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            try {
                              e.currentTarget.value = "";
                            } catch {
                              // ignore
                            }
                            handleAvatarFile(file);
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl font-semibold"
                          disabled={avatarBusy}
                          onClick={() => avatarInputRef.current?.click()}
                        >
                          {avatarBusy ? "กำลังอัปโหลด..." : "อัปโหลดรูปโปรไฟล์"}
                        </Button>
                        {avatarError && <div className="mt-2 text-xs font-semibold text-rose-700 dark:text-rose-300">{avatarError}</div>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-50">
                    สมัครเมื่อ: {formatProfileDate(profile?.createdAt)}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-50">
                    จำนวนการเล่น: {typeof profile?.playCount === "number" ? profile.playCount : 0}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-50">
                    คะแนนสะสม: {typeof profile?.totalScore === "number" ? profile.totalScore : 0}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-50">
                    สถิติ “ตอบถูกติดต่อกัน (สูงสุด)”: {typeof profile?.bestStreak === "number" ? profile.bestStreak : 0}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl font-semibold"
                  onClick={() => openFavoritesPopup({ label: "⭐ เรื่องโปรดของฉัน", ids: favoriteIds })}
                >
                  ⭐ เรื่องโปรด ({Array.isArray(favoriteIds) ? favoriteIds.length : 0})
                </Button>

                <div className="space-y-3">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50">ตั้งค่าพื้นฐาน</div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">โหมดคำตอบเริ่มต้น</div>
                      <select
                        value={answerMode}
                        onChange={(e) => setAnswerMode(e.target.value)}
                        className="h-12 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-50"
                      >
                        {Object.entries(answerModeConfig).map(([key, cfg]) => (
                          <option key={key} value={key}>
                            {cfg.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">จำนวนข้อเริ่มต้น</div>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={questionCount}
                        onChange={(e) => setQuestionCount(Number(e.target.value) || 1)}
                        className="rounded-2xl h-12"
                      />
                    </div>
                  </div>
                </div>

                {profileNotice && (
                  <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{profileNotice}</div>
                )}

                {profileMissing && !profileError ? (
                  <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-900 dark:border-cyan-400/35 dark:bg-slate-900/40 dark:text-slate-100">
                    ยังไม่พบข้อมูลโปรไฟล์ใน Firestore — ทำให้จำนวนการเล่น/คะแนนสะสมไม่อัปเดต
                    <div className="mt-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl font-semibold"
                        onClick={repairProfile}
                        disabled={profileFixBusy}
                      >
                        {profileFixBusy ? "กำลังสร้าง/ซ่อม..." : "สร้าง/ซ่อมโปรไฟล์"}
                      </Button>
                    </div>
                  </div>
                ) : null}

                {profileError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-900 dark:border-rose-400/40 dark:bg-slate-900/40 dark:text-rose-100">
                    โหลดโปรไฟล์จาก Firestore ไม่สำเร็จ ({profileError}) — สถิติ/คะแนนอาจไม่อัปเดต
                    {String(profileError).toLowerCase().includes("unavailable") ? (
                      <div className="mt-2 text-xs font-semibold text-rose-800 dark:text-rose-200/90">
                        มักเกิดจากเน็ต/ไฟร์วอลล์/ส่วนขยายบล็อก `firestore.googleapis.com` หรือยังไม่ได้เปิดใช้งาน Firestore ใน Firebase Console
                      </div>
                    ) : null}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-2">
                  <Button
                    type="button"
                    className="rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl"
                    onClick={saveProfileSettings}
                    disabled={!user?.uid || profileSaveBusy}
                  >
                    {profileSaveBusy ? "กำลังบันทึก..." : "บันทึกค่า"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl font-semibold"
                    onClick={handleLogout}
                  >
                    ออกจากระบบ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {publicProfileOpen && user && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            aria-label="ปิดโปรไฟล์ผู้เล่น"
            onClick={() => setPublicProfileOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl"
          >
            <Card className="rounded-3xl border-2 border-slate-200 bg-white text-slate-950 shadow-2xl overflow-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50">
              <CardHeader className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="font-display text-2xl">🪪 โปรไฟล์ผู้เล่น</CardTitle>
                    <CardDescription className="text-slate-800 dark:text-slate-200">ดูสถิติและติดตามกันได้</CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl"
                    onClick={() => setPublicProfileOpen(false)}
                    title="ปิด"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {publicProfileError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-900 dark:border-rose-400/40 dark:bg-slate-900/40 dark:text-rose-100">
                    โหลดโปรไฟล์ไม่สำเร็จ ({publicProfileError})
                  </div>
                ) : null}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-2xl border border-slate-200 bg-white/70 overflow-hidden flex items-center justify-center flex-shrink-0 dark:border-slate-700 dark:bg-slate-950/30">
                      {String(publicProfile?.photoURL || "").trim() ? (
                        <img src={publicProfile.photoURL} alt="" className="h-full w-full object-cover" draggable={false} />
                      ) : (
                        <div className="text-xl">👤</div>
                      )}
                      {(() => {
                        const on = isProbablyOnline(publicProfile);
                        return (
                          <span
                            aria-label={on ? "ออนไลน์" : "ออฟไลน์"}
                            title={on ? "ออนไลน์" : "ออฟไลน์"}
                            className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-950 ${
                              on ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                        );
                      })()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-black truncate">
                        {String(publicProfile?.nickname || "").trim() || String(publicProfile?.displayName || "").trim() || "ผู้เล่น"}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        ผู้ติดตาม: {publicProfileFollowers == null ? "…" : publicProfileFollowers}
                        {Array.isArray(publicProfile?.following) ? ` • กำลังติดตาม: ${publicProfile.following.length}` : ""}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        สถานะ: {isProbablyOnline(publicProfile) ? "ออนไลน์" : "ออฟไลน์"}
                        {publicProfile?.lastSeenAt ? ` • ล่าสุด: ${formatTs(publicProfile.lastSeenAt)}` : ""}
                      </div>
                    </div>
                    {user.uid !== publicProfileUid ? (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl font-semibold"
                          onClick={() =>
                            openChatWithUid(publicProfileUid, {
                              nickname: publicProfile?.nickname || publicProfile?.displayName || "",
                              photoURL: publicProfile?.photoURL || ""
                            })
                          }
                          disabled={!publicProfileUid}
                          title="แชทส่วนตัว"
                        >
                          แชท
                        </Button>
                        <Button
                          type="button"
                          className="rounded-2xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg hover:shadow-xl"
                          onClick={toggleFollowPublicProfile}
                          disabled={publicProfileBusy || !publicProfileUid}
                        >
                          {publicProfileBusy ? "กำลังทำรายการ..." : publicIsFollowing ? "เลิกติดตาม" : "ติดตาม"}
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="outline" className="rounded-full">นี่คือคุณ</Badge>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-50">
                    จำนวนการเล่น: {typeof publicProfile?.playCount === "number" ? publicProfile.playCount : 0}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-50">
                    สถิติ “ตอบถูกติดต่อกัน (สูงสุด)”: {typeof publicProfile?.bestStreak === "number" ? publicProfile.bestStreak : 0}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-50">
                    คะแนนสะสม: {typeof publicProfile?.totalScore === "number" ? publicProfile.totalScore : 0}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl font-semibold"
                  onClick={() =>
                    openFavoritesPopup({
                      label: `⭐ เรื่องโปรดของ ${String(publicProfile?.nickname || publicProfile?.displayName || "ผู้เล่น").trim() || "ผู้เล่น"}`,
                      ids: Array.isArray(publicProfile?.publicFavorites) ? publicProfile.publicFavorites : []
                    })
                  }
                  disabled={Boolean(publicProfileError)}
                >
                  ⭐ เรื่องโปรด ({Array.isArray(publicProfile?.publicFavorites) ? publicProfile.publicFavorites.length : 0})
                </Button>

                {publicProfileNotice ? (
                  <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{publicProfileNotice}</div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {favoritesPopupOpen && user && (
        <div className="fixed inset-0 z-[115] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            aria-label="ปิดรายการเรื่องโปรด"
            onClick={() => setFavoritesPopupOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-2xl"
            role="dialog"
            aria-modal="true"
          >
            <Card className="rounded-3xl border-2 border-slate-200 bg-white text-slate-950 shadow-2xl overflow-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50">
              <CardHeader className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="font-display text-2xl">{favoritesPopupLabel}</CardTitle>
                    <CardDescription className="text-slate-800 dark:text-slate-200">รายการเรื่องที่กด ⭐ ไว้</CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl"
                    onClick={() => setFavoritesPopupOpen(false)}
                    title="ปิด"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {!(favoritesPopupItems || []).length ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
                    ยังไม่มีเรื่องโปรด
                  </div>
                ) : (
                  <div className="max-h-[60vh] overflow-auto space-y-2 pr-1">
                    {(favoritesPopupItems || []).map((a) => {
                      const id = Number(a?.id);
                      const title = String(a?.title || "").trim();
                      const img = getAnimeImageUrl(a);
                      return (
                        <div
                          key={Number.isFinite(id) ? id : `${title}_${Math.random().toString(16).slice(2)}`}
                          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/40"
                        >
                          <div className="h-12 w-12 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center flex-shrink-0 dark:border-slate-700 dark:bg-slate-900/40">
                            {img ? (
                              <SmartImage src={img} fallbackSrc="" alt={title || "anime"} className="h-full w-full object-cover" />
                            ) : (
                              <div className="text-lg">🎵</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-black text-slate-900 dark:text-slate-50 truncate">{title || "-"}</div>
                            {a?.note ? (
                              <div className="mt-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">{String(a.note)}</div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <Button type="button" variant="outline" className="rounded-2xl font-semibold" onClick={() => setFavoritesPopupOpen(false)}>
                  ปิด
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {chatOpen && user && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            aria-label="ปิดแชท"
            onClick={() => setChatOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-5xl"
          >
            <Card className="rounded-3xl border-2 border-slate-200 bg-white text-slate-950 shadow-2xl overflow-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50">
              <CardHeader className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="font-display text-2xl">💬 แชทส่วนตัว</CardTitle>
                    <CardDescription className="text-slate-800 dark:text-slate-200">คุยกันแบบส่วนตัว</CardDescription>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="rounded-2xl" onClick={() => setChatOpen(false)} title="ปิด">
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row h-[70vh]">
                  <div className="w-full sm:w-[320px] border-b sm:border-b-0 sm:border-r border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/35 flex flex-col">
                    <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="text-sm font-black">ข้อความ</div>
                      {chatThreadsError ? (
                        <div className="mt-1 text-xs font-semibold text-rose-700 dark:text-rose-300">โหลดรายการแชทไม่สำเร็จ ({chatThreadsError})</div>
                      ) : null}
                    </div>
                    <div className="flex-1 overflow-auto">
                      {chatThreadsLoading ? (
                        <div className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-300">กำลังโหลด...</div>
                      ) : null}
                      {!(chatThreads || []).length && !chatThreadsLoading ? (
                        <div className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-300">ยังไม่มีแชท</div>
                      ) : null}
                      {(chatThreads || []).map((t) => {
                        const participants = Array.isArray(t?.participants) ? t.participants : [];
                        const otherUid = participants.find((p) => String(p) !== String(user.uid)) || "";
                        const meta = t?.meta && otherUid ? t.meta[otherUid] : null;
                        const name =
                          String(meta?.nickname || "").trim() ||
                          (otherUid ? `uid:${String(otherUid).slice(0, 6)}…` : "ผู้เล่น");
                        const photo = String(meta?.photoURL || "").trim();
                        const preview = String(t?.lastMessageText || "").trim();
                        const when = t?.lastMessageAt || t?.updatedAt || t?.createdAt;
                        const selected = String(t?.id) === String(chatId);
                        const isUnread = Boolean(chatUnreadById?.[String(t?.id || "")]);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            className={`w-full text-left p-3 border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors ${
                              selected ? "bg-slate-50 dark:bg-slate-950/60" : ""
                            }`}
                            onClick={() => {
                              setChatError("");
                              setChatDraft("");
                              setChatMessages([]);
                              setChatTargetUid(String(otherUid || ""));
                              setChatId(String(t.id));
                              const ms = tsToMs(t?.lastMessageAt) || Date.now();
                              markChatRead(String(t.id), ms);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-2xl border border-slate-200 bg-white/80 overflow-hidden flex items-center justify-center flex-shrink-0 dark:border-slate-700 dark:bg-slate-950/30">
                                {photo ? <img src={photo} alt="" className="h-full w-full object-cover" draggable={false} /> : <div className="text-sm">👤</div>}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-black truncate">{name}</div>
                                <div className="mt-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">{preview || "—"}</div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {isUnread ? <span className="h-2.5 w-2.5 rounded-full bg-rose-500" aria-label="ยังไม่อ่าน" title="ยังไม่อ่าน" /> : null}
                                <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-300/70">{when ? formatTs(when) : ""}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    {chatError ? (
                      <div className="m-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-900 dark:border-rose-400/40 dark:bg-slate-900/40 dark:text-rose-100">
                        {firestoreErrorToThai(chatError)} ({String(chatError)})
                      </div>
                    ) : null}

                    {!chatId ? (
                      <div className="flex-1 flex items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                        เลือกแชททางซ้าย
                      </div>
                    ) : (
                      <>
                        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                          <div className="text-sm font-black truncate">
                            กำลังคุยกับ:{" "}
                            {(() => {
                              const active = (chatThreads || []).find((x) => String(x?.id) === String(chatId));
                              const participants = Array.isArray(active?.participants) ? active.participants : [];
                              const otherUid = participants.find((p) => String(p) !== String(user.uid)) || chatTargetUid || "";
                              const meta = active?.meta && otherUid ? active.meta[otherUid] : null;
                              const name = String(meta?.nickname || "").trim();
                              if (name) return name;
                              if (otherUid) return `uid:${String(otherUid).slice(0, 8)}…`;
                              return "ผู้เล่น";
                            })()}
                          </div>
                        </div>

                        <div className="flex-1 overflow-auto p-3 space-y-2 bg-white/60 dark:bg-slate-950/25">
                          {chatLoading ? <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">กำลังโหลด...</div> : null}
                          {(chatMessages || []).map((m) => {
                            const mine = String(m?.fromUid || "") === String(user.uid);
                            return (
                              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                                <div
                                  className={`max-w-[85%] rounded-2xl border px-3 py-2 text-sm font-semibold whitespace-pre-wrap break-words ${
                                    mine
                                      ? "border-cyan-200 bg-cyan-50 text-slate-900 dark:border-cyan-400/30 dark:bg-slate-900/40 dark:text-slate-50"
                                      : "border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950/30 dark:text-slate-50"
                                  }`}
                                >
                                  {!mine ? (
                                    <div className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300/80">
                                      {String(m?.fromNickname || "").trim() || "ผู้เล่น"}
                                    </div>
                                  ) : null}
                                  <div>{String(m?.body || "")}</div>
                                  <div className="mt-1 text-[10px] font-semibold text-slate-500 dark:text-slate-300/70">{formatTs(m?.createdAt)}</div>
                                </div>
                              </div>
                            );
                          })}
                          {!chatLoading && !(chatMessages || []).length ? (
                            <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">ยังไม่มีข้อความ</div>
                          ) : null}
                        </div>

                        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                              value={chatDraft}
                              onChange={(e) => setChatDraft(e.target.value)}
                              placeholder="พิมพ์ข้อความ..."
                              className="rounded-2xl h-11"
                              maxLength={1000}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") submitChatMessage();
                              }}
                            />
                            <Button
                              type="button"
                              className="rounded-2xl font-semibold bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg hover:shadow-xl"
                              onClick={submitChatMessage}
                              disabled={chatBusy || !String(chatDraft || "").trim()}
                            >
                              {chatBusy ? "กำลังส่ง..." : "ส่ง"}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {user && chatNotif ? (
        <div className={`fixed ${page === "library" && libraryTab === "legal" ? "bottom-36" : "bottom-20"} right-4 z-[140] w-[min(420px,calc(100vw-2rem))]`}>
          <div className="rounded-3xl border-2 border-slate-200 bg-white/90 backdrop-blur shadow-2xl overflow-hidden dark:border-slate-700 dark:bg-slate-950/85">
            <div className="p-3 flex items-start gap-3">
              <div className="h-12 w-12 rounded-2xl border border-slate-200 bg-white/80 overflow-hidden flex items-center justify-center flex-shrink-0 dark:border-slate-700 dark:bg-slate-950/30">
                {chatNotif.photo ? (
                  <img src={chatNotif.photo} alt="" className="h-full w-full object-cover" draggable={false} />
                ) : (
                  <div className="text-lg">👤</div>
                )}
              </div>
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => {
                  openChatThread(chatNotif.thread);
                  setChatNotif(null);
                }}
                title="กดเพื่อเปิดแชท"
              >
                <div className="text-sm font-black truncate">ข้อความใหม่จาก {chatNotif.name}</div>
                <div className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">{chatNotif.text || "—"}</div>
                {chatNotif.when ? (
                  <div className="mt-1 text-[10px] font-semibold text-slate-500 dark:text-slate-300/70">{formatTs(chatNotif.when)}</div>
                ) : null}
              </button>
              <Button type="button" variant="ghost" size="icon" className="rounded-2xl" onClick={() => setChatNotif(null)} title="ปิด">
                ✕
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {user ? (
        <div className="fixed bottom-4 right-4 z-[139]">
          <Button
            type="button"
            className="rounded-2xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg hover:shadow-xl relative"
            onClick={openInbox}
            title="เปิดข้อความ"
          >
            💬 ข้อความ
            {chatUnreadCount > 0 ? (
              <span className="absolute -top-2 -right-2 min-w-6 h-6 px-2 rounded-full bg-rose-600 text-white text-xs font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-950">
                {chatUnreadCount}
              </span>
            ) : null}
          </Button>
        </div>
      ) : null}

      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="rounded-2xl border-2 border-slate-200 dark:border-indigo-500/40 bg-gradient-to-br from-white dark:from-indigo-900/40 via-slate-50 dark:via-slate-800/60 to-blue-50/40 dark:to-indigo-900/30 p-4 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_12px_rgba(15,23,42,0.08)] dark:shadow-[inset_0_1px_2px_rgba(165,180,252,0.15),0_4px_12px_rgba(0,0,0,0.4)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_8px_20px_rgba(59,130,246,0.12)] dark:hover:shadow-[inset_0_1px_2px_rgba(165,180,252,0.15),0_8px_20px_rgba(99,102,241,0.25)] transition-shadow">
        <div className="text-xs font-semibold text-slate-600 dark:text-indigo-300 tracking-wide uppercase">{label}</div>
        <div className="font-display text-3xl font-bold mt-2 bg-gradient-to-r from-slate-900 dark:from-indigo-200 to-slate-700 dark:to-blue-300 bg-clip-text text-transparent">{value}</div>
      </div>
    </motion.div>
  );
}
