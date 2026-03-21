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

  const result = files.map(file => ({
    id: file._id.toString(),
    token: file.filename, // The UUID for downloads
    name: file.metadata?.originalName || file.filename, // The human name for display
    size: file.length,
    uploadedAt: file.uploadDate,
  }));

  return Response.json(result);
}