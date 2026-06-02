import type { DelamainPeer } from "@t3tools/contracts";

const ACTIVE_PEER_STATUSES = new Set(["pending", "running", "blocked", "waiting", "frozen"]);

function normalizePath(path: string | null | undefined): string | null {
  if (!path) return null;
  const trimmed = path.trim();
  if (trimmed.length === 0) return null;
  return trimmed.replace(/\/+$/, "") || "/";
}

function peerSortValue(peer: DelamainPeer): string {
  return peer.updatedAt ?? peer.startedAt ?? "";
}

function pathWithin(rootPath: string, candidatePath: string): boolean {
  return candidatePath === rootPath || candidatePath.startsWith(`${rootPath}/`);
}

export function sortDelamainPeers(left: DelamainPeer, right: DelamainPeer): number {
  const leftActive = ACTIVE_PEER_STATUSES.has(left.status) ? 1 : 0;
  const rightActive = ACTIVE_PEER_STATUSES.has(right.status) ? 1 : 0;
  if (leftActive !== rightActive) return rightActive - leftActive;
  return peerSortValue(right).localeCompare(peerSortValue(left));
}

export function filterDelamainPeersForRepo(
  peers: ReadonlyArray<DelamainPeer>,
  repoRoot: string | null | undefined,
): Array<DelamainPeer> {
  const normalizedRepoRoot = normalizePath(repoRoot);
  if (!normalizedRepoRoot) {
    return [];
  }

  return peers.filter((peer) => {
    const sourceRepo = normalizePath(peer.sourceRepo);
    if (sourceRepo) {
      return sourceRepo === normalizedRepoRoot;
    }

    const worktreePath = normalizePath(peer.worktreePath);
    return worktreePath ? pathWithin(normalizedRepoRoot, worktreePath) : false;
  });
}

export function delamainStatusClassName(peer: DelamainPeer): string {
  if (peer.status === "done" || peer.status === "completed") {
    return "bg-emerald-500/10 text-emerald-500";
  }
  if (peer.status === "failed" || peer.status === "killed" || peer.status === "halted") {
    return "bg-destructive/10 text-destructive";
  }
  if (peer.status === "waiting" || peer.status === "blocked" || peer.status === "frozen") {
    return "bg-amber-500/10 text-amber-500";
  }
  if (peer.status === "running" || peer.status === "pending") {
    return "bg-blue-500/10 text-blue-400";
  }
  return "bg-muted text-muted-foreground";
}

export function formatDelamainPathLabel(path: string | null): string | null {
  if (!path) return null;
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return path;
  return parts.slice(-2).join("/");
}
