import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: {
        ownerId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/projects:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      body = {};
    }

    const { id, name, description } = body;
    
    // Default missing project name to 'Untitled Project'
    const projectName = typeof name === "string" && name.trim() !== "" ? name.trim() : "Untitled Project";

    const project = await prisma.project.create({
      data: {
        id: typeof id === "string" && id.trim() !== "" ? id.trim() : undefined,
        name: projectName,
        description: typeof description === "string" ? description.trim() : null,
        ownerId: userId,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/projects:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
