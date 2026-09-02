#!/usr/bin/env bash
set -euo pipefail

repo_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$repo_dir"

npm run test:web

version=$(node -p "require('./package.json').version")
case "$version" in
  *[!0-9.]*|.*|*.) echo "Invalid package version: $version" >&2; exit 1 ;;
esac

archive="anding-card-web-v${version}.zip"
stage_dir=$(mktemp -d)
trap 'rm -rf "$stage_dir"' EXIT

cp -R site/. "$stage_dir/"
(
  cd "$stage_dir"
  find . -exec touch -h -t 197001010000.00 {} +
  find . -type f | LC_ALL=C sort | sed 's|^\./||' \
    | zip -q -9 -X -o "$archive" -@
)

archive_path="$stage_dir/$archive"
unzip -tqq "$archive_path"

entries=$(unzip -Z1 "$archive_path")
for required in index.html manifest.webmanifest sw.js; do
  if ! printf '%s\n' "$entries" | grep -Fqx "$required"; then
    echo "Web release is missing $required" >&2
    exit 1
  fi
done

mkdir -p dist
install -m 0644 "$archive_path" "dist/$archive"
archive_sha=$(sha256sum "dist/$archive" | cut -d' ' -f1)
printf '%s  %s\n' "$archive_sha" "$archive" > "dist/${archive}.sha256"

printf 'Built dist/%s (%s bytes)\n' "$archive" "$(stat -c '%s' "dist/$archive")"
