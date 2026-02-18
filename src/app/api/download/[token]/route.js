import clientPromise from "@/lib/mongodb";
import { GridFSBucket } from "mongodb";

export const runtime = "nodejs";

export async function GET(request) {
  const url = new URL(request.url);
  const token = url.pathname.split("/").pop();

  if (!token) {
    return new Response("Token missing", { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("storeIt");
  const bucket = new GridFSBucket(db);

  const files = await db
    .collection("fs.files")
    .find({ filename: token })
    .toArray();

  if (!files.length) {
    return new Response("File not found", { status: 404 });
  }

  const file = files[0];
  const stream = bucket.openDownloadStream(file._id);

  return new Response(stream, {
    headers: {
      "Content-Type": file.contentType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${token}"`,
    },
  });
}
