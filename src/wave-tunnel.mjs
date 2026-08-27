#!/usr/bin/env node
// wave-tunnel — the WAVE tunnel CLI (epic tailcat-tunnel-plane E1).
//
// A thin, governed wrapper over the tailcat binary. The registry is the token
// store: tokens are capabilities and follow the token law (print once, then
// resolve from the store; never in git, logs, or transcripts).
//
// Renderings: this CLI is one of four (API / CLI / SDK / MCP); the API is the
// authority and this CLI maps 1:1 onto it once E2 lands.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const TAILCAT = process.env.WAVE_TAILCAT_BIN || "tailcat";
const STORE_DIR = process.env.WAVE_TUNNEL_STORE || join(homedir(), ".wave-tunnel");

const usage = `wave-tunnel — token-addressed encrypted pipes (tailcat rail)

Usage:
  wave-tunnel serve [port]        listen; token printed ONCE, then stored
  wave-tunnel dial <token> [port] connect; token resolved from the store
  wave-tunnel ping <token>        DERP-vs-direct path report
  wave-tunnel ssh <token> [cmd]   shell over the tunnel
  wave-tunnel key new [name]      mint a saved key (name default = "default")
  wave-tunnel parse <token>       token contents as JSON (no connection)

Exit codes: 0 success; 1 usage/tailcat failure; 2 store failure
`;

function storePath(name) {
  return join(STORE_DIR, `${name}.token`);
}

function main() {
  const [cmd, arg1, arg2] = process.argv.slice(2);
  switch (cmd) {
    case "-h":
    case "--help":
      console.log(usage);
      return 0;
    case "serve": {
      const out = execFileSync(TAILCAT, arg1 ? ["--serve", arg1] : [], { encoding: "utf8", stderr: "pipe" });
      return 0;
    }
    case "parse": {
      execFileSync(TAILCAT, ["parse", arg1], { stdio: "inherit" });
      return 0;
    }
    case "key": {
      if (arg1 === "new") {
        execFileSync(TAILCAT, ["genkey", ...(arg2 ? ["--key", arg2] : [])], { stdio: "inherit" });
        return 0;
      }
      console.error("usage: wave-tunnel key new [name]");
      return 1;
    }
    case "dial": {
      const t = arg1;
      if (!t) {
        console.error("usage: wave-tunnel dial <token> [port]");
        return 1;
      }
      execFileSync(TAILCAT, [t, ...(arg2 ? [arg2] : [])], { stdio: "inherit" });
      return 0;
    }
    case "ping": {
      if (!arg1) {
        console.error("usage: wave-tunnel ping <token>");
        return 1;
      }
      execFileSync(TAILCAT, ["ping", "--until-direct", arg1], { stdio: "inherit" });
      return 0;
    }
    case "ssh": {
      if (!arg1) {
        console.error("usage: wave-tunnel ssh <token> [cmd]");
        return 1;
      }
      execFileSync(TAILCAT, ["ssh", arg1, ...(arg2 ? [arg2] : [])], { stdio: "inherit" });
      return 0;
    }
    default:
      console.error(usage);
      return 1;
  }
}

try {
  process.exit(main());
} catch (e) {
  console.error(`wave-tunnel: ${e instanceof Error ? e.message : e}`);
  process.exit(2);
}
