import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccessDenied() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-6 relative overflow-hidden font-sans select-none">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-md w-full border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md rounded-xl p-8 text-center flex flex-col items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20 text-red-400 mb-2 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
          <Lock className="size-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            Access Denied
          </h1>
          <p className="text-sm text-zinc-400 max-w-xs mx-auto">
            You do not have permission to access this workspace, or this project does not exist.
          </p>
        </div>

        <Link href="/editor" passHref legacyBehavior>
          <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 rounded-lg py-5 text-sm transition-all duration-200 cursor-pointer">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
