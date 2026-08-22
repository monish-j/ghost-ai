import { NextRequest, NextResponse } from "next/server";
import { getUserIdentity, hasProjectAccess } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import { tasks, auth } from "@trigger.dev/sdk";
import type { designAgent } from "@/trigger/design-agent";

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

    const { prompt, roomId } = body;
    const projectId = body.projectId || roomId;

    // Validate inputs
    if (typeof prompt !== "string" || prompt.trim() === "") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    if (typeof roomId !== "string" || roomId.trim() === "") {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
    }
    if (typeof projectId !== "string" || projectId.trim() === "") {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    // 3. Verify user project access permissions
    const project = await hasProjectAccess(projectId, userId, email);
    if (!project) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4. Trigger Trigger.dev design task using type-only trigger
    const handle = await tasks.trigger<typeof designAgent>(
      "design-agent",
      {
        prompt: prompt.trim(),
        roomId: roomId.trim(),
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

    // 6. Generate Trigger.dev public access token scoped to read that specific run
    const publicToken = await auth.createPublicToken({
      scopes: {
        read: {
          runs: [handle.id],
        },
      },
    });

    // 7. Return Trigger.dev run ID and public token
    return NextResponse.json({ runId: handle.id, publicToken }, { status: 200 });

  } catch (error) {
    console.error("Error in POST /api/ai/design:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
