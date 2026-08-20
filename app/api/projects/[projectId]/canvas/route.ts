import { NextRequest, NextResponse } from "next/server";
import { put, del, get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getUserIdentity, hasProjectAccess } from "@/lib/project-access";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId, email } = await getUserIdentity();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const project = await hasProjectAccess(projectId, userId, email);
    if (!project) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!project.canvasJsonPath) {
      // Return empty nodes/edges if no saved state exists yet
      return NextResponse.json({ nodes: [], edges: [] }, { status: 200 });
    }

    // Fetch the JSON from the private Vercel Blob URL using SDK get()
    try {
      const result = await get(project.canvasJsonPath, {
        access: "private",
      });
      
      if (!result || !result.stream) {
        return NextResponse.json({ error: "Failed to retrieve canvas from blob store" }, { status: 500 });
      }
      
      return new Response(result.stream as any, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (fetchError) {
      console.error("Error fetching canvas from Vercel Blob:", fetchError);
      return NextResponse.json({ nodes: [], edges: [] }, { status: 200 });
    }
  } catch (error) {
    console.error("Error in GET /api/projects/[projectId]/canvas:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId, email } = await getUserIdentity();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const project = await hasProjectAccess(projectId, userId, email);
    if (!project) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { nodes, edges } = body;

    // Convert canvas to string
    const canvasString = JSON.stringify({ nodes, edges });

    // Upload to Vercel Blob using private access configuration
    const blob = await put(`canvas-${projectId}.json`, canvasString, {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: true,
    });

    // Store the new blob URL on the Prisma project record
    await prisma.project.update({
      where: { id: projectId },
      data: {
        canvasJsonPath: blob.url,
      },
    });

    // Clean up the old blob if it exists and is different
    if (project.canvasJsonPath && project.canvasJsonPath !== blob.url) {
      try {
        await del(project.canvasJsonPath);
      } catch (err) {
        console.error("Error deleting old canvas blob:", err);
      }
    }

    return NextResponse.json({ success: true, url: blob.url }, { status: 200 });
  } catch (error) {
    console.error("Error in PUT /api/projects/[projectId]/canvas:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
