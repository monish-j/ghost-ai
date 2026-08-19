import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdentity, hasProjectAccess } from "@/lib/project-access";
import { createClerkClient } from "@clerk/nextjs/server";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { userId, email } = await getUserIdentity();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has access to the project (either as owner or collaborator)
    const project = await hasProjectAccess(projectId, userId, email);
    if (!project) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch collaborators from database
    const collaborators = await prisma.projectCollaborator.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });

    const emails = collaborators.map((c: { email: string }) => c.email);

    let clerkUsers: any[] = [];
    if (emails.length > 0) {
      try {
        const response = await clerk.users.getUserList({
          emailAddress: emails,
        });
        clerkUsers = response.data;
      } catch (clerkError) {
        console.error("Error querying Clerk users:", clerkError);
      }
    }

    // Map database records to enriched details from Clerk
    const enrichedCollaborators = collaborators.map((c: { id: string; email: string; createdAt: Date }) => {
      // Find Clerk user that has this email in their email address list
      const clerkUser = clerkUsers.find((u) =>
        u.emailAddresses.some(
          (e: { emailAddress: string }) =>
            e.emailAddress.toLowerCase() === c.email.toLowerCase()
        )
      );

      const displayName = clerkUser
        ? `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          clerkUser.username ||
          null
        : null;

      return {
        id: c.id,
        email: c.email,
        createdAt: c.createdAt,
        name: displayName,
        imageUrl: clerkUser?.imageUrl || null,
      };
    });

    return NextResponse.json(enrichedCollaborators, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/projects/[projectId]/collaborators:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { userId, email: currentUserEmail } = await getUserIdentity();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Verify current user is the owner of the project
    if (project.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { email } = body;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const targetEmail = email.trim().toLowerCase();

    // Owner cannot invite themselves
    if (currentUserEmail && targetEmail === currentUserEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "You cannot invite yourself as a collaborator" },
        { status: 400 }
      );
    }

    // Check if collaborator already exists
    const existing = await prisma.projectCollaborator.findUnique({
      where: {
        projectId_email: {
          projectId,
          email: targetEmail,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Collaborator already invited to this project" },
        { status: 400 }
      );
    }

    // Create the collaborator record
    const collaborator = await prisma.projectCollaborator.create({
      data: {
        projectId,
        email: targetEmail,
      },
    });

    return NextResponse.json(collaborator, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/projects/[projectId]/collaborators:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { userId } = await getUserIdentity();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Verify current user is the owner of the project
    if (project.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    let collaboratorId = searchParams.get("id");
    let collaboratorEmail = searchParams.get("email");

    // If search params are empty, check the body
    if (!collaboratorId && !collaboratorEmail) {
      try {
        const body = await request.json();
        collaboratorId = body.id;
        collaboratorEmail = body.email;
      } catch (e) {
        // Ignore JSON parse errors
      }
    }

    if (!collaboratorId && !collaboratorEmail) {
      return NextResponse.json(
        { error: "Collaborator ID or email is required" },
        { status: 400 }
      );
    }

    if (collaboratorId) {
      const exists = await prisma.projectCollaborator.findFirst({
        where: { id: collaboratorId, projectId },
      });
      if (!exists) {
        return NextResponse.json({ error: "Collaborator not found" }, { status: 404 });
      }

      await prisma.projectCollaborator.delete({
        where: { id: collaboratorId },
      });
    } else if (collaboratorEmail) {
      const targetEmail = collaboratorEmail.trim().toLowerCase();
      const exists = await prisma.projectCollaborator.findUnique({
        where: {
          projectId_email: {
            projectId,
            email: targetEmail,
          },
        },
      });
      if (!exists) {
        return NextResponse.json({ error: "Collaborator not found" }, { status: 404 });
      }

      await prisma.projectCollaborator.delete({
        where: {
          projectId_email: {
            projectId,
            email: targetEmail,
          },
        },
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/projects/[projectId]/collaborators:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
