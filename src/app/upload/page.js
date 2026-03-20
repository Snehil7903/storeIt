"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Upload, File, CheckCircle2, ArrowLeft, Cloud } from "lucide-react";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [token, setToken] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);

  const container = useRef(null);
  const progressBarRef = useRef(null);

  useGSAP(() => {
    if (!container.current) return;
    
    // Smooth entrance for page elements
    gsap.from(".animate-up", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power3.out"
    });
  }, { scope: container });

  // GSAP for progress bar updates
  useGSAP(() => {
    if (isUploading) {
      gsap.to(progressBarRef.current, {
        width: `${progress}%`,
        duration: 0.4,
        ease: "power2.out"
      });
    }
  }, [progress, isUploading]);

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
    setProgress(0);

    try {
      const t = await fetch("/api/token").then((r) => r.json());
      const form = new FormData();
      form.append("file", file);

      // Using XMLHttpRequest to get real-time progress for our GSAP bar
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/api/upload/${t.token}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          setToken(t.token);
          // Trigger success animation
          gsap.from(".success-pop", { scale: 0.5, opacity: 0, duration: 0.5, ease: "back.out(2)" });
        }
      };

      xhr.send(form);
    } catch (error) {
      console.error("Upload failed", error);
      setIsUploading(false);
    }
  }

  return (
    <main ref={container} className="min-h-screen bg-white font-sans selection:bg-blue-100">
      <div className="max-w-4xl mx-auto p-8 md:p-20">
        
        {/* Header Section */}
        <div className="animate-up mb-12">
          <Link href="/" className="group flex items-center gap-2 text-zinc-500 hover:text-blue-600 transition-colors mb-6 font-medium">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Library
          </Link>
          <h1 className="text-5xl font-black text-zinc-950 tracking-tighter uppercase">
            Upload <span className="text-blue-600 italic lowercase font-serif">Files</span>
          </h1>
          <p className="text-zinc-500 mt-3 text-lg">Secure your documents with encrypted GridFS storage.</p>
        </div>

        {!token ? (
          <div className="space-y-8 animate-up">
            {/* The Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-[2.5rem] p-16 transition-all duration-500 flex flex-col items-center justify-center text-center overflow-hidden
                ${dragActive ? "border-blue-500 bg-blue-50/50 scale-[1.02]" : "border-zinc-200 bg-zinc-50/30"}
                ${file && !isUploading ? "border-emerald-500 bg-emerald-50/30" : "hover:border-zinc-300"}`}
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                onChange={(e) => setFile(e.target.files[0])}
              />
              
              <div className={`p-6 rounded-3xl mb-6 transition-all duration-500 
                ${file ? "bg-emerald-500 shadow-emerald-200" : "bg-zinc-950 shadow-zinc-200"} shadow-2xl`}>
                {file ? <CheckCircle2 className="text-white w-10 h-10" /> : <Cloud className="text-white w-10 h-10" />}
              </div>

              {isUploading ? (
                <div className="w-full max-w-xs">
                  <p className="text-zinc-900 font-bold uppercase tracking-widest text-xs mb-4">Syncing to GridFS... {progress}%</p>
                  <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden border border-zinc-200 p-[1px]">
                    <div ref={progressBarRef} className="h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
                  </div>
                </div>
              ) : file ? (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-emerald-700 text-2xl font-bold tracking-tight">{file.name}</p>
                  <p className="text-emerald-600/70 font-medium mt-1">Ready for encrypted transfer</p>
                </div>
              ) : (
                <div>
                  <p className="text-zinc-900 font-bold text-2xl tracking-tight">Drop your files here</p>
                  <p className="text-zinc-400 mt-2 font-medium">PNG, PDF, or ZIP up to 50MB</p>
                </div>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={`w-full py-5 rounded-2xl font-bold text-xl transition-all active:scale-[0.98]
                ${!file || isUploading 
                  ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
                  : "bg-zinc-950 text-white hover:bg-zinc-800 shadow-2xl shadow-zinc-300"}`}
            >
              {isUploading ? "Processing..." : "Generate Access Token"}
            </button>
          </div>
        ) : (
          /* Success State - Modern & Clean */
          <div className="success-pop bg-white border border-zinc-100 rounded-[2.5rem] p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-5 mb-8">
              <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-200">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-zinc-950 tracking-tight">ENCRYPTED</h2>
                <p className="text-zinc-400 font-medium uppercase text-xs tracking-widest">File ID: {token.slice(0, 8)}...</p>
              </div>
            </div>

            <div className="bg-zinc-50 p-8 rounded-3xl mb-10 border border-zinc-100 group relative">
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-400 mb-3">Access Token</p>
              <code className="text-2xl font-mono text-blue-600 break-all leading-none">{token}</code>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`/api/download/${token}`}
                className="flex-1 bg-zinc-950 text-white text-center py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
              >
                Download Link
              </a>
              <button
                onClick={() => { setToken(null); setFile(null); setProgress(0); setIsUploading(false); }}
                className="flex-1 bg-white border-2 border-zinc-100 text-zinc-600 py-4 rounded-2xl font-bold hover:bg-zinc-50 transition-all"
              >
                Upload Another
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}