import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isValidWorkspaceSlug, normalizeWorkspaceSlug, slugifyFromName } from "@/lib/slug";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.membership.findMany({
    where: { userId: session.user.id },
    include: {
      workspace: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { workspace: { name: "asc" } },
  });

  return NextResponse.json({
    workspaces: rows.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      role: m.role,
    })),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string; slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name || name.length < 2 || name.length > 80) {
    return NextResponse.json({ error: "Workspace name must be 2–80 characters" }, { status: 400 });
  }

  let slug = body.slug?.trim() ? normalizeWorkspaceSlug(body.slug) : slugifyFromName(name);
  if (!isValidWorkspaceSlug(slug)) {
    slug = slugifyFromName(name);
  }

  const existing = await prisma.workspace.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`.slice(0, 48);
    if (!isValidWorkspaceSlug(slug)) {
      return NextResponse.json({ error: "Could not allocate a unique slug" }, { status: 409 });
    }
  }

  const ws = await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: { name, slug },
    });
    await tx.membership.create({
      data: { userId: session.user.id, workspaceId: workspace.id, role: "owner" },
    });
    await tx.channel.create({
      data: { workspaceId: workspace.id, name: "general" },
    });
    return workspace;
  });

  return NextResponse.json({
    workspace: { id: ws.id, name: ws.name, slug: ws.slug },
  });
}
