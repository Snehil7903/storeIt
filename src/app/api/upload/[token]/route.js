import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { GridFSBucket } from "mongodb";
import Busboy from "busboy";

export const runtime = "nodejs";

export async function POST(request) {
  const url = new URL(request.url);
  const token = url.pathname.split("/").pop();

  if (!token) return NextResponse.json({ error: "Token missing" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db("storeIt");
  const bucket = new GridFSBucket(db);

  return new Promise((resolve, reject) => {
    let clerkUserId = ""; // To catch the userId field

    const busboy = Busboy({
      headers: Object.fromEntries(request.headers),
      limits: { fileSize: 50 * 1024 * 1024 },
    });

    // Capture text fields like userId
    busboy.on("field", (name, val) => {
      if (name === "userId") clerkUserId = val;
    });

    busboy.on("file", (_field, file, info) => {
      // Create the upload stream WITH metadata
      const uploadStream = bucket.openUploadStream(token, {
        contentType: info.mimeType,
        metadata: { 
          ownerId: clerkUserId, // <--- Link to the user
          originalName: info.filename 
        }
      });
      file.pipe(uploadStream);
    });

    busboy.on("finish", () => {
      resolve(NextResponse.json({ success: true, token }));
    });

    busboy.on("error", reject);

    // Stream the request body into Busboy
    request.body.pipeTo(new WritableStream({
      write(chunk) { busboy.write(chunk); },
      close() { busboy.end(); },
    })).catch(reject);
  });
}