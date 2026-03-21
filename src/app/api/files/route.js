import { auth } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clientPromise;
  const db = client.db("storeIt");

  const files = await db.collection("fs.files")
    .find({ "metadata.ownerId": userId }) 
    .sort({ uploadDate: -1 })
    .toArray();

  // 1. Calculate total storage used in bytes
  const totalSize = files.reduce((acc, file) => acc + (file.length || 0), 0);

  const result = files.map(file => ({
    id: file._id.toString(),
    token: file.filename,
    name: file.metadata?.originalName || file.filename,
    size: file.length,
    uploadedAt: file.uploadDate,
  }));

  // 2. Return both the array and the sum
  return Response.json({ files: result, totalSize });
}