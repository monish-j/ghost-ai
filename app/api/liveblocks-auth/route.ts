import { NextRequest, NextResponse } from "next/server";
import { getUserIdentity, hasProjectAccess } from "@/lib/project-access";
import { liveblocks, getUserColor } from "@/lib/liveblocks";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    // 1. Require Clerk authentication
    const { userId, email } = await getUserIdentity();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the room parameter from request body
    let room: string;
    try {
      const body = await request.json();
      room = body.room;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!room) {
      return NextResponse.json({ error: "Missing room parameter" }, { status: 400 });
    }

    // 2. Verify project access using the existing access helper
    const project = await hasProjectAccess(room, userId, email);
    if (!project) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the current Clerk user details for enrichment
    const clerkUser = await currentUser();
    const displayName = clerkUser
      ? `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
        clerkUser.username ||
        email ||
        `User ${userId.slice(-4)}`
      : email || `User ${userId.slice(-4)}`;

    const avatarUrl = clerkUser?.imageUrl || "";
    const cursorColor = getUserColor(userId);

    // 3. Ensure the Liveblocks room exists (create only if needed)
    try {
      await liveblocks.getOrCreateRoom(room, {
        defaultAccesses: [], // Private by default
      });
    } catch (error) {
      // Log the error but proceed. Sometimes the room already exists and has different settings,
      // or there's a temporary issue, but authorizing the session token should still be attempted.
      console.error(`Error in getOrCreateRoom for room ${room}:`, error);
    }

    // Ensure the required feeds exist in the room
    try {
      await liveblocks.createFeed({
        roomId: room,
        feedId: "ai-chat",
      });
    } catch (error) {
      // Ignore if feed already exists
    }

    try {
      await liveblocks.createFeed({
        roomId: room,
        feedId: "ai-status-feed",
      });
    } catch (error) {
      // Ignore if feed already exists
    }

    // 4. Return a session token with userInfo attached
    const session = liveblocks.prepareSession(userId, {
      userInfo: {
        name: displayName,
        avatar: avatarUrl,
        color: cursorColor,
      },
    });

    // Authorize full access to this specific room
    session.allow(room, session.FULL_ACCESS);

    const { status, body } = await session.authorize();
    return new Response(body, {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in POST /api/liveblocks-auth:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
