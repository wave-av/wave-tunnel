# wave-tunnel

WAVE tunnel CLI — token-addressed, control-plane-free encrypted pipes on the
[tailcat](https://github.com/tailscale/tailcat) rail (BSD-3, no Tailscale control
plane, no account, no root, WireGuard end-to-end encryption with DERP NAT
traversal). Part of the `tailcat-tunnel-plane` epic (four renderings: API / CLI /
SDK / MCP); the API is the authority and this CLI maps 1:1 onto it once the API
lands.

## Install

```sh
npm install -g @wave-av/tunnel-cli
# plus the tailcat binary (go install github.com/tailscale/tailcat/cmd/tailcat@latest)
```

## Usage

```sh
wave-tunnel serve 8080      # listen; token printed ONCE
wave-tunnel dial <token> 8080
wave-tunnel ping <token>    # DERP-vs-direct path report
wave-tunnel ssh <token> ls -la
wave-tunnel key new default # saved key; stable address across restarts
wave-tunnel parse <token>   # token contents as JSON (no connection)
```

## Laws carried in

- **The token is the capability** — it never lands in git, logs, or transcripts;
  the registry is the token store (E2), and the store directory is gitignored.
- **Connector, not meter** — a tunnel is an on-ramp: subscription/free, never
  per-byte billing.
- **Ephemeral by default** — saved keys only where a stable address is required.
- **Self-hosted DERP first** — fleet traffic rides a WAVE derper before any prod
  use (epic hard-gate); the public relays are for probes only.

## Development

`node src/wave-tunnel.mjs --help` — dependency-free wrapper; `tailcat` resolved
from `WAVE_TAILCAT_BIN` or PATH. Exit codes: 0 success; 1 usage/tailcat failure;
2 store failure.
