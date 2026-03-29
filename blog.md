---
title: Blog
permalink: /blog/
layout: layouts/page.liquid
---

# Blog

Markdown posts live in `_posts/` and appear here automatically.

{% if collections.posts.size > 0 %}
<div class="stack">
  {% for post in collections.posts %}
    <article class="card">
      <p class="post-meta">{{ post.date | date: "%-d %B %Y" }}</p>
      <h2><a href="{{ site.base_path }}{{ post.url }}">{{ post.data.title }}</a></h2>
      <p>{{ post.data.excerpt | strip_html | truncate: 180 }}</p>
    </article>
  {% endfor %}
</div>
{% else %}
No posts yet.
{% endif %}
