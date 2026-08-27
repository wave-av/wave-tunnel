# The tunnel rail - story

## The one line

Your agent opens an encrypted pipe in one command. No account. No setup. The
address is a token; the token is the pipe.

## What shipped (receipts, not adjectives)

- Built tailcat from source for Apple Silicon (28 MB binary) in one container
  command. DERP map fetch proven live.
- `wave-tunnel` CLI: serve, dial, ping, ssh, key, parse. Five tests, all green.
- `@wave-av/tunnel-sdk`: TunnelServer, TunnelClient, parseToken. One method per
  CLI verb.
- `wave-tunnel-mcp`: agents open and probe tunnels with the same verbs.
- License: BSD-3. Connector pricing: free tier plus org subscription. Never
  per-byte.
- Skill `tailcat-tunnel-ops` so any agent runs this without asking.

## The five rails of one transport plane

WAVE now runs five transport rails, and each one earns its slot by what it is
best at:

| rail | what moves | why this rail |
|---|---|---|
| Anchor (network-sdk) | the governed network surface | audit, egress health, one published API |
| Mesh (mesh-coordinator) | devices on one flat network | WRT identity, NAT regardless, media devices |
| Tunnel (wave-tunnel) | agents and ephemeral machines | token pipes, zero control plane, zero root |
| Transports (SRT/NDI/OMT/Dante) | studio media | the native protocols, bound once |
| AoIP (aes67) | pro audio streams | the metered stream registry |

Cross-functional, the tunnel rail upgrades every product that moves bytes.
Voice, transcribe, captions, media, the codec, the mesh, the eval plane: each
one can now ask for a pipe and get one, on demand, without a control plane and
without a root shell. The token is the capability. The registry is the store.
The meter stays a connector meter: bytes ride the customer's own bandwidth, so
we never double-charge for what they already pay for.

## Who buys this

- **Teams running fleets of agents**: a pipe per task, gone when the task ends.
- **Platform builders**: the Go library and the SDK are the same primitive in
  two languages.
- **Ops teams that banned open ports**: the token is the port. Nothing listens
  until the token exists.

## The pitch

Five rails. One plane. The tunnel is the rail that says: if you can share a
line of text, you can share an encrypted pipe.
