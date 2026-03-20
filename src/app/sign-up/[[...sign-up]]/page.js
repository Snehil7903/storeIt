"use client";

import { SignUp } from "@clerk/nextjs";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function SignUpPage() {
  const container = useRef(null);

  useGSAP(() => {
    if (!container.current) return;
    
    const tl = gsap.timeline();

    // Staggered entrance for the text blocks
    tl.from(".animate-text", {
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: "power4.out",
    });

    // Subtle glow pulse in the background
    gsap.to(".bg-glow", {
      scale: 1.2,
      opacity: 0.6,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, { scope: container });

  return (
    <div ref={container} className="flex min-h-screen bg-white">
      {/* Visual Section: Dark Branding */}
      <section className="relative hidden w-1/2 flex-col justify-center bg-zinc-950 p-16 lg:flex">
        {/* Subtle Grid Pattern for texture */}
        <div className="absolute inset-0 z-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#2563eb 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} 
        />
        
        {/* Animated Background Glow */}
        <div className="bg-glow absolute top-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-blue-600/20 blur-[120px]" />
        
        <div className="z-10 flex flex-col space-y-8">
          <div className="animate-text flex items-center gap-2">
            <div className="h-2 w-10 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
            <h2 className="text-2xl font-bold tracking-tight text-white uppercase">Store-It</h2>
          </div>
          
          <div className="max-w-[560px] space-y-6">
            <h1 className="animate-text text-7xl font-black leading-[1] tracking-tighter text-white uppercase">
              Start <br />
              Storing <br />
              With <span className="text-blue-500 italic lowercase font-serif leading-none">ease</span>.
            </h1>
            <p className="animate-text text-xl text-zinc-400 leading-relaxed max-w-[420px]">
              Join thousands of users who trust Store-It for their most important documents. Fast, secure, and forever.
            </p>
          </div>

          <div className="animate-text flex gap-4 pt-10">
            <div className="h-[1px] w-20 bg-zinc-800 self-center" />
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">Join the Cloud</span>
          </div>
        </div>
      </section>

      {/* Form Section: Perfectly Centered */}
      <section className="flex flex-1 items-center justify-center bg-zinc-50/50 py-12">
        <div className="w-full max-w-[480px] px-8">
          {/* Mobile-only logo */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="h-1.5 w-8 bg-blue-600 rounded-full" />
            <h2 className="text-xl font-bold tracking-tight text-zinc-950 uppercase">Store-It</h2>
          </div>

          <div className="animate-text">
            <SignUp 
              appearance={{
                elements: {
                  card: 'm-0 shadow-2xl border border-zinc-200/50 rounded-2xl bg-white p-2',
                  formButtonPrimary: 'bg-blue-600 hover:bg-blue-500 text-sm py-2.5 transition-all rounded-lg shadow-lg shadow-blue-500/25 active:scale-[0.98]',
                  headerTitle: 'text-2xl font-bold text-zinc-900',
                  headerSubtitle: 'text-zinc-500 mb-4',
                  socialButtonsBlockButton: 'border-zinc-200 hover:bg-zinc-50 transition-all rounded-lg py-2.5',
                  formFieldInput: 'rounded-lg border-zinc-200 focus:border-blue-500 transition-all py-2.5',
                  footerActionLink: 'text-blue-600 hover:text-blue-700 font-semibold',
                  dividerLine: 'bg-zinc-100',
                  dividerText: 'text-zinc-400 uppercase text-[10px] tracking-widest'
                }
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}