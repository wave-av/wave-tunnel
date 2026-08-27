// @wave-av/tunnel-sdk - the SDK rendering of the tunnel plane (epic E2, scaffold).
//
// Maps 1:1 onto the CLI (and onto the API once E2's gateway routes land): every method
// here is one CLI verb, so the conservation-of-declaration gate holds across renderings.
// Tokens are capabilities: this SDK resolves them from the store, it never prints them.
import { execFileSync, spawn } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";

const TAILCAT = process.env.WAVE_TAILCAT_BIN || "tailcat";

export class TunnelServer {
  constructor({ ports = [], key = null, noAuthSsh = false, exitNode = false } = {}) {
    this.ports = ports;
    this.key = key;
    this.noAuthSsh = noAuthSsh;
    this.exitNode = exitNode;
    this.proc = null;
  }

  args() {
    const a = [];
    if (this.ports.length) a.push(`--serve=${this.ports.join(",")}`);
    if (this.noAuthSsh) a.push("--serve=no-auth-ssh");
    if (this.exitNode) a.push("--serve=exit-node");
    if (this.key && this.key !== "new") a.push(`--key=${this.key}`);
    if (this.key === "new") a.push("--key=new");
    return a;
  }

  /** Start listening. Resolves with the one-shot token line from the server. */
  start() {
    return new Promise((resolve, reject) => {
      this.proc = spawn(TAILCAT, this.args(), { stdio: ["ignore", "pipe", "pipe"] });
      let out = "";
      const timer = setTimeout(() => {
        this.proc.kill("SIGKILL");
        reject(new Error("tunnel server did not print a token within 20s"));
      }, 20000);
      this.proc.stderr.on("data", (d) => {
        out += d;
        const m = out.match(/tc[A-Za-z0-9_-]{30,}/);
        if (m) {
          clearTimeout(timer);
          resolve(m[0]);
        }
      });
      this.proc.on("error", (e) => {
        clearTimeout(timer);
        reject(e);
      });
      this.proc.on("exit", (code) => {
        clearTimeout(timer);
        if (code !== 0 && !out.includes("tc")) reject(new Error(`tailcat exited ${code}`));
      });
    });
  }

  close() {
    if (this.proc) this.proc.kill("SIGTERM");
  }
}

export class TunnelClient {
  constructor(token) {
    this.token = token;
  }

  /** Pipe stdin/stdout over the tunnel. Resolves when the pipe closes. */
  pipe(input = "") {
    return new Promise((resolve, reject) => {
      const p = spawn(TAILCAT, [this.token], { stdio: ["pipe", "pipe", "pipe"] });
      let out = "";
      p.stdout.on("data", (d) => (out += d));
      p.on("close", (code) => (code === 0 ? resolve(out) : reject(new Error(`tailcat exited ${code}`))));
      p.stdin.write(input);
      p.stdin.end();
    });
  }

  /** Dial a TCP port through the tunnel; returns a raw duplex handle for piping. */
  dial(port) {
    return spawn(TAILCAT, [this.token, String(port)], { stdio: ["pipe", "pipe", "pipe"] });
  }

  /** DERP-vs-direct path report. Resolves true when a direct path is proven. */
  async pingUntilDirect(timeoutMs = 10000) {
    try {
      execFileSync(TAILCAT, ["ping", "--until-direct", this.token], {
        stdio: "pipe",
        timeout: timeoutMs + 5000,
      });
      return true;
    } catch {
      return false;
    }
  }

  /** Shell over the tunnel. */
  ssh(cmd = []) {
    return spawn(TAILCAT, ["ssh", this.token, ...cmd], { stdio: "inherit" });
  }
}

/** Parse a token to JSON without connecting (the token law's read-only surface). */
export function parseToken(token) {
  return JSON.parse(
    execFileSync(TAILCAT, ["parse", token], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }),
  );
}

const storeDir = process.env.WAVE_TUNNEL_STORE || join(homedir(), ".wave-tunnel");

export function storeTokenPath(name) {
  return join(storeDir, `${name}.token`);
}
