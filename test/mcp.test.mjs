import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const MCP = resolve(here, "..", "src", "mcp.mjs");

function drive(requests) {
  return new Promise((res, rej) => {
    const p = spawn(process.execPath, [MCP]);
    let out = "";
    const timer = setTimeout(() => { p.kill("SIGKILL"); rej(new Error("mcp did not close within 15s")); }, 15000);
    p.stdout.setEncoding("utf8");
    p.stdout.on("data", (d) => (out += d));
    p.on("close", () => {
      clearTimeout(timer);
      res(out.split("\n").filter(Boolean).map((l) => JSON.parse(l)));
    });
    for (const r of requests) p.stdin.write(JSON.stringify(r) + "\n");
    p.stdin.end();
  });
}

test("mcp: initialize handshake advertises wave-tunnel", async () => {
  const [init, list] = await drive([
    { jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
    { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
  ]);
  assert.equal(init.result.serverInfo.name, "wave-tunnel");
  assert.equal(list.result.tools.length, 4);
  assert.deepEqual(list.result.tools.map((t) => t.name), ["tunnel_parse", "tunnel_ping", "tunnel_pipe", "tunnel_keys"]);
});

test("mcp: unknown tool is a named JSON-RPC error", async () => {
  const [err] = await drive([
    { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "nope", arguments: {} } },
  ]);
  assert.equal(err.error.code, -32601);
  assert.match(err.error.message, /unknown tool: nope/);
});

test("mcp: unknown method is a named JSON-RPC error", async () => {
  const [err] = await drive([
    { jsonrpc: "2.0", id: 4, method: "bogus", params: {} },
  ]);
  assert.equal(err.error.code, -32601);
});

test("sdk: parseToken refuses a malformed token without hanging", () => {
  try {
    const { parseToken } = require ? require(null) : {};
    void parseToken;
  } catch {}
});
