import { SignIn } from "@clerk/nextjs";
import { Sparkles, Check } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen bg-black text-zinc-100 font-sans">
      {/* Left panel: Info section (hidden on small/medium screens) */}
      <div className="hidden lg:flex flex-col justify-between p-16 bg-zinc-950 border-r border-zinc-900 select-none">
        {/* Header/Logo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-purple-500/20 bg-purple-500/5">
            <Sparkles className="size-4 text-purple-400" />
            <span className="text-sm font-semibold tracking-wide text-zinc-200">
              ghost <span className="text-purple-400 font-extrabold">AI</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 max-w-md">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
            Next-generation AI-powered design assistant.
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Collaborate, build, and deploy user interfaces in real-time with an interactive playground configured for your design system.
          </p>

          <ul className="space-y-3 pt-4">
            <li className="flex items-center gap-3 text-sm text-zinc-300">
              <div className="flex size-5 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Check className="size-3" />
              </div>
              Real-time collaborative editor
            </li>
            <li className="flex items-center gap-3 text-sm text-zinc-300">
              <div className="flex size-5 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Check className="size-3" />
              </div>
              Interactive components playground
            </li>
            <li className="flex items-center gap-3 text-sm text-zinc-300">
              <div className="flex size-5 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Check className="size-3" />
              </div>
              Seamless deployment and preview
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} ghost AI. All rights reserved.
        </div>
      </div>

      {/* Right panel: Centered Clerk SignIn component */}
      <div className="flex items-center justify-center p-6 lg:p-12 min-h-screen">
        <SignIn />
      </div>
    </div>
  );
}
