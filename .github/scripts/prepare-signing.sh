#!/usr/bin/env bash
set -euo pipefail
: "${TIRE_RELEASE_KEYSTORE_BASE64:?Missing fixed signing key}"
: "${TIRE_RELEASE_STORE_PASSWORD:?Missing signing password}"
umask 077
signing_dir="$(mktemp -d "$RUNNER_TEMP/tire-signing.XXXXXX")"
printf '%s' "$TIRE_RELEASE_KEYSTORE_BASE64" | base64 --decode > "$signing_dir/release.keystore"
echo "TIRE_RELEASE_STORE_FILE=$signing_dir/release.keystore" >> "$GITHUB_ENV"
