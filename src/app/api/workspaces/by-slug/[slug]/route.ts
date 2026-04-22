import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: {
      channels: { orderBy: { name: "asc" }, select: { id: true, name: true } },
      memberships: {
        where: { userId: session.user.id },
        select: { id: true, role: true },
      },
    },
  });

  if (!workspace || workspace.memberships.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    workspace: {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      role: workspace.memberships[0].role,
      channels: workspace.channels,
    },
  });
}
