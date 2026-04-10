import { defineConfig } from "astro/config";

function getBase() {
  if (process.env.BASE_PATH) {
    return process.env.BASE_PATH;
  }

  const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];

  if (!repo || repo.endsWith(".github.io")) {
    return "/";
  }

  return `/${repo}`;
}

export default defineConfig({
  site: "https://ollieolby.github.io",
  base: getBase()
});
