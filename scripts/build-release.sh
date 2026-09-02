#!/usr/bin/env bash
set -euo pipefail

repo_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$repo_dir"

npm test

version=$(node -p "require('./package.json').version")
case "$version" in
  *[!0-9.]*|.*|*.) echo "Invalid package version: $version" >&2; exit 1 ;;
esac

archive="anding-card-v${version}.zip"
stage_dir=$(mktemp -d)
trap 'rm -rf "$stage_dir"' EXIT

mkdir -p "$stage_dir/src" "$stage_dir/assets" "$repo_dir/dist"
cp index.html styles.css "$stage_dir/"
cp src/app.js "$stage_dir/src/"
cp assets/icon.svg assets/icon-180.png assets/icon-192.png "$stage_dir/assets/"

(
  cd "$stage_dir"
  find . -exec touch -h -t 197001010000.00 {} +
  find . -type f | LC_ALL=C sort | sed 's|^\./||' \
    | zip -q -9 -X -o "$archive" -@
)

archive_path="$stage_dir/$archive"
archive_bytes=$(stat -c '%s' "$archive_path")
limit_bytes=$((10 * 1024 * 1024))
if (( archive_bytes > limit_bytes )); then
  echo "Release archive exceeds 10 MiB: $archive_bytes bytes" >&2
  exit 1
fi

index_count=0
file_count=0
while IFS= read -r entry; do
  case "$entry" in
    /*|../*|*/../*|*/..) echo "Unsafe zip path: $entry" >&2; exit 1 ;;
  esac
  case "$entry" in
    */) continue ;;
    index.html) index_count=$((index_count + 1)) ;;
    *.css|*.js|*.png|*.jpg|*.jpeg|*.gif|*.webp|*.svg|*.woff|*.woff2|*.json) ;;
    *.html) echo "Only root index.html is allowed: $entry" >&2; exit 1 ;;
    *) echo "Unsupported file type in release zip: $entry" >&2; exit 1 ;;
  esac
  case "$entry" in
    node_modules/*|*/node_modules/*|.git/*|*/.git/*|*.map|*.DS_Store)
      echo "Development artifact in release zip: $entry" >&2
      exit 1
      ;;
  esac
  file_count=$((file_count + 1))
done < <(unzip -Z1 "$archive_path")

if (( index_count != 1 )); then
  echo "Release zip must contain exactly one root index.html; found $index_count" >&2
  exit 1
fi

unzip -tqq "$archive_path"
install -m 0644 "$archive_path" "$repo_dir/dist/$archive"
install -m 0644 assets/icon-1024.png "$repo_dir/dist/anding-card-icon-1024.png"

archive_sha=$(sha256sum "$repo_dir/dist/$archive" | cut -d' ' -f1)
icon_sha=$(sha256sum "$repo_dir/dist/anding-card-icon-1024.png" | cut -d' ' -f1)
node scripts/write-artifact.cjs \
  "$version" "$archive" "$archive_bytes" "$archive_sha" "$icon_sha" "$file_count"

printf 'Built dist/%s (%s bytes, %s files)\n' "$archive" "$archive_bytes" "$file_count"
