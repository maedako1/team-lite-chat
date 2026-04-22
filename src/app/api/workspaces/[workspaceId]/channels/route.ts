import { auth } from "@/auth";
import { isValidChannelName, normalizeChannelName } from "@/lib/channel-name";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ workspaceId: string }> };

async function requireMember(workspaceId: string, userId: string) {
  return prisma.membership.findFirst({
    where: { workspaceId, userId },
  });
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId } = await params;
  const m = await requireMember(workspaceId, session.user.id);
  if (!m) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const channels = await prisma.channel.findMany({
    where: { workspaceId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return NextResponse.json({ channels });
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId } = await params;
  const m = await requireMember(workspaceId, session.user.id);
  if (!m) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = normalizeChannelName(body.name ?? "");
  if (!name || !isValidChannelName(name)) {
    return NextResponse.json(
      { error: "Channel name must match ^[a-z0-9][a-z0-9-]{0,78}$" },
      { status: 400 },
    );
  }

  try {
    const channel = await prisma.channel.create({
      data: { workspaceId, name },
      select: { id: true, name: true },
    });
    return NextResponse.json({ channel });
  } catch {
    return NextResponse.json({ error: "Channel already exists" }, { status: 409 });
  }
}
