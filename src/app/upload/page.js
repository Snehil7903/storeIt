"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [token, setToken] = useState(null);

  async function handleUpload() {
    if (!file) return alert("Select a file");

    const t = await fetch("/api/token").then(r => r.json());

    const form = new FormData();
    form.append("file", file);

    await fetch(`/api/upload/${t.token}`, {
      method: "POST",
      body: form,
    });

    setToken(t.token);
  }

  async function handleDelete() {
    await fetch(`/api/delete/${token}`, {
      method: "DELETE",
    });
    alert("File deleted");
    setToken(null);
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>StoreIt</h1>

      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <br /><br />

      <button onClick={handleUpload}>Upload</button>

      {token && (
        <>
          <p><b>Token:</b> {token}</p>

          <a href={`/api/download/${token}`}>Download</a>
          <br /><br />

          <button onClick={handleDelete} style={{ color: "red" }}>
            Delete File
          </button>
        </>
      )}
    </div>
  );
}
