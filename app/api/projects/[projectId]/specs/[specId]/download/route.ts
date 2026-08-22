import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getUserIdentity, hasProjectAccess } from "@/lib/project-access";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; specId: string }> }
) {
  try {
    // 1. Authenticate user
    const { userId, email } = await getUserIdentity();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, specId } = await params;
    if (!projectId || !specId) {
      return NextResponse.json(
        { error: "Project ID and Spec ID are required" },
        { status: 400 }
      );
    }

    // 2. Verify access to the project
    const project = await hasProjectAccess(projectId, userId, email);
    if (!project) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Verify the spec belongs to that project
    const spec = await prisma.projectSpec.findUnique({
      where: { id: specId },
    });

    if (!spec || spec.projectId !== projectId) {
      return NextResponse.json({ error: "Spec not found" }, { status: 404 });
    }

    // 4. Fetch the file using ProjectSpec.filePath
    let result;
    try {
      result = await get(spec.filePath, {
        access: "private",
      });
    } catch (err) {
      console.error("Error retrieving spec from Vercel Blob:", err);
      return NextResponse.json(
        { error: "Failed to retrieve spec content" },
        { status: 500 }
      );
    }

    if (!result || !result.stream) {
      return NextResponse.json(
        { error: "Failed to retrieve spec stream" },
        { status: 500 }
      );
    }

    // 5. Return it as a downloadable Markdown file
    const safeFileName = `${project.name.replace(/[^a-zA-Z0-9-_]/g, "_") || "spec"}.md`;

    return new Response(result.stream as any, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="${safeFileName}"`,
      },
    });
  } catch (error) {
    console.error(
      "Error in GET /api/projects/[projectId]/specs/[specId]/download:",
      error
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
