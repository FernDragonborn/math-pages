#!/usr/bin/env bash
# Copies the site to vionity: /srv/math is served by Caddy as math.45-145-224-180.sslip.io.
# Needs the SSH key and write access to /srv/math (group-writable for fern).
set -euo pipefail
cd "$(dirname "$0")"
KEY=${VIONITY_KEY:-W:/data/keys/vionity-fern}
git archive --format=tar HEAD -- index.html '*/' \
  | ssh -i "$KEY" -o IdentitiesOnly=yes fern@45.145.224.180 'tar -x -C /srv/math --no-same-owner --no-same-permissions'
