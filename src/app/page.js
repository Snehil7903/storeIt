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
  Cloud,
  Link as LinkIcon,
  Check,
  Search,
  Database,
  FileText,
  FileImage,
  FileCode,
  FileArchive,
  File as FileIconDefault
} from "lucide-react";
import UserMenu from "./components/UserMenu";

export default function HomePage() {
  const [files, setFiles] = useState([]);
  const [totalSize, setTotalSize] = useState(0); // Added Storage State
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const container = useRef(null);

  const STORAGE_LIMIT = 512 * 1024 * 1024; // 512MB limit for MongoDB Atlas Free Tier

  // 1. Fetch Files & Storage Data
  async function fetchFiles() {
    try {
      const res = await fetch("/api/files");
      const data = await res.json();
      // Expecting { files: [], totalSize: number } from your API
      setFiles(data.files || []);
      setTotalSize(data.totalSize || 0);
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  }

  // 2. Helper to format bytes (e.g., 1024 -> 1KB)
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const storagePercentage = Math.min((totalSize / STORAGE_LIMIT) * 100, 100);

  // 3. Filter Logic for Search
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 4. Dynamic Icon Logic
  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop().toLowerCase();
    const props = { className: "text-white w-7 h-7" };
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return <FileImage {...props} />;
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) return <FileText {...props} />;
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css', 'json', 'cpp'].includes(ext)) return <FileCode {...props} />;
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return <FileArchive {...props} />;
    return <FileIconDefault {...props} />;
  };

  // 5. Copy Link Logic
  const copyToClipboard = (token) => {
    const url = `${window.location.origin}/api/download/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(token);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 6. GSAP Entrance Animations
  useGSAP(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline();
        gsap.set([".animate-header", ".file-card"], { opacity: 1, y: 0, clearProps: "all" });

        tl.from(".animate-header", {
          y: -20,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out"
        });

        if (filteredFiles.length > 0) {
          tl.from(".file-card", {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power4.out",
            onComplete: () => {
              gsap.set(".file-card", { clearProps: "opacity,transform" });
            }
          }, "-=0.4");
        }
      }, container);
      return () => ctx.revert();
    }
  }, { scope: container, dependencies: [loading, filteredFiles.length] });

  // 7. Delete Logic
  async function deleteFile(token) {
    if (!confirm(`Are you sure you want to delete this file?`)) return;
    const cardId = token.replace(/[^\w-]/g, '');

    gsap.to(`.card-${cardId}`, {
      scale: 0.8,
      opacity: 0,
      duration: 0.4,
      ease: "power4.in",
      onComplete: async () => {
        await fetch(`/api/delete/${token}`, { method: "DELETE" });
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

<header className="animate-header flex flex-col mb-16 relative">
  
  {/* TOP BAR: Profile Identity */}
  <div className="flex justify-start mb-6">
    <UserMenu />
  </div>

  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
    {/* BRANDING */}
    <div className="space-y-3">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-2 w-12 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] animate-pulse" />
        <span className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400">Secure Vault</span>
      </div>
      <h1 className="text-6xl md:text-7xl font-black text-zinc-950 tracking-tighter uppercase leading-none">
        Store <span className="text-blue-600 italic lowercase font-serif leading-none">It</span>
      </h1>
      <p className="text-zinc-500 text-lg font-medium">Your personal GridFS storage, encrypted and fast.</p>
    </div>

    {/* ACTIONS: Search and Upload together */}
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input 
          type="text" 
          placeholder="Search vault..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-zinc-900 shadow-sm"
        />
      </div>
      <Link
        href="/upload"
        className="w-full sm:w-auto group flex items-center justify-center gap-4 bg-zinc-950 text-white px-10 py-5 rounded-[2rem] font-bold transition-all hover:bg-zinc-800 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] active:scale-95"
      >
        <Plus size={22} className="group-hover:rotate-90 transition-transform duration-500" />
        New Upload
      </Link>
    </div>
  </div>
</header>

        {/* Stats & Storage Grid */}
        <div className="animate-header grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-zinc-50 border border-zinc-100 p-8 rounded-[2.5rem] flex items-center gap-6 group hover:bg-zinc-100 transition-colors">
            <div className="bg-white p-5 rounded-2xl shadow-sm"><Folder className="text-blue-600" /></div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Vault Items</p>
              <p className="text-xl font-bold text-zinc-900 mt-1">{files.length} Files</p>
            </div>
          </div>

          {/* STORAGE METER CARD */}
          <div className="lg:col-span-2 bg-zinc-950 p-8 rounded-[2.5rem] flex flex-col justify-center relative overflow-hidden shadow-2xl">
            <div className="flex justify-between items-end mb-4 relative z-10">
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Storage Used</p>
                <p className="text-2xl font-black text-white mt-1">
                  {formatBytes(totalSize)} <span className="text-zinc-500 text-sm font-medium">/ 512 MB</span>
                </p>
              </div>
              <Database className="text-blue-500 opacity-50" size={32} />
            </div>
            
            <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-[2px] border border-white/5 relative z-10">
              <div 
                className="h-full bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all duration-1000 ease-out"
                style={{ width: `${storagePercentage}%` }}
              />
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 bg-zinc-50 border border-zinc-100 animate-pulse rounded-[3rem]"></div>
            ))}
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-40 bg-zinc-50 rounded-[4rem] border-2 border-dashed border-zinc-200">
            <Cloud className="mx-auto text-zinc-200 w-24 h-24 mb-8" />
            <h3 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">Vault is empty</h3>
            <p className="text-zinc-400 text-lg mb-10">No files found matching your search.</p>
            <Link href="/upload" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
              Go to Upload
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredFiles.map((file) => {
              const safeId = file.token.replace(/[^\w-]/g, '');
              return (
                <div
                  key={file.id}
                  className={`file-card card-${safeId} group bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] hover:border-blue-200 transition-all duration-700 relative overflow-hidden`}
                >
                  <div className="flex flex-col h-full relative z-10">
                    <div className="mb-10">
                      <div className="bg-zinc-950 w-14 h-14 rounded-[1.25rem] flex items-center justify-center mb-8 shadow-xl group-hover:bg-blue-600 transition-colors duration-500">
                        {getFileIcon(file.name)}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 mb-3">
                        Stored Encrypted
                      </p>
                      <h3 className="text-2xl font-bold text-zinc-950 truncate leading-tight tracking-tight" title={file.name}>
                        {file.name}
                      </h3>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-8">
                      <div className="flex gap-4">
                        <a
                          href={`/api/download/${file.token}`}
                          className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-950 hover:text-blue-600 transition-colors"
                        >
                          <Download size={16} />
                          Save
                        </a>
                        <button
                          onClick={() => copyToClipboard(file.token)}
                          className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-950 hover:text-blue-600 transition-colors"
                        >
                          {copiedId === file.token ? <Check size={16} className="text-emerald-500" /> : <LinkIcon size={16} />}
                          {copiedId === file.token ? "Copied" : "Link"}
                        </button>
                      </div>

                      <button
                        onClick={() => deleteFile(file.token)}
                        className="p-3 rounded-2xl text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="fixed inset-0 -z-20 opacity-[0.03] pointer-events-none">
        <div className="h-full w-full" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>
    </main>
  );
}