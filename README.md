# Personal website

A simple personal site built with Astro and deployed to GitHub Pages with GitHub Actions.

This repo is the main website only. It handles:

- the homepage
- the markdown blog
- the apps directory page

Each app should live in its own GitHub repo and deploy separately with its own GitHub Pages site.

## Local structure

- `src/content/blog/` holds markdown blog posts
- `src/layouts/` holds the shared Astro layouts
- `src/pages/` holds the website pages
- `src/styles/global.css` holds the site styling
- `src/pages/apps.astro` is the directory page for external apps

## Run locally

```bash
npm install
npm run dev
```

Astro will usually start at `http://localhost:4321`.

## Build for production

```bash
npm run build
```

The generated site is written to `dist/`.

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

Create a file in `src/content/blog/` named like:

```text
my-post-title.md
```

Use front matter like:

```md
---
title: My post title
description: A short summary for listings and metadata.
date: 2026-04-10
author: Ollie Olby
tags: ["tag-one", "tag-two"]
---
```

### Add a new app entry

Update the `apps` array in `src/pages/apps.astro` with the new app name, description, and live URL.
