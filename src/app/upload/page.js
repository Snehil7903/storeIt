"use client";

import { useState } from "react";
import Link from "next/link";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [token, setToken] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  async function handleUpload() {
    if (!file) return;
    setIsUploading(true);

    try {
      const t = await fetch("/api/token").then((r) => r.json());
      const form = new FormData();
      form.append("file", file);

      await fetch(`/api/upload/${t.token}`, {
        method: "POST",
        body: form,
      });

      setToken(t.token);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <main className="min-h-screen p-8 md:p-16 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <Link href="/" className="text-indigo-600 font-medium hover:underline flex items-center gap-2 mb-4">
          ← Back to Files
        </Link>
        <h1 className="text-4xl font-bold text-slate-900">Upload File</h1>
        <p className="text-slate-500 mt-2">Share your documents securely with a unique token.</p>
      </div>

      {!token ? (
        <div className="space-y-6">
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-3xl p-12 transition-all flex flex-col items-center justify-center text-center
              ${dragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white"}
              ${file ? "border-emerald-400 bg-emerald-50" : "hover:border-slate-300"}`}
          >
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => setFile(e.target.files[0])}
            />
            
            <div className="bg-slate-100 p-4 rounded-full mb-4">
              <span className="text-3xl">☁️</span>
            </div>

            {file ? (
              <div>
                <p className="text-emerald-700 font-semibold">{file.name}</p>
                <p className="text-emerald-600/70 text-sm mt-1">Ready to upload</p>
              </div>
            ) : (
              <div>
                <p className="text-slate-700 font-semibold text-lg">Click to upload or drag and drop</p>
                <p className="text-slate-400 text-sm mt-1">PDF, PNG, JPG or ZIP (Max. 50MB)</p>
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-lg
              ${!file || isUploading 
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"}`}
          >
            {isUploading ? "Uploading..." : "Upload Now"}
          </button>
        </div>
      ) : (
        /* Success State */
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl animate-in fade-in zoom-in duration-300">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-emerald-100 text-emerald-600 p-3 rounded-full text-xl">✓</div>
            <h2 className="text-2xl font-bold text-slate-800">Upload Successful</h2>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100">
            <p className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-2">Access Token</p>
            <code className="text-xl font-mono text-indigo-600 break-all">{token}</code>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`/api/download/${token}`}
              className="flex-1 bg-slate-900 text-white text-center py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              Download Link
            </a>
            <button
              onClick={() => setToken(null)}
              className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}
    </main>
  );
}