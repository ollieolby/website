# Personal website

A simple personal site built with Eleventy and deployed to GitHub Pages with GitHub Actions.

This repo is the main website only. It handles:

- the homepage
- the markdown blog
- the apps directory page

Each app should live in its own GitHub repo and deploy separately with its own GitHub Pages site.

## Local structure

- `_posts/` holds blog posts written in Markdown
- `_includes/layouts/` holds shared Eleventy layouts
- `_data/site.json` holds site metadata
- `assets/css/` holds shared site styles
- `apps.md` is the directory page for external apps

## Run locally

This project uses a Node workflow:

```bash
npm install
npm run dev
```

Eleventy will start a local dev server, usually at `http://localhost:8080`.

Local development uses the root path `/`, while the GitHub Pages workflow injects the correct repository base path during deployment.

## Build for production

```bash
npm run build
```

The generated site is written to `_site/`.

## Publish on GitHub Pages

This repo includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

To enable deployment:

1. Push this repo to GitHub.
2. In GitHub, open `Settings` -> `Pages`.
3. Set `Source` to `GitHub Actions`.
4. Push to `main` to trigger deployment.

## Move to a custom domain later

When you're ready:

1. Add a `CNAME` file to the repo root containing your domain, for example `www.yourdomain.com`.
2. Update your DNS records with your domain provider.
3. Set the custom domain in GitHub Pages settings.

## Add content

### New blog post

Create a file in `_posts/` named like:

```text
2026-03-29-my-post-title.md
```

Use front matter like:

```md
---
title: My post title
excerpt: A short summary for listings and metadata.
layout: layouts/post.liquid
permalink: /blog/my-post-title/
---
```

### Add a new app entry

Update `apps.md` with:

```md
- app name
- short description
- link to the live GitHub Pages deployment
- optional link to the source repo
```
