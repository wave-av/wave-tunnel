#!/usr/bin/env node
// wave-tunnel MCP - the agent rendering of the tunnel plane (epic E3, scaffold).
// stdio JSON-RPC 2.0, dependency-free, same verbs as the CLI and SDK (conservation-
// of-declaration). Tokens never cross stdout: mint/list tools return handles only.
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const TAILCAT = process.env.WAVE_TAILCAT_BIN || "tailcat";
const STORE_DIR = process.env.WAVE_TUNNEL_STORE || join(homedir(), ".wave-tunnel");

const TOOLS = [
  { name: "tunnel_parse", description: "Read a connection token as JSON (no connection)", inputSchema: { type: "object", properties: { token: { type: "string" } }, required: ["token"] } },
  { name: "tunnel_ping", description: "Probe a tunnel; reports DERP vs direct path", inputSchema: { type: "object", properties: { token: { type: "string" } }, required: ["token"] } },
  { name: "tunnel_pipe", description: "Send stdin through the tunnel, return stdout", inputSchema: { type: "object", properties: { token: { type: "string" }, input: { type: "string" } }, required: ["token"] } },
  { name: "tunnel_keys", description: "List saved key names (handles only, never key material)", inputSchema: { type: "object", properties: {} } },
];

function rpc(id, result) {
  return JSON.stringify({ jsonrpc: "2.0", id, result });
}

function rpcErr(id, code, message) {
  return JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } });
}

function handle(req) {
  if (req.method === "initialize") return rpc(req.id, { protocolVersion: "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "wave-tunnel", version: "0.1.0" } });
  if (req.method === "tools/list") return rpc(req.id, { tools: TOOLS });
  if (req.method === "tools/call") {
    const { name, arguments: args } = req.params;
    try {
      switch (name) {
        case "tunnel_parse": return rpc(req.id, { content: [{ type: "text", text: execFileSync(TAILCAT, ["parse", args.token], { encoding: "utf8" }) }] });
        case "tunnel_ping": return rpc(req.id, { content: [{ type: "text", text: execFileSync(TAILCAT, ["ping", "--until-direct", args.token], { encoding: "utf8", timeout: 15000 }) }] });
        case "tunnel_pipe": return rpc(req.id, { content: [{ type: "text", text: execFileSync(TAILCAT, [args.token], { input: args.input || "", encoding: "utf8", timeout: 30000 }) }] });
        case "tunnel_keys": {
          const names = existsSync(STORE_DIR) ? readFileSync(join(STORE_DIR, ".."), "utf8") : "";
          void names;
          const out = execFileSync(TAILCAT, ["genkey", "--list"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
          return rpc(req.id, { content: [{ type: "text", text: out }] });
        }
        default: return rpcErr(req.id, -32601, `unknown tool: ${name}`);
      }
    } catch (e) {
      return rpcErr(req.id, -32000, `tool failed: ${e instanceof Error ? e.message.slice(0, 140) : e}`);
    }
  }
  if (req.method === "notifications/initialized") return null;
  return rpcErr(req.id, -32601, `unknown method: ${req.method}`);
}

process.stdin.setEncoding("utf8");
let buf = "";
process.stdin.on("data", (d) => {
  buf += d;
  let i;
  while ((i = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    try {
      const res = handle(JSON.parse(line));
      if (res !== null) process.stdout.write(res + "\n");
    } catch {
      process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }) + "\n");
    }
  }
});
