import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { GridFSBucket } from "mongodb";
import Busboy from "busboy";

export const runtime = "nodejs"; // 🔥 FORCE NODE RUNTIME

export async function POST(request) {
  // ✅ Extract token manually from URL
  const url = new URL(request.url);
  const token = url.pathname.split("/").pop();

  if (!token) {
    return NextResponse.json(
      { error: "Token missing" },
      { status: 400 }
    );
  }

  const client = await clientPromise;
  const db = client.db("storeIt");
  const bucket = new GridFSBucket(db);

  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: Object.fromEntries(request.headers),
      limits: { fileSize: 50 * 1024 * 1024 },
    });

    busboy.on("file", (_field, file, info) => {
      const uploadStream = bucket.openUploadStream(token, {
        contentType: info.mimeType,
      });
      file.pipe(uploadStream);
    });

    busboy.on("finish", () => {
      resolve(
        NextResponse.json({
          success: true,
          token,
        })
      );
    });

    busboy.on("error", reject);

    request.body
      .pipeTo(
        new WritableStream({
          write(chunk) {
            busboy.write(chunk);
          },
          close() {
            busboy.end();
          },
        })
      )
      .catch(reject);
  });
}
