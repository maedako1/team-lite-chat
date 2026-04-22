import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const MAX_BODY = 8000;

type Params = { params: Promise<{ channelId: string }> };

async function channelForUser(channelId: string, userId: string) {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    include: {
      workspace: {
        include: {
          memberships: { where: { userId } },
        },
      },
    },
  });
  if (!channel || channel.workspace.memberships.length === 0) return null;
  return channel;
}

export async function GET(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { channelId } = await params;
  const channel = await channelForUser(channelId, session.user.id);
  if (!channel) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const sinceRaw = searchParams.get("since");
  let since: Date | undefined;
  if (sinceRaw) {
    const d = new Date(sinceRaw);
    if (!Number.isNaN(d.getTime())) since = d;
  }

  if (since) {
    const messages = await prisma.message.findMany({
      where: { channelId, createdAt: { gt: since } },
      orderBy: { createdAt: "asc" },
      take: 500,
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
    return NextResponse.json({ messages });
  }

  const messages = await prisma.message.findMany({
    where: { channelId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });

  messages.reverse();

  return NextResponse.json({ messages });
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { channelId } = await params;
  const channel = await channelForUser(channelId, session.user.id);
  if (!channel) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = typeof body.body === "string" ? body.body : "";
  if (!text.trim()) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }
  if (text.length > MAX_BODY) {
    return NextResponse.json({ error: `Message too long (max ${MAX_BODY})` }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      channelId,
      authorId: session.user.id,
      body: text.trim(),
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ message });
}
