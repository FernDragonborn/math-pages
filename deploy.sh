#!/usr/bin/env bash
# Copies the site to vionity: /srv/math is served by Caddy as math.45-145-224-180.sslip.io.
# Replaces everything in /srv/math, so renamed or removed pages do not linger.
# docs/ is for maintainers and stays out of the site.
# Needs the SSH key and write access to /srv/math (group-writable for fern).
set -euo pipefail
cd "$(dirname "$0")"
KEY=${VIONITY_KEY:-W:/data/keys/vionity-fern}
git archive --format=tar HEAD -- index.html favicon.svg $(git ls-tree -d --name-only HEAD | grep -vx docs) \
  | ssh -i "$KEY" -o IdentitiesOnly=yes fern@45.145.224.180 'find /srv/math -mindepth 1 -delete && tar -x -C /srv/math --no-same-owner --no-same-permissions'
