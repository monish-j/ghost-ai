import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProjectsForUser } from "@/lib/projects";
import { EditorHomeClient } from "@/components/editor/editor-home-client";
import { Project } from "@/lib/hooks/use-project-actions";

export default async function EditorPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress || "";

  const { myProjects, sharedProjects } = await getProjectsForUser(userId, email);

  // Map database project schema to the client UI Project interface
  const mappedMyProjects: Project[] = myProjects.map((p: { id: string; name: string }) => ({
    id: p.id,
    name: p.name,
    slug: p.id,
    isOwner: true,
  }));

  const mappedSharedProjects: Project[] = sharedProjects.map((p: { id: string; name: string }) => ({
    id: p.id,
    name: p.name,
    slug: p.id,
    isOwner: false,
  }));

  return (
    <EditorHomeClient
      initialMyProjects={mappedMyProjects}
      initialSharedProjects={mappedSharedProjects}
    />
  );
}
