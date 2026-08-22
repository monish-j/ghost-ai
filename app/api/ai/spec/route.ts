import { NextRequest, NextResponse } from "next/server";
import { getUserIdentity, hasProjectAccess } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import { tasks } from "@trigger.dev/sdk";
import type { generateSpec } from "@/trigger/generate-spec";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const { userId, email } = await getUserIdentity();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request payload
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { roomId, chatHistory, nodes, edges } = body;

    // Validate inputs
    if (typeof roomId !== "string" || roomId.trim() === "") {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
    }
    if (!Array.isArray(chatHistory)) {
      return NextResponse.json({ error: "Chat history must be an array" }, { status: 400 });
    }
    if (!Array.isArray(nodes)) {
      return NextResponse.json({ error: "Nodes must be an array" }, { status: 400 });
    }
    if (!Array.isArray(edges)) {
      return NextResponse.json({ error: "Edges must be an array" }, { status: 400 });
    }

    // 3. Verify user project access permissions using roomId
    const project = await hasProjectAccess(roomId, userId, email);
    if (!project) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4. Trigger Trigger.dev spec task using type-only trigger
    const handle = await tasks.trigger<typeof generateSpec>(
      "generate-spec",
      {
        projectId: project.id,
        roomId: roomId.trim(),
        chatHistory,
        nodes,
        edges,
      }
    );

    // 5. Create TaskRun database entry to track and verify ownership later
    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId: project.id,
        userId: userId,
      },
    });

    // 6. Return Trigger.dev run ID
    return NextResponse.json({ runId: handle.id }, { status: 200 });

  } catch (error) {
    console.error("Error in POST /api/ai/spec:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
