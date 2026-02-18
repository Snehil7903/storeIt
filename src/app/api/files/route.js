import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("storeIt");

  const files = await db
    .collection("fs.files")
    .find({})
    .sort({ uploadDate: -1 })
    .toArray();

  const result = files.map(file => ({
    id: file._id.toString(),
    name: file.filename,
    size: file.length,
    uploadedAt: file.uploadDate,
  }));

  return Response.json(result);
}
