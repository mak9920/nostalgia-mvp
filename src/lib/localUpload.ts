import fs from "fs";
import path from "path";

export function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function getUploadsRoot() {
  return path.join(process.cwd(), "public", "uploads");
}

export function getOrderUploadDir(orderId: string) {
  return path.join(getUploadsRoot(), orderId);
}
