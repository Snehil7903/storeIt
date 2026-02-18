"use client";

export default function TestUpload() {
  async function uploadFile(e) {
    e.preventDefault();
    const file = e.target.file.files[0];

    const res = await fetch("/api/token");
    const { token } = await res.json();

    const formData = new FormData();
    formData.append("file", file);

    await fetch(`/api/upload/${token}`, {
      method: "POST",
      body: formData,
    });

    alert("Uploaded with token: " + token);
  }

  return (
    <form onSubmit={uploadFile}>
      <input type="file" name="file" />
      <button type="submit">Upload</button>
    </form>
  );
}
