import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export interface UserIdentity {
  userId: string | null;
  email: string | null;
}

/**
 * Retrieves the current authenticated Clerk user identity (userId and primary email).
 */
export async function getUserIdentity(): Promise<UserIdentity> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { userId: null, email: null };
    }

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress || null;

    return { userId, email };
  } catch (error) {
    console.error("Error fetching user identity:", error);
    return { userId: null, email: null };
  }
}

/**
 * Checks if the user has access to the project.
 * Returns the project object if the user is the owner or a collaborator.
 * Returns null if the project does not exist or the user has no access.
 */
export async function hasProjectAccess(
  projectId: string,
  userId: string,
  email: string | null
) {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        collaborators: true,
      },
    });

    if (!project) {
      return null;
    }

    // 1. Check if the user is the owner of the project
    if (project.ownerId === userId) {
      return project;
    }

    // 2. Check if the user's primary email matches any project collaborator's email
    if (email) {
      const isCollaborator = project.collaborators.some(
        (collaborator: { email: string }) =>
          collaborator.email.toLowerCase() === email.toLowerCase()
      );
      if (isCollaborator) {
        return project;
      }
    }

    return null;
  } catch (error) {
    console.error("Error checking project access:", error);
    return null;
  }
}
