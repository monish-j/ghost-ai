import { prisma } from "@/lib/prisma";

/**
 * Fetches all projects owned by the user, and all projects where the user is a collaborator.
 */
export async function getProjectsForUser(userId: string, email: string) {
  const myProjects = await prisma.project.findMany({
    where: {
      ownerId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const sharedProjects = email
    ? await prisma.project.findMany({
        where: {
          collaborators: {
            some: {
              email: email,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : [];

  return {
    myProjects,
    sharedProjects,
  };
}
