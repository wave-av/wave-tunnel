# Licensing - wave-tunnel

## Upstream

- **tailcat** (tailscale/tailcat): BSD-3-Clause, open-sourced at TailscaleUp, Aug 2026. We build
  against it, we do not fork it. The WAVE CLI/SDK wraps the tailcat BINARY or its Go library; no
  upstream code is copied into this repo.
- **WireGuard-go / magicsock / netstack / DERP**: all consumed via the tailcat module; each is
  permissively licensed upstream (BSD/Apache-2.0-class). No GPL anywhere in the dependency graph.

## Ours

- **wave-tunnel** (this repo): BSD-3-Clause (see LICENSE). Free to use, modify, redistribute -
  including the built binaries.
- **The tunnel SERVICE** (gateway-minted tokens, the token registry, self-hosted relays): a WAVE
  connector product, governed by the connector law (meter-the-value-not-the-connector). Connector
  licensing:
  - **Free tier**: ephemeral tokens, rate-limited public-relay bootstrap, self-serve.
  - **Subscription** (per org, per relay region): saved keys, DNS-TXT publishing, allowlists,
    self-hosted DERP relay on WAVE infra, support.
  - **Never per-byte**: the tunnel is an on-ramp; bytes are the customer's own bandwidth. Per-byte
    billing would double-charge for what the customer already pays for elsewhere.
  - **COGS resale rule**: where we resell third-party relay/compute, price = COGS x ~1.4.

## What this means for the product line

The tunnel rail joins Anchor (network-sdk), Mesh (mesh-coordinator), Transports (SRT/NDI/OMT/Dante),
and AoIP (aes67) in ONE WAVE transport plane. Each rail keeps its own license posture; the plane's
common contract is the four renderings (API authority + CLI + SDK + MCP) and the token law.
