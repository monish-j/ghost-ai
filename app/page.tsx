"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  CardAction
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Settings, 
  Terminal, 
  Layers, 
  FileText, 
  HelpCircle, 
  Maximize2, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Sparkles,
  Sliders
} from "lucide-react";

export default function Home() {
  const [inputValue, setInputValue] = React.useState("");
  const [textareaValue, setTextareaValue] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <div className="relative min-h-screen bg-black text-zinc-100 font-sans selection:bg-purple-500/30 selection:text-purple-200">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,119,198,0.12),transparent_60%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 flex flex-col gap-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800/80 pb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold tracking-wide">
              <Sparkles className="size-3.5" />
              Design System Ready
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400">
              ghost AI <span className="font-light text-zinc-400">UI Primitives</span>
            </h1>
            <p className="text-zinc-400 text-sm max-w-xl">
              Fully interactive developer playground for shadcn/ui components configured with the ghost dark theme.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="size-4" />
              Settings
            </Button>
            <Button variant="default" size="sm" className="bg-purple-600 hover:bg-purple-500 text-white border-purple-700 gap-2" asChild>
              <Link href="/editor">
                <Terminal className="size-4" />
                Launch App
              </Link>
            </Button>
          </div>
        </header>

        {/* Tab-driven Showcase Workspace */}
        <Tabs defaultValue="buttons" className="w-full">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3 mb-6 overflow-x-auto scrollbar-none">
            <TabsList className="bg-zinc-900/60 border border-zinc-800 p-1">
              <TabsTrigger value="buttons" className="gap-2 px-4">
                <Sliders className="size-4" />
                Buttons
              </TabsTrigger>
              <TabsTrigger value="inputs" className="gap-2 px-4">
                <FileText className="size-4" />
                Inputs & Text
              </TabsTrigger>
              <TabsTrigger value="cards" className="gap-2 px-4">
                <Layers className="size-4" />
                Cards
              </TabsTrigger>
              <TabsTrigger value="overlays" className="gap-2 px-4">
                <Maximize2 className="size-4" />
                Dialogs
              </TabsTrigger>
              <TabsTrigger value="scrollarea" className="gap-2 px-4">
                <HelpCircle className="size-4" />
                Scroll Area
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 1. BUTTONS TAB */}
          <TabsContent value="buttons" className="space-y-6 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Variant Showcase Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Button Variants</CardTitle>
                  <CardDescription>All primary visual styles for action triggers.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link Style</Button>
                </CardContent>
              </Card>

              {/* Sizes and States Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Sizes & Icon Triggers</CardTitle>
                  <CardDescription>Different size variations and embedded icon buttons.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="xs" variant="outline">Extra Small</Button>
                    <Button size="sm" variant="outline">Small</Button>
                    <Button size="default" variant="outline">Default Size</Button>
                    <Button size="lg" variant="outline">Large Size</Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="icon-xs" variant="secondary">
                      <Plus />
                    </Button>
                    <Button size="icon-sm" variant="outline">
                      <Settings />
                    </Button>
                    <Button size="icon" variant="default">
                      <Terminal />
                    </Button>
                    <Button size="icon-lg" variant="destructive">
                      <Trash2 />
                    </Button>
                    <Button variant="default" className="gap-2">
                      <Plus className="size-4" />
                      Add Item
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* 2. INPUTS TAB */}
          <TabsContent value="inputs" className="space-y-6 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Text Input Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Text Input Fields</CardTitle>
                  <CardDescription>Single-line text entry primitives.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Default Input</label>
                    <Input 
                      placeholder="Type something here..." 
                      value={inputValue} 
                      onChange={(e) => setInputValue(e.target.value)} 
                    />
                    {inputValue && (
                      <p className="text-xs text-purple-400">Live preview: {inputValue}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Disabled Input</label>
                    <Input placeholder="You cannot type here" disabled />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Invalid Input (Error State)</label>
                    <Input placeholder="Invalid field value" aria-invalid="true" />
                    <p className="text-xs text-rose-400 flex items-center gap-1">
                      <AlertCircle className="size-3.5" />
                      This input contains an error.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Textarea Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Textarea Input</CardTitle>
                  <CardDescription>Multi-line input components with support for height-autoscaling.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Comment or Codeblock</label>
                    <Textarea 
                      placeholder="Type multiline comments or code notes..." 
                      rows={4}
                      value={textareaValue}
                      onChange={(e) => setTextareaValue(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Disabled Textarea</label>
                    <Textarea placeholder="Read-only block content" disabled />
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* 3. CARDS TAB */}
          <TabsContent value="cards" className="space-y-6 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Default Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Standard Card</CardTitle>
                  <CardDescription>Default size with action item.</CardDescription>
                  <CardAction>
                    <Button variant="ghost" size="icon-sm">
                      <Info className="size-4 text-zinc-400" />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300 leading-relaxed text-sm">
                    This is a standard card component. It supports full layout controls, actions, descriptions, content grids, and headers.
                  </p>
                </CardContent>
                <CardFooter className="justify-between border-t border-zinc-800/50 pt-4 mt-2">
                  <span className="text-xs text-zinc-500">Last updated today</span>
                  <Button variant="secondary" size="xs">Explore</Button>
                </CardFooter>
              </Card>

              {/* Compact Card */}
              <Card size="sm">
                <CardHeader>
                  <CardTitle>Compact Card</CardTitle>
                  <CardDescription>Tighter spacing for panels.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300 leading-relaxed text-xs">
                    This card uses tighter padding (`size="sm"`), making it perfect for dashboard side panels, data feeds, settings bars, and sidebar content.
                  </p>
                </CardContent>
                <CardFooter className="border-t border-zinc-800/50 pt-3">
                  <Button variant="outline" size="xs" className="w-full">Action</Button>
                </CardFooter>
              </Card>

              {/* Status Alert Card */}
              <Card className="border border-purple-500/20 bg-purple-500/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-purple-400" />
                    <CardTitle className="text-purple-300">System Integration</CardTitle>
                  </div>
                  <CardDescription className="text-purple-400/70">Success status report.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-200/90 leading-relaxed text-sm">
                    Design system setup completed. Theme tokens and utility functions are initialized without errors.
                  </p>
                </CardContent>
                <CardFooter className="border-t border-purple-500/10 pt-4 mt-2">
                  <Button variant="link" size="xs" className="text-purple-300 hover:text-purple-200 p-0">
                    View Logs &rarr;
                  </Button>
                </CardFooter>
              </Card>

            </div>
          </TabsContent>

          {/* 4. OVERLAYS TAB */}
          <TabsContent value="overlays" className="space-y-6 focus-visible:outline-none">
            <Card className="max-w-xl mx-auto">
              <CardHeader>
                <CardTitle>Modals & Overlays</CardTitle>
                <CardDescription>Radix-powered overlay boxes for action flows.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-8 gap-4 border border-dashed border-zinc-800 rounded-lg">
                <Maximize2 className="size-8 text-zinc-500 mb-2" />
                <p className="text-sm text-zinc-400 text-center">
                  Press the button below to test our accessibility-compliant Radix Dialog overlay.
                </p>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" className="bg-purple-600 hover:bg-purple-500 text-white border-purple-700">
                      Open Modal Overlay
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Operation</DialogTitle>
                      <DialogDescription>
                        This is a sample Dialog modal. Focus trap, key listeners, overlay dimming, and viewport sizing are handled automatically.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <p className="text-sm text-zinc-300">
                        Would you like to sync workspace changes with the mock configuration?
                      </p>
                      <Input placeholder="Enter details..." />
                    </div>
                    <DialogFooter showCloseButton>
                      <Button 
                        variant="default" 
                        onClick={() => setIsDialogOpen(false)}
                        className="bg-purple-600 hover:bg-purple-500 text-white"
                      >
                        Confirm Sync
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 5. SCROLL AREA TAB */}
          <TabsContent value="scrollarea" className="space-y-6 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Custom Scroll Bar Showcase */}
              <Card>
                <CardHeader>
                  <CardTitle>Scroll Area Component</CardTitle>
                  <CardDescription>Custom styling scrollbar matching the dark theme layout.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64 border border-zinc-800 rounded-lg p-4 bg-zinc-950/80">
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-purple-400">Design System Specifications</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        1. Typography: The system utilizes Geist Sans for standard user interface text elements, and Geist Mono for technical output.
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        2. Color Hierarchy: Core colors are dark base tones. Page background uses `var(--background)` while surfaces use cards or popover variables. Accent highlights are constructed with violet properties.
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        3. Custom Components: All added UI primitive components are verified to load inside Next.js pages without layout shifts or light-mode color bleeding.
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        4. Build Constraints: Standard compilations require complete TypeScript evaluation and CSS variables inclusion.
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        5. Responsiveness: Standard layouts must scale from compact mobile displays to wide desktop canvases. Grid spacing adapts fluidly.
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        6. Verification Routes: Interactive pages display each primitive layout, variant states, disabled items, alerts, overlays, text entries, and list items.
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Done. Verification checklist passes.
                      </p>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Dynamic list rendering under ScrollArea */}
              <Card>
                <CardHeader>
                  <CardTitle>Data List Feed</CardTitle>
                  <CardDescription>List items in a compact scroll viewport.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64 border border-zinc-800 rounded-lg bg-zinc-950/80">
                    <div className="divide-y divide-zinc-800/60">
                      {Array.from({ length: 15 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 hover:bg-zinc-900/60 transition-colors">
                          <div className="size-2.5 rounded-full bg-purple-500" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-zinc-300">Activity Item #{index + 1}</p>
                            <p className="text-[10px] text-zinc-500">Triggered trigger status event</p>
                          </div>
                          <span className="text-[10px] text-zinc-600">3m ago</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

            </div>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
