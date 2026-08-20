import { redirect } from "next/navigation";
import { getUserIdentity, hasProjectAccess } from "@/lib/project-access";
import { getProjectsForUser } from "@/lib/projects";
import { AccessDenied } from "@/components/editor/access-denied";
import { EditorWorkspaceClient } from "@/components/editor/editor-workspace-client";
import { Project } from "@/lib/hooks/use-project-actions";

interface PageProps {
  params: Promise<{ roomId: string }>;
}

export default async function WorkspacePage({ params }: PageProps) {
  const { roomId } = await params;

  // 1. Get Clerk user identity
  const { userId, email } = await getUserIdentity();
  if (!userId) {
    redirect("/sign-in");
  }

  // 2. Check project existence & user access permissions
  const project = await hasProjectAccess(roomId, userId, email);
  if (!project) {
    return <AccessDenied />;
  }

  // 3. Fetch all user projects (owned + shared) for the left sidebar navigation
  const { myProjects, sharedProjects } = await getProjectsForUser(
    userId,
    email || ""
  );

  // 4. Map projects to UI interfaces
  const mappedMyProjects: Project[] = myProjects.map((p: { id: string; name: string; ownerId: string }) => ({
    id: p.id,
    name: p.name,
    slug: p.id,
    isOwner: p.ownerId === userId,
  }));

  const mappedSharedProjects: Project[] = sharedProjects.map((p: { id: string; name: string; ownerId: string }) => ({
    id: p.id,
    name: p.name,
    slug: p.id,
    isOwner: p.ownerId === userId,
  }));

  return (
    <EditorWorkspaceClient
      currentProject={{
        id: project.id,
        name: project.name,
        isOwner: project.ownerId === userId,
        canvasJsonPath: project.canvasJsonPath,
      }}
      initialMyProjects={mappedMyProjects}
      initialSharedProjects={mappedSharedProjects}
    />
  );
}
