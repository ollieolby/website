# Personal website

A simple GitHub Pages-friendly site with:

- a homepage
- a markdown blog
- an `/apps/` area for small webapps

## Local structure

- `_posts/` holds blog posts written in Markdown
- `apps/` holds standalone app pages
- `assets/css/` holds shared styles
- `_layouts/` holds the site templates

## Run locally

If you have Ruby installed:

```bash
bundle install
bundle exec jekyll serve
```

Then open the local address Jekyll prints, usually `http://127.0.0.1:4000`.

## Publish on GitHub Pages

1. Create a GitHub repo from this folder.
2. Push the code to the default branch.
3. In GitHub, open `Settings` -> `Pages`.
4. Under `Build and deployment`, choose `Deploy from a branch`.
5. Select your default branch and the `/(root)` folder.

Because this project uses Jekyll in the standard GitHub Pages format, GitHub Pages will build it automatically.

## Move to a custom domain later

When you're ready:

1. Add a file named `CNAME` in the repo root containing your domain, for example `www.yourdomain.com`.
2. Update your DNS records at your domain provider.
3. Re-save the custom domain in GitHub Pages settings if needed.

## Add content

### New blog post

Create a file in `_posts/` named like:

```text
2026-03-29-my-post-title.md
```

### New app

Create a new page inside `apps/`, for example:

```text
apps/my-tool.html
```

Use front matter at the top so Jekyll applies the site layout:

```html
---
layout: page
title: My Tool
permalink: /apps/my-tool/
---
```
