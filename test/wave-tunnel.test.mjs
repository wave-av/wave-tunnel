import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(here, "..", "src", "wave-tunnel.mjs");

test("--help prints usage and exits 0", () => {
  const out = execFileSync(process.execPath, [CLI, "--help"], { encoding: "utf8" });
  assert.match(out, /wave-tunnel - token-addressed/);
  assert.match(out, /Exit codes: 0 success/);
});

test("no args prints usage to stderr and exits 1", () => {
  try {
    execFileSync(process.execPath, [CLI], { encoding: "utf8", stdio: "pipe" });
    assert.fail("should have exited non-zero");
  } catch (e) {
    assert.equal(e.status, 1);
    assert.match(e.stderr, /Usage:/);
  }
});

test("dial without a token exits 1 with a named refusal", () => {
  try {
    execFileSync(process.execPath, [CLI, "dial"], { encoding: "utf8", stdio: "pipe" });
    assert.fail("should have exited non-zero");
  } catch (e) {
    assert.equal(e.status, 1);
    assert.match(e.stderr, /dial <token>/);
  }
});

test("ping without a token exits 1 with a named refusal", () => {
  try {
    execFileSync(process.execPath, [CLI, "ping"], { encoding: "utf8", stdio: "pipe" });
    assert.fail("should have exited non-zero");
  } catch (e) {
    assert.equal(e.status, 1);
    assert.match(e.stderr, /ping <token>/);
  }
});

test("the store path is home-anchored, never a literal path", () => {
  const src = execFileSync("grep", ["-q", "homedir()", resolve(here, "..", "src", "wave-tunnel.mjs")], { encoding: "utf8" }).status ?? 0;
  assert.equal(src, 0);
});
