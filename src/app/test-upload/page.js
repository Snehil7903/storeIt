"use client";
import { useAuth } from "@clerk/nextjs";

export default function TestUpload() {
  const { userId } = useAuth();

  async function uploadFile(e) {
    e.preventDefault();
    if (!userId) return alert("Please log in");
    const file = e.target.file.files[0];

    const res = await fetch("/api/token");
    const { token } = await res.json();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId); // Critical update

    await fetch(`/api/upload/${token}`, {
      method: "POST",
      body: formData,
    });

    alert("Uploaded for user: " + userId);
  }

  return (
    <form onSubmit={uploadFile} className="p-10">
      <input type="file" name="file" />
      <button type="submit" className="bg-black text-white p-2 ml-4">Upload</button>
    </form>
  );
}