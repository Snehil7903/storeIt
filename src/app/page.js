"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Folder,
  HardDrive,
  Download,
  Trash2,
  Plus,
  File as FileIcon, // Renamed to avoid naming conflict
  Cloud,
  LayoutGrid
} from "lucide-react";

export default function HomePage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const container = useRef(null);

  // 1. Fetch Files from MongoDB GridFS
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

  // 2. GSAP Entrance Animations
useGSAP(() => {
  if (!loading && files.length > 0) {
    // 1. Create a GSAP Context/Timeline
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Force-reset everything to visible before starting
      gsap.set([".animate-header", ".file-card"], { opacity: 1, y: 0, clearProps: "all" });

      tl.from(".animate-header", {
        y: -20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      })
      .from(".file-card", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power4.out",
        // Force opacity to 1 at the end of the animation
        onComplete: () => {
          gsap.set(".file-card", { clearProps: "opacity,transform" });
        }
      }, "-=0.4");
    }, container); // Scope to container

    // 2. Cleanup function: Revert everything when leaving the page
    return () => ctx.revert();
  }
}, { scope: container, dependencies: [loading, files] });

  // 3. Delete Logic with Exit Animation
  async function deleteFile(fileName) {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;

    // Smoothly remove the card from UI before the API call finishes
    const cardId = fileName.replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    gsap.to(`.card-${cardId}`, {
      scale: 0.8,
      opacity: 0,
      duration: 0.4,
      ease: "power4.in",
      onComplete: async () => {
        await fetch(`/api/delete/${fileName}`, { method: "DELETE" });
        fetchFiles();
      }
    });
  }

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <main ref={container} className="min-h-screen bg-white font-sans selection:bg-blue-100 overflow-x-hidden">
      <div className="max-w-7xl mx-auto p-6 md:p-12 lg:p-20">

        {/* Header Section */}
        <header className="animate-header flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-12 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] animate-pulse" />
              <span className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400">Secure Vault</span>
            </div>
            <h1 className="text-7xl font-black text-zinc-950 tracking-tighter uppercase leading-none">
              Store <span className="text-blue-600 italic lowercase font-serif leading-none">It</span>
            </h1>
            <p className="text-zinc-500 text-lg font-medium">Your personal GridFS storage, encrypted and fast.</p>
          </div>

          <Link
            href="/upload"
            className="group flex items-center gap-4 bg-zinc-950 text-white px-10 py-5 rounded-[2rem] font-bold transition-all hover:bg-zinc-800 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] active:scale-95"
          >
            <Plus size={22} className="group-hover:rotate-90 transition-transform duration-500" />
            New Upload
          </Link>
        </header>

        {/* Quick Stats Grid */}
        <div className="animate-header grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-zinc-50 border border-zinc-100 p-8 rounded-[2.5rem] flex items-center gap-6 group hover:bg-zinc-100 transition-colors">
            <div className="bg-white p-5 rounded-2xl shadow-sm group-hover:scale-110 transition-transform"><HardDrive className="text-blue-600" /></div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Protocol</p>
              <p className="text-xl font-bold text-zinc-900 mt-1">GridFS</p>
            </div>
          </div>
          <div className="bg-zinc-50 border border-zinc-100 p-8 rounded-[2.5rem] flex items-center gap-6 group hover:bg-zinc-100 transition-colors">
            <div className="bg-white p-5 rounded-2xl shadow-sm group-hover:scale-110 transition-transform"><Folder className="text-blue-600" /></div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Assets</p>
              <p className="text-xl font-bold text-zinc-900 mt-1">{files.length} Files</p>
            </div>
          </div>
        </div>

        {/* Files Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 bg-zinc-50 border border-zinc-100 animate-pulse rounded-[3rem]"></div>
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-40 bg-zinc-50 rounded-[4rem] border-2 border-dashed border-zinc-200">
            <Cloud className="mx-auto text-zinc-200 w-24 h-24 mb-8" />
            <h3 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">Your vault is empty</h3>
            <p className="text-zinc-400 text-lg mb-10">Start by uploading your first document to the cloud.</p>
            <Link href="/upload" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
              Go to Upload
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {files.map((file) => {
              const safeId = file.name.replace(/\s+/g, '-').replace(/[^\w-]/g, '');
              return (
                <div
                  key={file.id}
                  className={`file-card card-${safeId} group bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] hover:border-blue-200 transition-all duration-700 relative overflow-hidden`}
                >
                  <div className="flex flex-col h-full relative z-10">
                    <div className="mb-10">
                      {/* ICON: Changed to dark background for visibility */}
                      <div className="bg-zinc-950 w-14 h-14 rounded-[1.25rem] flex items-center justify-center mb-8 shadow-xl group-hover:bg-blue-600 transition-colors duration-500">
                        <FileIcon className="text-white w-7 h-7" />
                      </div>

                      {/* SUBTEXT: Brightened to brand blue */}
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 mb-3">
                        Stored Encrypted
                      </p>

                      {/* FILENAME: Switched to Zinc-950 (Deep Black) */}
                      <h3 className="text-2xl font-bold text-zinc-950 truncate leading-tight tracking-tight" title={file.name}>
                        {file.name}
                      </h3>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-8">
                      <a
                        href={`/api/download/${file.name}`}
                        className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest text-zinc-950 hover:text-blue-600 transition-colors"
                      >
                        <Download size={18} />
                        Save
                      </a>

                      <button
                        onClick={() => deleteFile(file.name)}
                        className="p-4 rounded-2xl text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Background Subtle Grid Pattern */}
      <div className="fixed inset-0 -z-20 opacity-[0.03] pointer-events-none">
        <div className="h-full w-full" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>
    </main>
  );
}