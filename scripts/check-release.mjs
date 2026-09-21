import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
const releaseTag = process.env.GITHUB_REF_NAME;

for (const file of ["main.js", "manifest.json", "styles.css"]) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required release asset: ${file}`);
  }
}

if (releaseTag && releaseTag !== manifest.version) {
  throw new Error(`Release tag ${releaseTag} must match manifest version ${manifest.version}.`);
}
