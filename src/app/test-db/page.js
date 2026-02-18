import clientPromise from "@/lib/mongodb";

export default async function TestDB() {
  const client = await clientPromise;
  const db = client.db("storeIt");

  return (
    <div style={{ padding: 40 }}>
      <h1>MongoDB Connected ✅</h1>
      <p>Database: {db.databaseName}</p>
    </div>
  );
}
