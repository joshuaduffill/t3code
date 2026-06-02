import { describe, expect, it } from "vitest";
import type { DelamainPeer } from "@t3tools/contracts";

import { filterDelamainPeersForRepo } from "./delamainPeers";

function makePeer(overrides: Partial<DelamainPeer>): DelamainPeer {
  return {
    id: "peer-1",
    name: null,
    engine: "codex",
    model: null,
    status: "running",
    rawStatus: "running",
    integrationStatus: null,
    sourceRepo: null,
    worktreePath: null,
    branch: null,
    baseBranch: null,
    mergeBranch: null,
    prUrl: null,
    task: null,
    lastEvent: null,
    startedAt: null,
    updatedAt: null,
    finishedAt: null,
    ...overrides,
  };
}

describe("filterDelamainPeersForRepo", () => {
  it("returns only peers whose source repo matches the active repo", () => {
    const peers = [
      makePeer({ id: "matching", sourceRepo: "/repo/app" }),
      makePeer({ id: "other", sourceRepo: "/repo/other" }),
    ];

    expect(filterDelamainPeersForRepo(peers, "/repo/app").map((peer) => peer.id)).toEqual([
      "matching",
    ]);
  });

  it("falls back to worktree paths when source repo is unavailable", () => {
    const peers = [
      makePeer({ id: "inside", worktreePath: "/repo/app/worktrees/feature-a" }),
      makePeer({ id: "outside", worktreePath: "/repo/other/worktrees/feature-b" }),
    ];

    expect(filterDelamainPeersForRepo(peers, "/repo/app").map((peer) => peer.id)).toEqual([
      "inside",
    ]);
  });

  it("returns no peers when the active repo root is missing", () => {
    const peers = [makePeer({ id: "matching", sourceRepo: "/repo/app" })];

    expect(filterDelamainPeersForRepo(peers, null)).toEqual([]);
  });
});
