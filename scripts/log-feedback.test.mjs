import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const script = join(dirname(fileURLToPath(import.meta.url)), "log-feedback.mjs");

function run(args, { env = {}, input = "" } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "feedback-"));
  const file = join(dir, "feedback.jsonl");
  const runOnce = (a, i = "") =>
    execFileSync("node", [script, ...a], {
      encoding: "utf8",
      input: i,
      env: { ...process.env, SKILL_FEEDBACK_FILE: file, ...env },
    });
  return { file, runOnce, runArgs: args };
}

test("lesson is appended as JSONL", () => {
  const { file, runOnce } = run([]);
  runOnce(["--lesson", "Use Field not Label"]);
  const rows = readFileSync(file, "utf8").trim().split("\n").map(JSON.parse);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].kind, "lesson");
  assert.equal(rows[0].scope, "global");
  assert.equal(rows[0].lesson, "Use Field not Label");
});

test("duplicate lesson is not appended twice", () => {
  const { file, runOnce } = run([]);
  runOnce(["--lesson", "Use Field not Label"]);
  runOnce(["--lesson", "use   field not label"]);
  assert.equal(readFileSync(file, "utf8").trim().split("\n").length, 1);
});

test("project-only scope is preserved", () => {
  const { file, runOnce } = run([]);
  runOnce(["--lesson", "This repo uses npm", "--scope", "project-only"]);
  const row = JSON.parse(readFileSync(file, "utf8").trim());
  assert.equal(row.scope, "project-only");
});

test("bad existing lines are tolerated", () => {
  const { file, runOnce } = run([]);
  writeFileSync(file, "not json\n");
  runOnce(["--lesson", "ok"]);
  const lines = readFileSync(file, "utf8").trim().split("\n");
  assert.equal(lines.length, 2);
  assert.equal(JSON.parse(lines[1]).lesson, "ok");
});

test("hook captures frontend files inside untracked directories", () => {
  const { file, runOnce } = run([]);
  const repo = mkdtempSync(join(tmpdir(), "feedback-repo-"));
  execFileSync("git", ["init", "-q"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "t@t.t"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "t"], { cwd: repo });
  writeFileSync(join(repo, "seed.txt"), "x");
  execFileSync("git", ["add", "."], { cwd: repo });
  execFileSync("git", ["commit", "-qm", "init"], { cwd: repo });
  // New route in a fully untracked dir: default porcelain shows only the dir.
  mkdirSync(join(repo, "app", "(auth)", "login"), { recursive: true });
  writeFileSync(join(repo, "app", "(auth)", "login", "login-form.tsx"), "x");
  runOnce(["--hook"], JSON.stringify({ cwd: repo, hook_event_name: "Stop" }));
  const rows = readFileSync(file, "utf8").trim().split("\n").map(JSON.parse);
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0].files, ["app/(auth)/login/login-form.tsx"]);
});

test("hook with no frontend changes writes nothing", () => {
  const { file, runOnce } = run([]);
  runOnce(["--hook"], JSON.stringify({ cwd: "/tmp", hook_event_name: "Stop" }));
  assert.throws(() => readFileSync(file, "utf8"));
});
