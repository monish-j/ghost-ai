"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Trash2, Mail, Users, Shield, Loader2 } from "lucide-react";

interface Collaborator {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
}

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  isOwner: boolean;
}

export function ShareDialog({
  isOpen,
  onClose,
  projectId,
  projectName,
  isOwner,
}: ShareDialogProps) {
  const [email, setEmail] = React.useState("");
  const [collaborators, setCollaborators] = React.useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isActionLoading, setIsActionLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch collaborators list
  const fetchCollaborators = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`);
      if (!res.ok) {
        throw new Error("Failed to fetch collaborators");
      }
      const data = await res.json();
      setCollaborators(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    if (isOpen) {
      fetchCollaborators();
    }
  }, [isOpen, fetchCollaborators]);

  // Handle invite collaborator
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isActionLoading) return;

    setIsActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to invite collaborator");
      }

      setEmail("");
      await fetchCollaborators();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle remove collaborator
  const handleRemove = async (collaboratorId: string) => {
    if (isActionLoading) return;

    setIsActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: collaboratorId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove collaborator");
      }

      await fetchCollaborators();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Copy project link
  const handleCopyLink = () => {
    const link = `${window.location.origin}/editor/${projectId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-zinc-950 border-zinc-800 text-zinc-100 p-6 rounded-xl shadow-2xl">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Users className="size-5 text-purple-400" />
            Share &ldquo;{projectName}&rdquo;
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            {isOwner
              ? "Invite collaborators by email to view and edit this project."
              : "View the list of collaborators with access to this project."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Link Copy Bar */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-zinc-400">Project Link</div>
            <div className="flex gap-2">
              <Input
                readOnly
                value={typeof window !== "undefined" ? `${window.location.origin}/editor/${projectId}` : ""}
                className="bg-zinc-900 border-zinc-800 text-zinc-400 placeholder:text-zinc-600 focus-visible:ring-0 select-all font-mono text-[11px] h-9"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-3 shrink-0 h-9 text-xs transition-all gap-1.5 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="border-t border-zinc-800/80 my-4" />

          {/* Error Message */}
          {error && (
            <div className="px-3 py-2.5 rounded-lg border border-red-500/20 bg-red-500/5 text-xs text-red-400 text-left font-medium">
              {error}
            </div>
          )}

          {/* Owner Invitation Form */}
          {isOwner && (
            <form onSubmit={handleInvite} className="space-y-1.5">
              <label htmlFor="collaborator-email" className="text-xs font-semibold text-zinc-400">
                Invite Collaborator
              </label>
              <div className="flex gap-2">
                <Input
                  id="collaborator-email"
                  type="email"
                  placeholder="collaborator@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isActionLoading}
                  required
                  className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-purple-500 focus-visible:ring-purple-500/20 text-xs h-9"
                />
                <Button
                  type="submit"
                  disabled={isActionLoading || !email.trim()}
                  className="bg-purple-600 hover:bg-purple-500 text-white border border-purple-700 px-4 text-xs h-9 cursor-pointer shrink-0"
                >
                  {isActionLoading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    "Invite"
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Collaborators List */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-zinc-400 flex items-center justify-between">
              <span>Collaborators</span>
              {!isOwner && (
                <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                  <Shield className="size-3" /> Read-only
                </span>
              )}
            </div>

            <div className="border border-zinc-800/60 rounded-lg bg-zinc-900/10 max-h-[180px] overflow-y-auto divide-y divide-zinc-800/50">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-zinc-500 flex flex-col items-center gap-2">
                  <Loader2 className="size-5 animate-spin text-purple-400" />
                  <span>Loading collaborators...</span>
                </div>
              ) : collaborators.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500 flex flex-col items-center gap-2">
                  <Mail className="size-5 text-zinc-600" />
                  <span>No collaborators added yet.</span>
                </div>
              ) : (
                collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between p-2.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {collaborator.imageUrl ? (
                        <img
                          src={collaborator.imageUrl}
                          alt={collaborator.name || collaborator.email}
                          className="size-7.5 rounded-full object-cover border border-zinc-800"
                        />
                      ) : (
                        <div className="size-7.5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 text-xs font-semibold uppercase shrink-0">
                          {collaborator.name ? collaborator.name[0] : collaborator.email[0]}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0 text-left">
                        {collaborator.name ? (
                          <>
                            <span className="text-xs font-medium text-zinc-200 truncate">
                              {collaborator.name}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono truncate">
                              {collaborator.email}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-medium text-zinc-200 truncate">
                            {collaborator.email}
                          </span>
                        )}
                      </div>
                    </div>

                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleRemove(collaborator.id)}
                        disabled={isActionLoading}
                        className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer shrink-0"
                        title="Remove collaborator"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
