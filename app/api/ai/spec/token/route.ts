import { NextRequest, NextResponse } from "next/server";
import { getUserIdentity } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import { auth } from "@trigger.dev/sdk";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const { userId } = await getUserIdentity();
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

    const { runId } = body;

    // Validate inputs
    if (typeof runId !== "string" || runId.trim() === "") {
      return NextResponse.json({ error: "Run ID is required" }, { status: 400 });
    }

    // 3. Retrieve task run record to check ownership
    const taskRun = await prisma.taskRun.findUnique({
      where: {
        runId: runId.trim(),
      },
    });

    if (!taskRun) {
      return NextResponse.json({ error: "Task run not found" }, { status: 404 });
    }

    // 4. Verify that this run belongs to the authenticated user
    if (taskRun.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 5. Generate a Trigger.dev public access token scoped to read that specific run with 1 hour expiration
    const publicAccessToken = await auth.createPublicToken({
      scopes: {
        read: {
          runs: [runId.trim()],
        },
      },
      expirationTime: "1h",
    });

    // 6. Return the scoped access token to the client
    return NextResponse.json({ token: publicAccessToken }, { status: 200 });

  } catch (error) {
    console.error("Error in POST /api/ai/spec/token:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
