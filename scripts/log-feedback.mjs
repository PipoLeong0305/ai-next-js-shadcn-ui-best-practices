#!/usr/bin/env node
// Records skill feedback as JSONL outside the plugin cache so reinstalls keep it.
// Two entry points: --lesson "<text>" (semantic lesson, called by the agent) and
// --hook (mechanical signal, reads the hook payload from stdin).
// Every failure is silent: this script always exits 0 and never blocks the agent.
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

function feedbackFile() {
  return (
    process.env.SKILL_FEEDBACK_FILE ||
    join(homedir(), ".local", "share", "nextjs-shadcn-skill", "feedback.jsonl")
  );
}

function projectHash(cwd) {
  return createHash("sha256").update(cwd || "").digest("hex").slice(0, 12);
}

function normalize(text) {
  return String(text || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function append(entry) {
  const file = feedbackFile();
  let lines = [];
  if (existsSync(file)) {
    lines = readFileSync(file, "utf8").split("\n").filter(Boolean);
  }
  const key =
    entry.kind === "lesson"
      ? `lesson|${entry.scope}|${normalize(entry.lesson)}`
      : `signal|${entry.date}|${entry.project}|${(entry.files || []).join(",")}`;
  for (const line of lines) {
    try {
      const old = JSON.parse(line);
      const oldKey =
        old.kind === "lesson"
          ? `lesson|${old.scope}|${normalize(old.lesson)}`
          : `signal|${old.date}|${old.project}|${(old.files || []).join(",")}`;
      if (oldKey === key) return false;
    } catch {
      // Bad lines are tolerated and never treated as duplicates.
    }
  }
  mkdirSync(dirname(file), { recursive: true });
  appendFileSync(file, JSON.stringify(entry) + "\n");
  return true;
}

function changedFiles(cwd) {
  try {
    // --untracked-files=all: default porcelain collapses untracked dirs to
    // "dir/", hiding new .tsx files inside them from the filter below.
    const out = execFileSync("git", ["status", "--porcelain", "--untracked-files=all"], {
      cwd,
      encoding: "utf8",
      timeout: 5000,
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out
      .split("\n")
      .filter(Boolean)
      .map((l) => l.slice(3).trim())
      .filter((f) => /\.(tsx?|css)$/.test(f))
      .sort();
  } catch {
    return [];
  }
}

function main() {
  const args = process.argv.slice(2);
  const now = new Date();
  if (args.includes("--hook")) {
    let raw = "";
    process.stdin.on("data", (c) => (raw += c));
    process.stdin.on("end", () => {
      try {
        const payload = JSON.parse(raw || "{}");
        const cwd = payload.cwd || process.cwd();
        const files = changedFiles(cwd);
        if (files.length === 0) return;
        append({
          kind: "signal",
          date: now.toISOString().slice(0, 10),
          ts: now.toISOString(),
          event: payload.hook_event_name || payload.event || "Stop",
          agent: process.env.SKILL_FEEDBACK_AGENT || "unknown",
          project: projectHash(cwd),
          files,
        });
      } catch {
        // Silent by design.
      }
    });
    return;
  }
  const lessonIdx = args.indexOf("--lesson");
  if (lessonIdx >= 0 && args[lessonIdx + 1]) {
    const scopeIdx = args.indexOf("--scope");
    const scope =
      scopeIdx >= 0 && args[scopeIdx + 1] === "project-only"
        ? "project-only"
        : "global";
    const evIdx = args.indexOf("--evidence");
    append({
      kind: "lesson",
      ts: now.toISOString(),
      scope,
      agent: process.env.SKILL_FEEDBACK_AGENT || "unknown",
      project: projectHash(process.cwd()),
      lesson: args[lessonIdx + 1],
      evidence: evIdx >= 0 ? args[evIdx + 1] || "" : "",
    });
  }
}

try {
  main();
} catch {
  // Silent by design.
}
process.exitCode = 0;
