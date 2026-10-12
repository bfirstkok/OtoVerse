export const GENRE_CONFIG = {
  adventure: { label: "ผจญภัย" }, supernatural: { label: "เหนือธรรมชาติ" },
  action: { label: "แอ็กชัน" }, fantasy: { label: "แฟนตาซี" },
  isekai: { label: "ต่างโลก" }, scifi: { label: "ไซไฟ" },
  sports: { label: "กีฬา" }, mystery: { label: "สืบสวน/จิตวิทยา" },
  romance: { label: "โรแมนซ์" }, comedy: { label: "คอมเมดี้" },
  music: { label: "ดนตรี/ไอดอล" }, mecha: { label: "หุ่นยนต์" },
  slice: { label: "ชีวิตประจำวัน" }, drama: { label: "ดราม่า" },
  historical: { label: "ประวัติศาสตร์" }, horror: { label: "สยองขวัญ" },
  other: { label: "อื่นๆ" }
};

// Editorial primary genres for series families, not keywords from their songs.
// A primary genre is a browsing aid; many shows combine several genres.
const SERIES = {
  historical: ['Ulysses: Jeanne', 'Vinland Saga', 'Golden Kamuy', 'Rurouni Kenshin', 'Orb: On the Movements of the Earth'],
  drama: ['Oshi no Ko', 'Charlotte', 'Kiznaiver', 'Violet Evergarden', 'Koe no Katachi', 'A Silent Voice', 'Anohana', 'Meiji x Kokosake', 'To Your Eternity', 'Fumetsu no Anata', 'Anne Shirley', 'Higehiro', 'Air', 'Summer Pockets', 'Wonder Egg Priority', 'Clannad', 'Angel Beats', 'Plastic Memories'],
  horror: ['Gakkou kurashi', 'Ajin Demi Human', 'Another', 'Higurashi', 'Highschool of the Dead', 'High school of the dead', 'Gakkou Gurashi', 'School Live', 'Shiki', 'Elfen Lied', 'Devilman', 'Ajin', 'Tokyo Ghoul'],
  mystery: ['Mirai Nikki', 'Kuroshitsuji', 'Black Butler', 'Death Note', 'Detective Conan', 'Case Closed', 'Monster', 'Hyouka', 'Erased', 'Boku dake ga Inai Machi', 'Yakusoku no Neverland', 'The Promised Neverland', 'Parasyte', 'Kakegurui', 'Kaiji', 'Gyakkyou Burai Kaiji', 'Danganronpa', 'Death Parade', 'Summer Time', 'Summertime', 'Kusuriya no Hitorigoto', 'The Apothecary Diaries', 'Ameku', 'Tasokare Hotel', 'Kamisama no memo', 'Tantei wa mou', 'Youkoso jitsuryoku', 'Classroom of the Elite', 'Grisaia', 'Tengoku Daimakyou'],
  mecha: ['86 Eighty Six', '86', 'Neon Genesis Evangelion', 'Evangelion', 'Code Geass', 'Mobile Suit Gundam', 'Gundam', 'Tengen Toppa Gurren Lagann', 'Gurren Lagann', 'Darling in the Franxx', 'Aldnoah', 'Infinite Stratos', 'Macross', 'Eureka Seven', 'Deca Dence'],
  music: ['Your Lie in April', 'Shigatsu wa Kimi no Uso', 'K On', 'Bocchi the Rock', 'Love Live', 'Beck', 'Nana', 'Nodame Cantabile', 'Carole', 'Given', 'Sakamichi no Apollon', 'Kids on the Slope', 'Symphogear', 'Senki Zesshou', 'Paripi', 'Ya Boy Kongming', 'Zombieland Saga', 'Rock Is a Lady', 'Flower and Asura', 'Hana wa Saku'],
  sports: ['Haikyuu', 'Slam Dunk', 'Kuroko', 'Blue Lock', 'Free', 'Yuri on Ice', 'Chihayafuru', 'Inazuma Eleven', 'Captain Tsubasa', 'Medalist', 'Umamusume', 'Uma Musume', 'Diamond no Ace', 'Yowamushi', 'Prince of Tennis', 'Keppeki Danshi', 'Beyblade', 'Crush Gear', 'Bakusou Kyoudai'],
  isekai: ['Re Zero', 'Rezero', 'KonoSuba', 'No Game No Life', 'Log Horizon', 'Overlord', 'Saga of Tanya', 'Youjo Senki', 'Mushoku Tensei', 'The Rising of the Shield Hero', 'Tate no Yuusha', 'That Time I Got Reincarnated', 'Tensei shitara slime', 'Isekai wa Smartphone', 'Arifureta', 'Choujin Koukousei', 'Kumo desu', 'Genjitsu Shugi', 'Tsuki ga Michibiku', 'Sekai Saikou no Ansatsusha', 'The Eminence in Shadow', 'Kage no Jitsuryokusha', 'Zenshu', 'The Beginning After the End', 'Outbreak Company', 'Isekai maou', 'Death March', 'Zero no Tsukaima', 'The devil is a part timer', 'Hataraku Maou', 'Hyakuren', 'Kenja no Mago', 'Isekai Quote', 'Isekai Quartet', 'Shinchou Yuusha', 'Kemono Michi', 'Hachi nan', '100 man no Inochi', 'Hai to gensou', 'Grimgar', 'Gaikotsu Kishi', 'Seirei Gensouki', 'Sentouin Hakenshimasu', 'Gate', 'Drifters', 'Oda Nobuna'],
  scifi: ['Vivy Fluorite', 'The Melancholy of Haruhi Suzumiya', 'Haruhi Suzumiya', 'Sword Art Online', 'SAO', 'Shangri La Frontier', 'Accel World', 'Infinite Dendrogram', 'Steins Gate', 'Ghost in the Shell', 'Cyberpunk', 'Dr Stone', 'Psycho Pass', 'Vivy', 'Akudama', 'Akira', 'Cowboy Bebop', 'Trigun', 'Space Battleship', 'Galaxy Express', 'Coppelion', 'Edens Zero', 'Gantz', 'Terra Formars', 'Black Bullet', 'Guilty Crown', 'Lazarus'],
  romance: ['Toradora', 'Kaguya', 'Horimiya', 'Kimi ni Todoke', 'Your Name', 'Kimi no Na wa', 'Nisekoi', 'My Teen Romantic', 'Yahari', 'Oregairu', 'Rascal Does Not Dream', 'Seishun Buta', 'Fruits Basket', 'Kanojo Okarishimasu', 'Rent a Girlfriend', 'The Quintessential', 'Gotoubun', 'Ouran', 'Spice and Wolf', 'Ookami to Koushinryou', 'Amagami', 'Nyan Koi', 'To Love Ru', 'Motto To Love', 'Sankarea', 'Masamune', 'The World God Only Knows', 'Kami nomi', 'Tonikaku', 'Tonikawa', 'Okinawa de Suki', 'Watashi no Shiawase', 'My Happy Marriage', 'Kimi no Koto', 'Honey Lemon', 'Kono Kaisha', 'Kisaki Kyouiku', 'Kowloon Generic', 'Danjo no Yuujou', 'The Fragrant Flower', 'Kaoru Hana', 'Sono Bisque', 'My Dress Up Darling', 'Yosuga no Sora', 'Gakkou Juliet', 'Kishuku Gakkou', 'Ore no Kanojo', 'Ore wo Suki', 'Mikakunin', 'Mikakuin', 'Blue Box'],
  comedy: ['Great Pretender', 'Netoge no Yome', 'Joukamachi no dandelion', 'Gintama', 'Nichijou', 'Asobi', 'Saiki', 'Grand Blue', 'Osomatsu', 'Spy x Family', 'Spy Family', 'One Punch Man', 'Mob Psycho', 'Shokugeki', 'Food Wars', 'Great Teacher Onizuka', 'Crayon Shin', 'Lucky Star', 'Ranma', 'Beelzebub', 'SKET Dance', 'Mashle', 'Zom 100', 'Himouto', 'Uzaki', 'Aharen', 'Murenase', 'Witch Watch', 'City The Animation', 'Ninja to Koroshiya', 'Shomin Sample', 'Prison School', 'Gekkan Shoujo', 'Boku wa Tomodachi', 'Nobunaga sensei', 'Monster Musume'],
  slice: ['Komi san', 'Doraemon', 'Chibi Maruko', 'Barakamon', 'Non Non', 'Yuru Camp', 'Laid Back Camp', 'Komi', 'Bakuman', 'Hataraku Saibou', 'Cells at Work', 'Apocalypse Hotel', 'Catch Me at the Ballpark', 'mono', 'Zatsu Tabi', 'Juku chan Tomizaki', 'Jaku Chara Tomozaki'],
  fantasy: ['Fate Zero', 'Fate Stay Night', 'Fate Grand Order', 'Fate Apocrypha', 'Magi The Labyrinth', 'Gunjou no magmel', 'Kimi to Boku no Saigo', 'Fate', 'Frieren', 'Sousou no Frieren', 'Fairy Tail', 'Black Clover', 'Nanatsu no Taizai', 'Seven Deadly Sins', 'Made in Abyss', 'Berserk', 'Claymore', 'Magi', 'Magic Knight Rayearth', 'Cardcaptor Sakura', 'Sailor Moon', 'Ojamajo', 'Suzume', 'Akatsuki no Yona', 'Dorohedoro', 'Ousama Ranking', 'Ranking of Kings', 'Bakemonogatari', 'Yofukashi', 'Call of the Night', 'Re Creators', 'Dungeon Meshi', 'Delicious in Dungeon', 'DanMachi', 'Is It Wrong to Try', 'Guild Receptionist', 'Guild no Uketsukejou', 'Trinity Seven', 'High School DxD', 'Date A Live', 'Goblin Slayer', 'Maoyuu', 'Yuusha Yamemasu', 'Densetsu no Yuusha', 'Maou Gakuin', 'Seven Knights', 'Kaifuku', 'Shikkakumon', 'Tensai Ouji', 'S Rank Monster', 'Silent Witch', 'Clevatess', 'Rokudenashi', 'Seiken no Blacksmith', 'Seisen Cerberus', 'Marimashita Iruma', 'Mairimashita Iruma', 'Ore dake Haireru', 'Shin no nakama', 'Seikoku', 'King s Raid'],
  action: ['JoJo s Bizarre Adventure', 'JoJo Golden Wind', 'Kinnikuman', 'Hokuto no Ken', 'Lupin III', 'Shingeki no Kyojin', 'Attack on Titan', 'Kimetsu no Yaiba', 'Demon Slayer', 'Jujutsu Kaisen', 'Naruto', 'Boruto', 'One Piece', 'Fullmetal Alchemist', 'Boku no Hero', 'My Hero Academia', 'Hunter x Hunter', 'Bleach', 'JoJo', 'Dragon Ball', 'Pokemon', 'Digimon', 'InuYasha', 'Akame ga Kill', 'Tokyo Revengers', 'Chainsaw Man', 'Ansatsu', 'Assassination Classroom', 'Enen no Shouboutai', 'Fire Force', 'Kill la Kill', 'Soul Eater', 'Ao no Exorcist', 'Blue Exorcist', 'Noragami', 'Toaru', 'Mahouka', 'Lycoris', 'Hellsing', 'Shaman King', 'Saint Seiya', 'Bungou', 'Bungo', 'Banana Fish', 'Black Lagoon', 'Deadman', 'Darker than Black', 'Baccano', 'Durarara', 'Yu Yu Hakusho', 'City Hunter', 'Zatch Bell', 'Katekyou', 'Reborn', 'Skull Man', 'Kekkai', 'The God of High School', 'Tower of God', 'Solo Leveling', 'Undead Unluck', 'Kaiju', 'Dandadan', 'Dan Da Dan', 'Sakamoto Days', 'Wind Breaker', 'Yaiba', 'Gachiakuta', 'Tougen Anki', 'Madan no Ou', 'Girls Panzer', 'Girls and Panzer', 'Qualidea', 'Gakusen', 'The Asterisk War', 'Absolute Duo', 'Seiken Tsukai', 'Hundred', 'Rakudai', 'Saijaku', 'Toriko', 'Koutetsujou', 'Strike the Blood', 'Owari no Seraph', 'Assassins Pride', 'High School Fleet', 'Kantai', 'Busou', 'Machine Doll', 'Taimadou', 'Sousei', 'Kuusen', 'Shimai Maou', 'Nejimaki', 'Darwin', 'Sword Gai', 'Kemono Jihen', 'Yu Gi Oh', 'Cardfight']
};

function normalize(value) {
  return String(value || '').normalize('NFKC').toLowerCase()
    .replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, '');
}
const seriesRules = Object.entries(SERIES).flatMap(([genre, names]) => names.map(name => ({ genre, key: normalize(name) })))
  .sort((a, b) => b.key.length - a.key.length);

function curatedGenre(anime) {
  const names = [anime?.animeTitle, anime?.title, ...(Array.isArray(anime?.altTitles) ? anime.altTitles : [])].filter(Boolean).map(normalize);
  // Short names require an exact title (or a season/OP suffix), preventing e.g. Air matching Air Gear.
  return seriesRules.find(rule => names.some(name => rule.key.length <= 4
    ? name === rule.key || new RegExp(`^${rule.key}(?:op|ed|season|s[0-9]|[0-9])`).test(name)
    : name.startsWith(rule.key)))?.genre;
}

export function inferAnimeGenre(anime) {
  return curatedGenre(anime) || 'other';
}

export function getEffectiveAnimeGenre(anime) {
  const stored = normalizeAnimeGenres(anime?.genres);
  if (stored.length) return stored[0];
  const current = String(anime?.genre || '').trim();
  if (anime?.genreSource === 'manual' && GENRE_CONFIG[current]) return current;
  return curatedGenre(anime) || (GENRE_CONFIG[current] ? current : 'other');
}

export function getAnimeGenreLabel(anime) {
  return getEffectiveAnimeGenres(anime).map(key => GENRE_CONFIG[key].label).join(' / ');
}

// Supplemental editorial tags; the first genre remains the compatible primary.
const SECONDARY = {
  action: ['Re Zero', 'Sword Art Online', '86', 'Vinland Saga', 'Code Geass', 'Tokyo Ghoul', 'Overlord', 'Mushoku Tensei', 'The Rising of the Shield Hero', 'Tate no Yuusha', 'Fate', 'Cyberpunk', 'Gundam', 'Hellsing', 'Berserk', 'Fairy Tail', 'Black Clover', 'Spy x Family', 'One Punch Man', 'Mob Psycho', 'No Game No Life', 'Shangri La Frontier', 'Solo Leveling'],
  fantasy: ['Re Zero', 'Konosuba', 'Mushoku Tensei', 'Overlord', 'No Game No Life', 'Tensei shitara slime', 'That Time I Got Reincarnated', 'The Rising of the Shield Hero', 'Tate no Yuusha', 'Jujutsu Kaisen', 'Kimetsu no Yaiba', 'InuYasha', 'Solo Leveling', 'Dandadan', 'Dan Da Dan'],
  drama: ['Vinland Saga', '86', 'Your Lie in April', 'Shigatsu wa Kimi no Uso', 'Oshi no Ko', 'Nana', 'Fruits Basket', 'Steins Gate', 'Violet Evergarden', 'Your Name', 'Kimi no Na wa', 'Clannad', 'To Your Eternity', 'Made in Abyss', 'Neon Genesis Evangelion', 'Fate Zero'],
  romance: ['Your Lie in April', 'Shigatsu wa Kimi no Uso', 'Clannad', 'Plastic Memories', 'Koe no Katachi', 'Nana', 'Given', 'Sword Art Online', 'Blue Box', 'Spice and Wolf', 'Fruits Basket'],
  comedy: ['Konosuba', 'Spy x Family', 'Bocchi the Rock', 'K On', 'Kaguya', 'Toradora', 'Horimiya', 'Aharen', 'Komi', 'Dungeon Meshi', 'One Punch Man', 'Mob Psycho', 'Witch Watch', 'Dandadan', 'Dan Da Dan'],
  slice: ['K On', 'Bocchi the Rock', 'Hyouka', 'Komi', 'Aharen', 'Horimiya', 'Nichijou', 'Yuru Camp'],
  mystery: ['Oshi no Ko', 'Steins Gate', 'Psycho Pass', 'Made in Abyss', 'The Apothecary Diaries', 'Kusuriya no Hitorigoto', 'Re Zero'],
  scifi: ['86', 'Code Geass', 'Gundam', 'Neon Genesis Evangelion', 'Macross', 'Plastic Memories'],
  sports: ['Blue Box'],
  music: ['Oshi no Ko', 'Macross'],
  horror: ['Made in Abyss', 'Yakusoku no Neverland', 'The Promised Neverland', 'Parasyte']
};

export function normalizeAnimeGenres(values) {
  const list = [...new Set((Array.isArray(values) ? values : []).filter(key => Object.hasOwn(GENRE_CONFIG, key)))];
  return list.length > 1 ? list.filter(key => key !== 'other') : list;
}

export function getEffectiveAnimeGenres(anime) {
  const stored = normalizeAnimeGenres(anime?.genres);
  if (stored.length) return stored;
  const primary = getEffectiveAnimeGenre(anime);
  if (anime?.genreSource === 'manual') return [primary];
  const names = [anime?.animeTitle, anime?.title, ...(Array.isArray(anime?.altTitles) ? anime.altTitles : [])].filter(Boolean).map(normalize);
  const extra = Object.entries(SECONDARY).filter(([, titles]) => titles.some(title => names.some(name => name.startsWith(normalize(title))))).map(([genre]) => genre);
  return normalizeAnimeGenres([primary, ...extra]);
}

export function matchesAnimeGenre(anime, genre) {
  return genre === 'all' || getEffectiveAnimeGenres(anime).includes(genre);
}
