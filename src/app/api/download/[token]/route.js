import clientPromise from "@/lib/mongodb";
import { GridFSBucket } from "mongodb";

export const runtime = "nodejs";

export async function GET(request) {
  const url = new URL(request.url);
  const token = url.pathname.split("/").pop();

  if (!token) return new Response("Token missing", { status: 400 });

  const client = await clientPromise;
  const db = client.db("storeIt");
  const bucket = new GridFSBucket(db);

  // Find the file by the UUID token
  const file = await db.collection("fs.files").findOne({ filename: token });

  if (!file) {
    return new Response("File not found or link expired", { status: 404 });
  }

  // Use originalName from metadata so the download has the correct extension
  const realFileName = file.metadata?.originalName || token;
  const stream = bucket.openDownloadStream(file._id);

  return new Response(stream, {
    headers: {
      "Content-Type": file.contentType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${realFileName}"`,
      "Cache-Control": "public, max-age=3600", 
    },
  });
}