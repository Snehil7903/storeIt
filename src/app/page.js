"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchFiles() {
    const res = await fetch("/api/files");
    const data = await res.json();
    setFiles(data);
    setLoading(false);
  }

  async function deleteFile(token) {
    await fetch(`/api/delete/${token}`, { method: "DELETE" });
    fetchFiles();
  }

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>📂 StoreIt – Uploaded Files</h1>

      <a href="/upload">⬆ Upload New File</a>
      <br /><br />

      {loading && <p>Loading files...</p>}

      {!loading && files.length === 0 && (
        <p>No files uploaded yet.</p>
      )}

      <ul>
        {files.map(file => (
          <li key={file.id} style={{ marginBottom: 10 }}>
            <b>{file.name}</b>
            <br />

            <a href={`/api/download/${file.name}`}>
              Download
            </a>

            {" | "}

            <button
              onClick={() => deleteFile(file.name)}
              style={{ color: "red" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
