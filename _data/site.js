function normalizeBasePath(value) {
  if (!value || value === "/") {
    return "";
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function fallbackBasePath() {
  const repo = process.env.GITHUB_REPOSITORY;

  if (!repo) {
    return "";
  }

  const [, repoName] = repo.split("/");

  if (!repoName || repoName.endsWith(".github.io")) {
    return "";
  }

  return `/${repoName}`;
}

module.exports = {
  title: "Ollie",
  description: "Personal site, writing, and small web experiments.",
  base_path: normalizeBasePath(process.env.BASE_PATH || fallbackBasePath()),
  asset_version: process.env.GITHUB_SHA || "dev"
};
