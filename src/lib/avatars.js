import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { firebaseReady, firebaseStorage } from "./firebase";

export async function uploadUserAvatar(uid, file) {
  if (!firebaseReady || !firebaseStorage) throw new Error("firebase_not_ready");
  if (!uid) throw new Error("missing_uid");
  if (!file) throw new Error("missing_file");
  if (typeof file.type === "string" && !file.type.startsWith("image/")) throw new Error("invalid_file_type");

  const storageRef = ref(firebaseStorage, `avatars/${uid}`);
  await uploadBytes(storageRef, file, {
    contentType: file.type || undefined
  });

  return await getDownloadURL(storageRef);
}
