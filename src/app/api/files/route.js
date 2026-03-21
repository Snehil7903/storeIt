import { auth } from "@clerk/nextjs/server"; // 1. Import Clerk Auth
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  // 2. Get the current logged-in user's ID
  const { userId } = await auth();

  // 3. If the user isn't logged in, block the request
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const client = await clientPromise;
  const db = client.db("storeIt");

  // 4. FILTER: Only find files where metadata.ownerId matches the userId
  const files = await db
    .collection("fs.files")
    .find({ "metadata.ownerId": userId }) // This is the magic line
    .sort({ uploadDate: -1 })
    .toArray();

  const result = files.map(file => ({
    id: file._id.toString(),
    name: file.filename,
    size: file.length,
    uploadedAt: file.uploadDate,
    // Optional: include metadata for debugging
    owner: file.metadata?.ownerId 
  }));

  return Response.json(result);
}