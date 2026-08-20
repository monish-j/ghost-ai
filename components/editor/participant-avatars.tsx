"use client";

import * as React from "react";
import { useOthers } from "@liveblocks/react";
import { useUser, UserButton } from "@clerk/nextjs";

export function ParticipantAvatars() {
  const { user } = useUser();
  const others = useOthers();

  // Deduplicate and filter out the current user
  const collaborators = React.useMemo(() => {
    const unique = new Map();
    for (const other of others) {
      if (user && other.id === user.id) continue;
      if (!unique.has(other.id)) {
        unique.set(other.id, other);
      }
    }
    return Array.from(unique.values());
  }, [others, user]);

  const visibleCollaborators = collaborators.slice(0, 5);
  const overflowCount = collaborators.length - 5;

  return (
    <div className="flex items-center gap-2 bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 p-1.5 px-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)] border-t-zinc-700/40 select-none nodrag nopan">
      {collaborators.length > 0 && (
        <div className="flex items-center -space-x-2">
          {visibleCollaborators.map((collaborator) => {
            const name = collaborator.info?.name || "Collaborator";
            const avatar = collaborator.info?.avatar;
            const color = collaborator.info?.color || "#a855f7";

            return (
              <div
                key={collaborator.id}
                className="relative group size-8 rounded-full overflow-hidden flex items-center justify-center bg-zinc-900 text-xs font-semibold text-zinc-200 transition-transform duration-250 hover:scale-105 hover:z-10"
                style={{
                  border: `2px solid #09090b`,
                  boxShadow: `0 0 0 1px ${color}80`,
                }}
              >
                <AvatarFallback src={avatar} name={name} />
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-semibold text-zinc-200 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {name}
                </div>
              </div>
            );
          })}

          {overflowCount > 0 && (
            <div
              className="relative group size-8 rounded-full bg-zinc-900 text-zinc-400 text-xs font-bold flex items-center justify-center hover:scale-105 hover:z-10"
              style={{
                border: `2px solid #09090b`,
              }}
            >
              +{overflowCount}
              
              {/* Overflow Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-semibold text-zinc-200 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {collaborators.slice(5).map(c => c.info?.name || "Collaborator").join(", ")}
              </div>
            </div>
          )}
        </div>
      )}

      {collaborators.length > 0 && (
        <div className="w-px h-5 bg-zinc-850 mx-1 shrink-0" />
      )}

      <div 
        className="size-8 rounded-full overflow-hidden border border-zinc-800/60 bg-zinc-900 flex items-center justify-center shrink-0"
      >
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "size-8",
            },
          }}
        />
      </div>
    </div>
  );
}

function AvatarFallback({ src, name }: { src?: string; name: string }) {
  const [error, setError] = React.useState(false);

  const initials = React.useMemo(() => {
    if (!name) return "?";
    return name
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [name]);

  if (src && !error) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name}
        onError={() => setError(true)}
        className="size-full object-cover"
      />
    );
  }

  return (
    <span className="text-[10px] font-extrabold text-zinc-300">
      {initials}
    </span>
  );
}
