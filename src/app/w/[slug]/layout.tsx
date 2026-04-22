import { auth } from "@/auth";
import { InvitePanel } from "@/components/invite-panel";
import { NewChannelForm } from "@/components/new-channel-form";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { slug } = await params;
  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: {
      channels: { orderBy: { name: "asc" } },
      memberships: { where: { userId: session.user.id } },
    },
  });

  if (!workspace || workspace.memberships.length === 0) {
    notFound();
  }

  return (
    <div className="flex flex-1 min-h-0">
      <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 p-3">
          <Link href="/w" className="text-xs text-zinc-500 hover:text-zinc-300">
            ← 一覧
          </Link>
          <p className="mt-1 text-sm font-semibold text-white">{workspace.name}</p>
          <p className="text-xs text-zinc-500">/{workspace.slug}</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Channels</p>
          <ul className="space-y-0.5">
            {workspace.channels.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/w/${slug}/c/${c.name}`}
                  className="block rounded px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  # {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <NewChannelForm workspaceId={workspace.id} workspaceSlug={slug} />
        <InvitePanel workspaceId={workspace.id} />
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
