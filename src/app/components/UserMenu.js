"use client";

import { UserButton, useUser } from "@clerk/nextjs";

export default function UserMenu() {
  const { isLoaded, user } = useUser();

  if (!isLoaded || !user) return <div className="h-10 w-10 rounded-full bg-zinc-100 animate-pulse" />;

  return (
    <div className="flex items-center gap-4 bg-zinc-50 p-2 pr-4 rounded-full border border-zinc-100 shadow-sm hover:bg-zinc-100 transition-colors">
      <UserButton 
        afterSignOutUrl="/" 
        appearance={{
          elements: {
            userButtonAvatarBox: "w-10 h-10 border-2 border-white shadow-sm"
          }
        }}
      />
      <div className="hidden sm:block text-left">
        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-950 leading-tight">
          {user.firstName || "User"}
        </p>
        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
          Personal Vault
        </p>
      </div>
    </div>
  );
}