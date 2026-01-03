import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get("path");

  if (!filePath) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  const absolutePath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const file = fs.readFileSync(absolutePath);

  return new NextResponse(file, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": file.length.toString(),
    },
  });
}
