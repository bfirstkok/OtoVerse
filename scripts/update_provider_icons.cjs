const fs = require("fs");

const path = "public/provider_icons.json";
const icons = JSON.parse(fs.readFileSync(path, "utf8"));

const updates = {
  iqiyi: "https://cdn.aptoide.com/imgs/9/f/c/9fcda10e0d2f260dc70069f2cbb97e44_icon.png",
  bilibili: "https://seagm-media.seagmcdn.com/item_480/1440.png",
  trueid:
    "https://play-lh.googleusercontent.com/8XUaBjwriPl0ODDJ08hqyuhM99Zap67dLb2jhA1j-VGAM6_oO5K8vd4FlWU_qt0pE59pQEKSDLu6AeQc4pRNlQ",
  viu: "https://play-lh.googleusercontent.com/gMDqOiar6yBjexy0jR1MVI9q6iNsBGxdwuTxAMQshSy3ao55bh_r4TaES8lCn4xjX2w4",
  muse: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdqu_wqTbPtmi-7Ga18a8tUj5bvwv1gGL63A&s",
  anione: "https://anitrendz.net/news/wp-content/uploads/2021/06/Ani-One-Asia.png",
  flixer:
    "https://play-lh.googleusercontent.com/OuXfQlAZD_UyE4q0Je56ZznWMdz2AhQitXppTIU1V8QTnIXnkBTYFtzgMuSYaiatptg",
  gundaminfo:
    "https://yt3.googleusercontent.com/bCg9iY96jIm8GuM3wajVFGSnFEbBsMhjTJbHqcoCM4mQ6o4beXkM8_M2jNwtZN4cQIUcXkr_1iQ=s900-c-k-c0x00ffffff-no-rj",
  pops: "https://play-lh.googleusercontent.com/u9vXAP05N4o1UgLFd4uq-_ljwM_prtQspTTyFq5k__jeczeq5sTQSB3xV67VqbRzIw",
  linetv: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTshsB5VPfpvmMNX5OUgIDGD1yP3pK6iJpVCg&s",
  x: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/X_icon.svg/250px-X_icon.svg.png",
  appletv:
    "https://play-lh.googleusercontent.com/V4_8zKkohPYvEEITcXmoK6DSuqsPzPwGkTm4pm86epgvvq57LIfz7Jy0ZvPrhEneiS6Oe5lDX0F0q5BmLuleGg=w240-h480-rw",
  pokemonasia:
    "https://yt3.googleusercontent.com/WtnXvXsSkM4qS6SR9E6VO7d03RBR-GhIVPHzDemBnfN9UcJ44A1nB112IFFIdNWuS2ub6eZxhnA=s900-c-k-c0x00ffffff-no-rj",
  youtube:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/960px-YouTube_full-color_icon_%282017%29.svg.png",
  spotify: "https://s3-alpha.figma.com/hub/file/2734964093/9f5edc36-eb4d-414a-8447-10514f2bc224-cover.png",
  applemusic: "https://logos-world.net/wp-content/uploads/2020/11/Apple-Music-Logo.png",
  ytmusic:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Youtube_Music_icon.svg/960px-Youtube_Music_icon.svg.png?_=20230802004652"
};

Object.assign(icons, updates);
fs.writeFileSync(path, JSON.stringify(icons, null, 2) + "\n", "utf8");

console.log("Updated provider icons:", Object.keys(updates).join(", "));
