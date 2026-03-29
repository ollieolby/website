---
title: Home
layout: layouts/page.liquid
---

<section class="hero">
  <p class="eyebrow">Personal website</p>
  <h1>Writing here, apps linked from here.</h1>
  <p class="hero-copy">
    This site stays focused on two jobs: publishing markdown writing and acting as the
    front door to webapps that live in their own repositories.
  </p>
  <div class="hero-actions">
    <a class="button" href="{{ site.base_path }}/blog/">Read the blog</a>
    <a class="button button-secondary" href="{{ site.base_path }}/apps/">Browse apps</a>
  </div>
</section>

<section class="home-grid">
  <article class="card">
    <p class="eyebrow">Latest post</p>
    {% assign latest_post = collections.posts | first %}
    {% if latest_post %}
      <h2><a href="{{ site.base_path }}{{ latest_post.url }}">{{ latest_post.data.title }}</a></h2>
      <p>{{ latest_post.data.excerpt | strip_html | truncate: 140 }}</p>
    {% else %}
      <h2>No posts yet</h2>
      <p>Add your first markdown file in <code>_posts/</code> to get started.</p>
    {% endif %}
  </article>

  <article class="card">
    <p class="eyebrow">Apps</p>
    <h2>Use this site as the hub for separate app projects.</h2>
    <p>The <code>/apps/</code> page is now a directory that points visitors to standalone GitHub Pages apps.</p>
  </article>
</section>
