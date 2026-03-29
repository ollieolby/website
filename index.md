---
title: Home
---

<section class="hero">
  <p class="eyebrow">Personal website</p>
  <h1>Writing and small web experiments in one place.</h1>
  <p class="hero-copy">
    This site is set up to stay simple: a markdown blog, a home for tiny webapps,
    and a structure that's easy to grow into your own domain later.
  </p>
  <div class="hero-actions">
    <a class="button" href="{{ '/blog/' | relative_url }}">Read the blog</a>
    <a class="button button-secondary" href="{{ '/apps/' | relative_url }}">Browse apps</a>
  </div>
</section>

<section class="home-grid">
  <article class="card">
    <p class="eyebrow">Latest post</p>
    {% assign latest_post = site.posts.first %}
    {% if latest_post %}
      <h2><a href="{{ latest_post.url | relative_url }}">{{ latest_post.title }}</a></h2>
      <p>{{ latest_post.excerpt | strip_html | truncate: 140 }}</p>
    {% else %}
      <h2>No posts yet</h2>
      <p>Add your first markdown file in <code>_posts/</code> to get started.</p>
    {% endif %}
  </article>

  <article class="card">
    <p class="eyebrow">Apps</p>
    <h2>Host small tools alongside your writing.</h2>
    <p>The <code>/apps/</code> section is ready for experiments, prototypes, and utility pages.</p>
  </article>
</section>
