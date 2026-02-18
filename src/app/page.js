"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchFiles() {
    try {
      const res = await fetch("/api/files");
      const data = await res.json();
      setFiles(data);
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteFile(fileName) {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) return;
    
    await fetch(`/api/delete/${fileName}`, { method: "DELETE" });
    fetchFiles();
  }

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <main className="min-h-screen p-8 md:p-16 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            📂 StoreIt
          </h1>
          <p className="text-slate-500 mt-1">Manage and access your cloud storage.</p>
        </div>
        
        <a 
          href="/upload" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-indigo-200 text-center"
        >
          + Upload New File
        </a>
      </div>

      <hr className="border-slate-200 mb-10" />

      {/* Content Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 text-lg">Your storage is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => (
            <div 
              key={file.id} 
              className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300"
            >
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-1">File</p>
                  <h3 className="font-bold text-slate-800 truncate text-lg" title={file.name}>
                    {file.name}
                  </h3>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
                  <a 
                    href={`/api/download/${file.name}`}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Download
                  </a>
                  
                  <button
                    onClick={() => deleteFile(file.name)}
                    className="text-sm font-medium text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}