"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Bot, X, Send, Sparkles, FileText, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOthers, useFeedMessages, useSelf, useCreateFeedMessage, useRoom, useStorage } from "@liveblocks/react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { AiStatusPayloadSchema, AiChatMessageSchema, AiChatMessage } from "@/types/tasks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const formatRelativeTime = (dateInput: string | Date) => {
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDays}d ago`;
};

// Simple inline formatter for bold, italic, code
function formatInline(text: string) {
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const matches = text.split(regex);
  
  return matches.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-semibold text-zinc-100">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="px-1 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-purple-300">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function MarkdownPreview({ content }: { content: string }) {
  const lines = content.split("\n");
  
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = "";
  
  const renderedElements: React.ReactNode[] = [];
  
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        inCodeBlock = false;
        const codeText = codeBlockLines.join("\n");
        renderedElements.push(
          <div key={`code-${idx}`} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 my-2.5 font-mono text-[10px] text-zinc-300 overflow-x-auto whitespace-pre">
            {codeBlockLang && (
              <div className="text-[9px] text-zinc-500 uppercase font-semibold tracking-wider mb-1 select-none border-b border-zinc-800/50 pb-1">
                {codeBlockLang}
              </div>
            )}
            <code>{codeText}</code>
          </div>
        );
        codeBlockLines = [];
        codeBlockLang = "";
      } else {
        inCodeBlock = true;
        codeBlockLang = line.slice(3).trim();
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }
    
    if (line.startsWith("# ")) {
      renderedElements.push(
        <h1 key={idx} className="text-sm font-bold text-zinc-150 mt-4 mb-2 pb-1 border-b border-zinc-800">
          {line.slice(2)}
        </h1>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      renderedElements.push(
        <h2 key={idx} className="text-xs font-bold text-zinc-150 mt-4 mb-2 pb-0.5 border-b border-zinc-850">
          {line.slice(3)}
        </h2>
      );
      continue;
    }
    if (line.startsWith("### ")) {
      renderedElements.push(
        <h3 key={idx} className="text-[11px] font-semibold text-zinc-200 mt-3 mb-1">
          {line.slice(4)}
        </h3>
      );
      continue;
    }
    if (line.startsWith("#### ")) {
      renderedElements.push(
        <h4 key={idx} className="text-[10px] font-semibold text-zinc-300 mt-2 mb-1">
          {line.slice(5)}
        </h4>
      );
      continue;
    }
    if (line.trim() === "---") {
      renderedElements.push(<hr key={idx} className="border-zinc-800 my-3" />);
      continue;
    }
    if (line.startsWith("> ")) {
      renderedElements.push(
        <blockquote key={idx} className="border-l-2 border-purple-500 bg-zinc-900/30 pl-3 py-1 my-2 text-zinc-400 italic">
          {line.slice(2)}
        </blockquote>
      );
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      renderedElements.push(
        <div key={idx} className="flex gap-2 pl-3 my-0.5 text-zinc-300">
          <span className="text-purple-400 select-none">•</span>
          <span>{formatInline(line.slice(2))}</span>
        </div>
      );
      continue;
    }
    const numberedListMatch = line.match(/^(\d+)\.\s(.*)/);
    if (numberedListMatch) {
      renderedElements.push(
        <div key={idx} className="flex gap-2 pl-3 my-0.5 text-zinc-300">
          <span className="text-purple-400 font-mono select-none">{numberedListMatch[1]}.</span>
          <span>{formatInline(numberedListMatch[2])}</span>
        </div>
      );
      continue;
    }
    if (line.trim() === "") {
      renderedElements.push(<div key={idx} className="h-1.5" />);
      continue;
    }
    renderedElements.push(<p key={idx} className="my-1 text-zinc-350">{formatInline(line)}</p>);
  }
  
  return <div className="space-y-1 select-text pr-2 leading-relaxed">{renderedElements}</div>;
}

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [activeTab, setActiveTab] = React.useState<string>("architect");
  const [inputValue, setInputValue] = React.useState<string>("");
  const [sendError, setSendError] = React.useState<string | null>(null);

  // Room integration
  const room = useRoom();
  const roomId = room.id;

  // Subscribe to flow nodes and edges in Liveblocks storage
  const canvasNodes = useStorage((root: any) => {
    const flow = root.flow as any;
    if (!flow || !flow.nodes) return [];
    return Object.values(flow.nodes);
  });

  const canvasEdges = useStorage((root: any) => {
    const flow = root.flow as any;
    if (!flow || !flow.edges) return [];
    return Object.values(flow.edges);
  });

  // Trigger.dev run states
  const [runId, setRunId] = React.useState<string | null>(null);
  const [publicToken, setPublicToken] = React.useState<string | null>(null);

  // Specs state
  const [specs, setSpecs] = React.useState<any[]>([]);
  const [isLoadingSpecs, setIsLoadingSpecs] = React.useState<boolean>(false);
  const [specRunId, setSpecRunId] = React.useState<string | null>(null);
  const [specPublicToken, setSpecPublicToken] = React.useState<string | null>(null);

  // Spec Preview Modal state
  const [selectedSpec, setSelectedSpec] = React.useState<any | null>(null);
  const [previewContent, setPreviewContent] = React.useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = React.useState<boolean>(false);

  // Subscribe to current user metadata and live cursor presence thinking state
  const me = useSelf();
  const others = useOthers();
  const isAiThinking = others.some(
    (other) =>
      other.id === "ghost-ai-agent" &&
      (other.presence?.thinking || other.presence?.isThinking)
  );

  const isThinkingActive = isAiThinking || !!runId || !!specRunId;

  const fetchSpecs = React.useCallback(async () => {
    setIsLoadingSpecs(true);
    try {
      const response = await fetch(`/api/projects/${roomId}/specs`);
      if (response.ok) {
        const data = await response.json();
        setSpecs(data);
      } else {
        const errorText = await response.text().catch(() => "");
        console.error("Failed to fetch specs. Status:", response.status, "Body:", errorText);
      }
    } catch (error) {
      console.error("Error fetching specs:", error);
    } finally {
      setIsLoadingSpecs(false);
    }
  }, [roomId]);

  React.useEffect(() => {
    if (activeTab === "specs") {
      fetchSpecs();
    }
  }, [activeTab, fetchSpecs]);

  // Track spec generation run in real time
  useRealtimeRun(specRunId && specRunId !== "pending" ? specRunId : "", {
    accessToken: specPublicToken || "",
    enabled: !!specRunId && specRunId !== "pending" && !!specPublicToken,
    onComplete: async (completedRun) => {
      try {
        await fetchSpecs();
      } catch (e) {
        console.error("Failed to refresh specs after run completion:", e);
      } finally {
        setSpecRunId(null);
        setSpecPublicToken(null);
      }
    },
  });

  const handleGenerateSpec = async () => {
    if (isThinkingActive) return;

    try {
      setSpecRunId("pending");
      
      const response = await fetch("/api/ai/spec", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId,
          chatHistory: validatedMessages,
          nodes: canvasNodes,
          edges: canvasEdges,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      if (!data.runId) {
        throw new Error("Invalid response from spec API");
      }

      // Fetch spec run token
      const tokenResponse = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ runId: data.runId }),
      });

      if (!tokenResponse.ok) {
        const tokenErrorData = await tokenResponse.json().catch(() => ({}));
        throw new Error(tokenErrorData.error || `HTTP token error ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      if (!tokenData.token) {
        throw new Error("Invalid token from spec token API");
      }

      setSpecRunId(data.runId);
      setSpecPublicToken(tokenData.token);
    } catch (error: any) {
      console.error("Failed to generate spec:", error);
      setSpecRunId(null);
      setSpecPublicToken(null);
      
      try {
        await createFeedMessage("ai-chat", {
          sender: "Ghost AI",
          role: "assistant",
          content: `Error generating spec: ${error?.message || "Failed to start AI spec task."}`,
          timestamp: Date.now(),
        });
      } catch (feedError) {
        console.error("Failed to write spec error message to ai-chat feed:", feedError);
      }
    }
  };

  const handleSelectSpec = async (spec: any) => {
    setSelectedSpec(spec);
    setPreviewContent(null);
    setIsPreviewLoading(true);
    try {
      const response = await fetch(`/api/projects/${roomId}/specs/${spec.id}/download`);
      if (response.ok) {
        const text = await response.text();
        setPreviewContent(text);
      } else {
        console.error("Failed to load spec preview content");
      }
    } catch (e) {
      console.error("Error loading spec preview content:", e);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Track Trigger.dev run status in real time
  useRealtimeRun(runId || "", {
    accessToken: publicToken || "",
    enabled: !!runId && !!publicToken,
    onComplete: async (completedRun) => {
      try {
        if (completedRun.status === "COMPLETED") {
          const explanation = (completedRun.output as any)?.explanation || "Design generation completed successfully!";
          await createFeedMessage("ai-chat", {
            sender: "Ghost AI",
            role: "assistant",
            content: explanation,
            timestamp: Date.now(),
          });
        } else {
          const errorMsg = completedRun.error?.message || "Design generation failed. Please try again.";
          await createFeedMessage("ai-chat", {
            sender: "Ghost AI",
            role: "assistant",
            content: `Error: ${errorMsg}`,
            timestamp: Date.now(),
          });
        }
      } catch (e) {
        console.error("Failed to append final run status message to ai-chat feed:", e);
      } finally {
        setRunId(null);
        setPublicToken(null);
      }
    },
  });

  // Subscribe to the shared status feed
  const { messages: feedMessages } = useFeedMessages("ai-status-feed");

  // Subscribe to the shared chat feed
  const { messages: feedChatMessages } = useFeedMessages("ai-chat");

  // Validate and sort chat feed messages chronologically
  const validatedMessages = React.useMemo(() => {
    if (!feedChatMessages) return [];
    return feedChatMessages
      .map((msg) => {
        const parsed = AiChatMessageSchema.safeParse(msg.data);
        if (parsed.success) {
          return {
            id: msg.id,
            ...parsed.data,
          };
        }
        return null;
      })
      .filter((msg): msg is (AiChatMessage & { id: string }) => msg !== null)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [feedChatMessages]);

  // Validate and get the latest status feed message
  const latestFeedMessage = React.useMemo(() => {
    if (!feedMessages || feedMessages.length === 0) return null;

    // Sort descending by createdAt to get the newest status updates
    const sorted = [...feedMessages].sort((a, b) => b.createdAt - a.createdAt);

    for (const msg of sorted) {
      const parsed = AiStatusPayloadSchema.safeParse(msg.data);
      if (parsed.success) {
        return parsed.data; // { text?: string }
      }
    }
    return null;
  }, [feedMessages]);

  const createFeedMessage = useCreateFeedMessage();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-resize the input textarea based on input content
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    // Adjust height dynamically while bounding between 72px and 160px
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 72), 160);
    textarea.style.height = `${newHeight}px`;
  }, [inputValue]);

  // Scroll to bottom when messages list or typing state changes
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [validatedMessages, isThinkingActive]);

  const handleSend = async () => {
    if (!inputValue.trim() || isThinkingActive) return;

    const userMessageText = inputValue.trim();
    setSendError(null);

    const displayName = me?.info?.name || "Anonymous";

    try {
      // 1. Push the user message to the ai-chat feed
      await createFeedMessage("ai-chat", {
        sender: displayName,
        role: "user",
        content: userMessageText,
        timestamp: Date.now(),
      });
      setInputValue("");

      // 2. Call POST /api/ai/design with prompt and roomId
      const response = await fetch("/api/ai/design", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userMessageText, roomId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      // 3. Read runId and publicToken from the response
      const data = await response.json();
      if (!data.runId || !data.publicToken) {
        throw new Error("Invalid response from design API");
      }

      // 4. Store runId and publicToken in local state
      setRunId(data.runId);
      setPublicToken(data.publicToken);

      // Focus back on textarea
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    } catch (error: any) {
      console.error("Failed to execute design process:", error);
      // Show errors as messages in ai-chat feed
      try {
        await createFeedMessage("ai-chat", {
          sender: "Ghost AI",
          role: "assistant",
          content: `Error: ${error?.message || "Failed to start AI design task."}`,
          timestamp: Date.now(),
        });
      } catch (feedError) {
        console.error("Failed to write error message to ai-chat feed:", feedError);
        setSendError("Failed to start AI design task.");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChipClick = (promptText: string) => {
    setInputValue(promptText);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const starterChips = [
    "Design an e-commerce backend",
    "Create a chat app architecture",
    "Build a CI/CD pipeline",
  ];

  return (
    <aside
      className={cn(
        "fixed top-14 right-0 w-96 h-[calc(100vh-3.5rem)] z-40 border-l border-surface-border",
        "bg-base/95 backdrop-blur-md shadow-[-5px_0_25px_rgba(0,0,0,0.5)]",
        "flex flex-col justify-between transition-transform duration-300 ease-in-out select-none ai-sidebar-container",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-brand-dim rounded-md border border-brand/20 text-accent-text">
            <Bot className="size-4.5" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold tracking-wide text-primary-text leading-tight">
              AI Workspace
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isThinkingActive ? (
                <>
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-medium">
                    AI Active...
                  </span>
                </>
              ) : (
                <span className="text-[10px] text-muted-text">
                  Collaborate with Ghost AI
                </span>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-muted-text hover:text-primary-text hover:bg-subtle transition-colors cursor-pointer"
          title="Close AI workspace"
          aria-label="Close AI workspace"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Tabs Navigation Layout */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="px-4 pt-4 border-b border-surface-border bg-base/50">
          <TabsList className="grid grid-cols-2 bg-subtle border border-surface-border p-0.5 w-full rounded-lg">
            <TabsTrigger
              value="architect"
              className={cn(
                "text-xs py-1.5 transition-colors cursor-pointer",
                "data-[state=active]:bg-accent data-[state=active]:text-white",
                "data-[state=inactive]:text-muted-text hover:data-[state=inactive]:text-primary-text"
              )}
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className={cn(
                "text-xs py-1.5 transition-colors cursor-pointer",
                "data-[state=active]:bg-accent data-[state=active]:text-white",
                "data-[state=inactive]:text-muted-text hover:data-[state=inactive]:text-primary-text"
              )}
            >
              Specs
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab content 1: AI Architect */}
        <TabsContent
          value="architect"
          className="flex-1 flex flex-col min-h-0 focus-visible:outline-none"
        >
          {/* Messages Log area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {validatedMessages.length === 0 ? (
              // Empty State view
              <div className="h-full flex flex-col items-center justify-center text-center p-4 py-8">
                <div className="p-3.5 bg-brand-dim rounded-full border border-brand/10 text-accent-text/60 mb-3 animate-pulse">
                  <Bot className="size-7" />
                </div>
                <h3 className="text-xs font-semibold text-primary-text mb-1">
                  How can I help you design?
                </h3>
                <p className="text-[11px] text-muted-text max-w-[220px] mb-6 leading-relaxed">
                  Ask Ghost AI to sketch systems, generate databases, or draft pipelines right onto the canvas.
                </p>

                {/* Starter Prompts chips container */}
                <div className="w-full space-y-2">
                  {starterChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChipClick(chip)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-lg border border-surface-border text-[11px] font-medium",
                        "bg-subtle text-accent-text hover:bg-brand-dim/5 hover:border-brand/30 transition-all cursor-pointer"
                      )}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Active chat feed
              <div className="space-y-3.5">
                {validatedMessages.map((msg) => {
                  const isMe = msg.role === "user" && msg.sender === (me?.info?.name || "");
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed",
                        msg.role === "user"
                          ? "ml-auto bg-[#62C073] text-zinc-950 font-medium"
                          : "mr-auto bg-zinc-900 border border-zinc-800 text-zinc-100"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1 text-[10px]">
                        <span className={cn(
                          "font-semibold truncate",
                          msg.role === "user" ? "text-zinc-950/80" : "text-zinc-400"
                        )}>
                          {isMe ? "You" : msg.sender}
                        </span>
                        <span className={cn(
                          "text-[9px] shrink-0",
                          msg.role === "user" ? "text-zinc-900/60" : "text-zinc-500"
                        )}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap select-text text-left break-words">{msg.content}</p>
                    </div>
                  );
                })}
                
                {/* Typing Indicator */}
                {isThinkingActive && (
                  <div className="mr-auto bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg px-3 py-2 text-xs flex items-center gap-2">
                    <Loader2 className="size-3.5 animate-spin text-zinc-400 shrink-0" />
                    <span className="text-[10px] text-zinc-400 font-medium">
                      {latestFeedMessage?.text || "Ghost AI is thinking..."}
                    </span>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Chat input footer */}
          <div className="p-3 border-t border-surface-border bg-base/80 flex flex-col gap-2">
            {/* Status strip */}
            {isThinkingActive && (
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800/80 text-[10px] text-zinc-200 shadow-inner">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#62C073] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#62C073]"></span>
                </span>
                <span className="font-medium truncate flex-1 text-left text-zinc-300">
                  {latestFeedMessage?.text || "Ghost AI is processing..."}
                </span>
              </div>
            )}

            {sendError && (
              <div className="px-1 text-[10px] text-red-400 font-medium">
                {sendError}
              </div>
            )}
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Ghost AI..."
                  disabled={isThinkingActive}
                  className={cn(
                    "w-full bg-subtle border-surface-border text-xs text-primary-text",
                    "placeholder:text-muted-text/60 focus-visible:border-brand/50 focus-visible:ring-brand/10",
                    "resize-none pr-8 py-2.5 min-h-[72px] max-h-[160px] overflow-y-auto leading-relaxed",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                />
                <div className="absolute right-2.5 bottom-2.5 text-muted-text/40 pointer-events-none">
                  <Sparkles className="size-3.5" />
                </div>
              </div>
              <Button
                onClick={handleSend}
                disabled={isThinkingActive || !inputValue.trim()}
                size="icon"
                className={cn(
                  "size-[38px] rounded-md shrink-0 cursor-pointer transition-all flex items-center justify-center",
                  isThinkingActive
                    ? "bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50"
                    : inputValue.trim()
                    ? "bg-[#62C073] text-zinc-950 hover:bg-[#62C073]/90 shadow-[0_2px_8px_rgba(98,192,115,0.2)]"
                    : "bg-zinc-800 text-zinc-600 opacity-40 cursor-not-allowed"
                )}
                title={isThinkingActive ? "AI is active..." : "Send message"}
              >
                {isThinkingActive ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Tab content 2: Specs */}
        <TabsContent
          value="specs"
          className="flex-1 flex flex-col p-4 gap-4 focus-visible:outline-none min-h-0"
        >
          {/* Action Trigger */}
          <Button
            onClick={handleGenerateSpec}
            disabled={isThinkingActive}
            className="w-full bg-accent text-white hover:bg-accent/90 border border-brand/20 gap-2 text-xs py-5 cursor-pointer shadow-sm transition-all shrink-0"
            title="Generate spec from canvas"
          >
            {specRunId === "pending" || (specRunId && specRunId !== "pending") ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating Spec...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Generate Spec
              </>
            )}
          </Button>

          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            <span className="text-[10px] font-semibold text-muted-text uppercase tracking-wider block shrink-0">
              Document Catalog
            </span>
            
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-0">
              {isLoadingSpecs ? (
                <div className="h-32 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="size-5 animate-spin text-zinc-500" />
                  <span className="text-[10px] text-zinc-500">Loading catalog...</span>
                </div>
              ) : specs.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-center p-4">
                  <FileText className="size-6 text-zinc-500 mb-2 opacity-50" />
                  <p className="text-[10px] text-zinc-500 max-w-[200px]">
                    No specifications generated yet. Click "Generate Spec" above to create one.
                  </p>
                </div>
              ) : (
                specs.map((spec) => {
                  const filename = spec.filePath.split("/").pop() || "specification.md";
                  return (
                    <div
                      key={spec.id}
                      onClick={() => handleSelectSpec(spec)}
                      className="bg-elevated border border-surface-border rounded-lg p-3 space-y-2 shadow-xs hover:border-brand/20 transition-all cursor-pointer group text-left"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 bg-brand-dim rounded-md border border-brand/10 text-accent-text shrink-0 group-hover:bg-brand/10 transition-colors">
                          <FileText className="size-4.5" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <h4 className="text-[11px] font-semibold text-primary-text truncate group-hover:text-accent-text transition-colors font-mono">
                            {filename}
                          </h4>
                          <p className="text-[9px] text-muted-text font-mono">
                            {formatRelativeTime(spec.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer action bar */}
                      <div className="pt-2 border-t border-surface-border/40 flex items-center justify-end">
                        <a
                          href={`/api/projects/${roomId}/specs/${spec.id}/download`}
                          download
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            "flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-zinc-400 hover:text-zinc-200 bg-subtle border border-surface-border rounded-md hover:bg-zinc-800 transition-all cursor-pointer"
                          )}
                          title="Download specification"
                        >
                          <Download className="size-3" />
                          Download
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Preview Modal */}
      <Dialog open={!!selectedSpec} onOpenChange={(open) => !open && setSelectedSpec(null)}>
        <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-100 max-h-[85vh] flex flex-col p-6 rounded-lg shadow-xl">
          <DialogHeader className="pb-4 border-b border-zinc-800 flex flex-row items-center justify-between space-y-0">
            <div>
              <DialogTitle className="text-sm font-semibold text-zinc-100 flex items-center gap-2 font-mono">
                <FileText className="size-4.5 text-purple-400" />
                {selectedSpec ? (selectedSpec.filePath.split("/").pop() || "specification.md") : "Spec Preview"}
              </DialogTitle>
              <DialogDescription className="text-[10px] text-zinc-500 mt-1 font-mono">
                {selectedSpec && `Created: ${new Date(selectedSpec.createdAt).toLocaleString()}`}
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Dialog Content Area */}
          <div className="flex-1 overflow-y-auto py-4 min-h-0">
            {isPreviewLoading ? (
              <div className="h-40 flex flex-col items-center justify-center gap-3">
                <Loader2 className="size-6 animate-spin text-purple-500" />
                <span className="text-xs text-zinc-500">Retrieving content from secure storage...</span>
              </div>
            ) : previewContent ? (
              <MarkdownPreview content={previewContent} />
            ) : (
              <div className="h-40 flex items-center justify-center text-xs text-zinc-500">
                Failed to load specification content.
              </div>
            )}
          </div>

          {/* Dialog Footer Actions */}
          <DialogFooter className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-4">
            <span className="text-[10px] text-zinc-500 font-mono">
              {previewContent ? `${(previewContent.length / 1024).toFixed(1)} KB` : ""}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSpec(null)}
                className="text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 cursor-pointer"
              >
                Close
              </Button>
              {selectedSpec && (
                <a
                  href={`/api/projects/${roomId}/specs/${selectedSpec.id}/download`}
                  download
                  className={cn(
                    "flex items-center gap-1.5 text-xs text-zinc-950 font-semibold bg-[#62C073] hover:bg-[#62C073]/90 rounded px-3.5 py-2 transition-all cursor-pointer shadow-[0_2px_8px_rgba(98,192,115,0.2)]"
                  )}
                >
                  <Download className="size-3.5" />
                  Download Spec
                </a>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
