"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Bot, X, Send, Sparkles, FileText, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  sender: "user" | "assistant";
  text: string;
}

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [activeTab, setActiveTab] = React.useState<string>("architect");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState<string>("");
  const [isTyping, setIsTyping] = React.useState<boolean>(false);

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
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessageText = inputValue.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessageText }]);
    setInputValue("");

    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);

    // Simulate AI response delay
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: `Here is a preliminary architectural outline based on your request: "${userMessageText}". I've sketched some core modules. Let me know if you would like me to generate a full technical specification or draft canvas nodes for this structure!`,
        },
      ]);
    }, 1200);
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
            <span className="text-[10px] text-muted-text">
              Collaborate with Ghost AI
            </span>
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
            {messages.length === 0 ? (
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
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex flex-col max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed",
                      msg.sender === "user"
                        ? "ml-auto bg-brand-dim border-brand/50 border-2 text-copy-primary"
                        : "mr-auto bg-elevated border border-surface-border text-accent-text"
                    )}
                  >
                    <p className="whitespace-pre-wrap select-text">{msg.text}</p>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="mr-auto bg-elevated border border-surface-border text-accent-text rounded-lg px-3 py-2 text-xs flex items-center gap-2">
                    <Loader2 className="size-3.5 animate-spin text-accent-text/70" />
                    <span className="text-[10px] text-muted-text font-medium">Ghost AI is thinking...</span>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Chat input footer */}
          <div className="p-3 border-t border-surface-border bg-base/80 flex gap-2 items-end">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Ghost AI..."
                className={cn(
                  "w-full bg-subtle border-surface-border text-xs text-primary-text",
                  "placeholder:text-muted-text/60 focus-visible:border-brand/50 focus-visible:ring-brand/10",
                  "resize-none pr-8 py-2.5 min-h-[72px] max-h-[160px] overflow-y-auto leading-relaxed"
                )}
              />
              <div className="absolute right-2.5 bottom-2.5 text-muted-text/40 pointer-events-none">
                <Sparkles className="size-3.5" />
              </div>
            </div>
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              size="icon"
              className={cn(
                "size-[38px] rounded-md shrink-0 bg-accent text-white hover:bg-accent/90 cursor-pointer transition-colors flex items-center justify-center",
                "disabled:opacity-40 disabled:pointer-events-none"
              )}
              title="Send message"
            >
              <Send className="size-3.5" />
            </Button>
          </div>
        </TabsContent>

        {/* Tab content 2: Specs */}
        <TabsContent
          value="specs"
          className="flex-1 flex flex-col p-4 gap-4 focus-visible:outline-none min-h-0 overflow-y-auto"
        >
          {/* Action Trigger */}
          <Button
            className="w-full bg-accent text-white hover:bg-accent/90 border border-brand/20 gap-2 text-xs py-5 cursor-pointer shadow-sm transition-all shrink-0"
            title="Generate spec from canvas"
          >
            <Sparkles className="size-4" />
            Generate Spec
          </Button>

          <div className="space-y-3">
            <span className="text-[10px] font-semibold text-muted-text uppercase tracking-wider block">
              Document Catalog
            </span>
            
            {/* Demo spec card */}
            <div className="bg-elevated border border-surface-border rounded-lg p-3.5 space-y-3 shadow-xs hover:border-brand/20 transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-dim rounded-md border border-brand/10 text-accent-text shrink-0">
                  <FileText className="size-5" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs font-semibold text-primary-text truncate">
                    system-spec-draft.md
                  </h4>
                  <p className="text-[10px] text-muted-text leading-relaxed">
                    Contains architecture diagram mappings, backend endpoint definitions, database schemas, and caching layouts.
                  </p>
                </div>
              </div>

              {/* Card Footer action bar */}
              <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between">
                <span className="text-[9px] text-muted-text font-mono">
                  3.2 KB • Drafted
                </span>
                <Button
                  disabled
                  size="xs"
                  variant="outline"
                  className="gap-1.5 text-[10px] text-muted-text border-surface-border bg-subtle"
                  title="Download spec is disabled"
                >
                  <Download className="size-3" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
