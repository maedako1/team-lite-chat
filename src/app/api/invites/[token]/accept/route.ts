import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ token: string }> };

export async function POST(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await params;

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { workspace: { select: { id: true, slug: true } } },
  });

  if (!invite) {
    return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 410 });
  }

  await prisma.membership.upsert({
    where: {
      userId_workspaceId: { userId: session.user.id, workspaceId: invite.workspaceId },
    },
    create: {
      userId: session.user.id,
      workspaceId: invite.workspaceId,
      role: "member",
    },
    update: {},
  });

  return NextResponse.json({
    workspaceSlug: invite.workspace.slug,
  });
}
