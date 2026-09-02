const fs = require("node:fs");

const [version, archive, bytes, sha256, iconSha256, files] = process.argv.slice(2);
if (![version, archive, bytes, sha256, iconSha256, files].every(Boolean)) {
  throw new Error("write-artifact.cjs requires version, archive, bytes, two hashes, and file count");
}

const artifact = {
  version,
  archive,
  bytes: Number(bytes),
  mib: (Number(bytes) / 1024 / 1024).toFixed(2),
  sha256,
  icon: "anding-card-icon-1024.png",
  iconSha256,
  files: Number(files),
};

fs.writeFileSync("dist/artifact.json", `${JSON.stringify(artifact, null, 2)}\n`);
