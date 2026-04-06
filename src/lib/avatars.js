import { firebaseReady } from "./firebase";

async function blobToDataUrl(blob) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read_failed"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(blob);
  });
}

async function fileToCompressedImageDataUrl(file, { maxDim = 512, maxBytes = 350_000 } = {}) {
  const fileType = String(file?.type || "").trim();
  const isImage = !fileType || fileType.startsWith("image/");
  if (!isImage) throw new Error("not_image");

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    const url = URL.createObjectURL(file);
    try {
      bitmap = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("decode_failed"));
        img.src = url;
      });
    } finally {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    }
  }

  const width = Number(bitmap?.width || 0);
  const height = Number(bitmap?.height || 0);
  if (!width || !height) throw new Error("decode_failed");

  let scale = 1;
  const maxSide = Math.max(width, height);
  if (maxSide > maxDim) scale = maxDim / maxSide;

  let targetW = Math.max(1, Math.round(width * scale));
  let targetH = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_failed");

  let quality = 0.82;
  let dimW = targetW;
  let dimH = targetH;

  for (let attempt = 0; attempt < 8; attempt++) {
    canvas.width = dimW;
    canvas.height = dimH;
    ctx.clearRect(0, 0, dimW, dimH);
    ctx.drawImage(bitmap, 0, 0, dimW, dimH);

    const blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/webp", quality);
    });

    const fallbackBlob =
      blob ||
      (await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
      }));

    if (!fallbackBlob) throw new Error("encode_failed");
    if (fallbackBlob.size <= maxBytes) return await blobToDataUrl(fallbackBlob);

    // Try lower quality first, then reduce dimensions.
    quality = Math.max(0.5, quality * 0.75);
    if (attempt >= 3) {
      dimW = Math.max(1, Math.round(dimW * 0.85));
      dimH = Math.max(1, Math.round(dimH * 0.85));
      quality = 0.8;
    }
  }

  throw new Error("image_too_large");
}

export async function uploadUserAvatar(uid, file) {
  if (!firebaseReady) throw new Error("firebase_not_ready");
  if (!uid) throw new Error("missing_uid");
  if (!file) throw new Error("missing_file");
  if (typeof file.type === "string" && file.type && !file.type.startsWith("image/")) throw new Error("invalid_file_type");

  // Free-tier friendly: store as compressed data URL (no Firebase Storage required).
  return await fileToCompressedImageDataUrl(file, { maxDim: 512, maxBytes: 350_000 });
}
