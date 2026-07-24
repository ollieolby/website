import { existsSync } from "node:fs";
import { defineConfig } from "astro/config";

function hasCustomDomain() {
  if (process.env.CUSTOM_DOMAIN === "true") {
    return true;
  }

  return existsSync(new URL("./public/CNAME", import.meta.url));
}

function getSite() {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL;
  }

  if (hasCustomDomain()) {
    return "https://www.ollieolby.co.uk";
  }

  return "https://ollieolby.github.io";
}

function getBase() {
  if (hasCustomDomain()) {
    return "/";
  }

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
  site: getSite(),
  base: getBase(),
  vite: {
    server: {
      watch: {
        ignored: [
          "**/.git/**",
          "**/.astro/**",
          "**/dist/**",
          "**/_site/**",
          "**/_posts/**",
          "**/_includes/**",
          "**/_layouts/**",
          "**/apps/**",
          "**/assets/**",
          "**/.DS_Store"
        ]
      }
    }
  }
});
