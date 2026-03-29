---
title: Blog
permalink: /blog/
---

# Blog

Markdown posts live in `_posts/` and appear here automatically.

{% if site.posts.size > 0 %}
<div class="stack">
  {% for post in site.posts %}
    <article class="card">
      <p class="post-meta">{{ post.date | date: "%-d %B %Y" }}</p>
      <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
      <p>{{ post.excerpt | strip_html | truncate: 180 }}</p>
    </article>
  {% endfor %}
</div>
{% else %}
No posts yet.
{% endif %}
